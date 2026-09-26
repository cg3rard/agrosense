import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON in request body.' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[/api/transaction POST] Backend unreachable:', err);
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
    console.error('[/api/transaction POST] Non-JSON response from backend:', text.slice(0, 200));
    return NextResponse.json(
      { detail: 'Backend returned a non-JSON response.', raw: text.slice(0, 200) },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: upstream.status });
}

export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/transactions`);
  } catch (err) {
    console.error('[/api/transaction GET] Backend unreachable:', err);
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
    console.error('[/api/transaction GET] Non-JSON response from backend:', text.slice(0, 200));
    return NextResponse.json(
      { detail: 'Backend returned a non-JSON response.', raw: text.slice(0, 200) },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: upstream.status });
}
