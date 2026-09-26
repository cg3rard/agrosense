import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  // The browser sends multipart/form-data with a proper boundary.
  // We forward the raw body and Content-Type header as-is so the
  // FastAPI UploadFile/Form parser receives an intact multipart stream.
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ detail: 'Invalid or missing form data.' }, { status: 400 });
  }

  // Rebuild the FormData to forward to the backend.
  // We cannot simply pipe req.body because Next.js has already consumed it.
  const outForm = new FormData();
  for (const [key, value] of formData.entries()) {
    outForm.append(key, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/analyze`, {
      method: 'POST',
      // Do NOT set Content-Type — fetch sets the correct multipart boundary automatically.
      body: outForm,
    });
  } catch (err) {
    console.error('[/api/analyze] Backend unreachable:', err);
    return NextResponse.json(
      { detail: `Backend unreachable at ${BACKEND}. Is the FastAPI server running?` },
      { status: 503 },
    );
  }

  const text = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('[/api/analyze] Non-JSON response from backend:', text.slice(0, 200));
    return NextResponse.json(
      { detail: 'Backend returned a non-JSON response.', raw: text.slice(0, 200) },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: upstream.status });
}
