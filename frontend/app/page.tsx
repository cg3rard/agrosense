'use client';

import { useState } from 'react';

interface AIResponse {
  diagnosis: string;
  action: string;
  costEstimate: number;
  roiStatus: 'Positive' | 'Negative' | 'Neutral';
  itemName: string;
}

interface ExpenseLog {
  id: string;
  item_name: string;
  cost: number;
  timestamp: string;
}

export default function AgroSenseDashboard() {
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput && !imageFile) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      if (textInput) formData.append('text', textInput);
      if (imageFile) formData.append('image', imageFile);

      // Dummy fetch - replace with actual FastAPI endpoint
      // const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: formData });
      // const data = await res.json();
      
      // Mock Data for UI testing
      setTimeout(() => {
        setAiResult({
          diagnosis: 'Bercak Daun Cerkospora (Cercospora capsici)',
          action: 'Semprotkan fungisida berbahan aktif Mankozeb atau Difenokonazol.',
          costEstimate: 150000,
          roiStatus: 'Positive',
          itemName: 'Fungisida Mankozeb 1L'
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleLogExpense = async () => {
    if (!aiResult) return;
    setLogLoading(true);
    try {
      const payload = {
        item_name: aiResult.itemName,
        cost: aiResult.costEstimate,
        timestamp: new Date().toISOString()
      };
      
      // Dummy fetch - replace with actual FastAPI endpoint
      // await fetch('http://localhost:8000/transaction', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      setExpenses(prev => [...prev, { id: Math.random().toString(), ...payload }]);
      setAiResult(null);
      setTextInput('');
      setImageFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-6 font-sans text-emerald-950">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-800">AgroSense Dashboard</h1>
        <p className="text-emerald-600">AI Chief Agronomist & Financial OS</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat / Analysis Component */}
        <section className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-700">Diagnosis Tanaman</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Foto Fisik Tanaman</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-emerald-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Keluhan / Gejala Tambahan</label>
              <textarea 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full rounded-lg border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 p-3 bg-emerald-50/50"
                rows={3}
                placeholder="Contoh: Daun menguning sejak 3 hari lalu..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Menganalisis...' : 'Analisis dengan AI'}
            </button>
          </form>

          {aiResult && (
            <div className="mt-6 p-5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
              <div>
                <span className="block text-xs font-semibold text-emerald-500 uppercase tracking-wider">Diagnosis</span>
                <p className="font-medium">{aiResult.diagnosis}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-emerald-500 uppercase tracking-wider">Rekomendasi Tindakan</span>
                <p>{aiResult.action}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-emerald-200 mt-3">
                <div>
                  <span className="block text-xs font-semibold text-emerald-500 uppercase tracking-wider">Estimasi Biaya</span>
                  <p className="font-bold text-lg">Rp {aiResult.costEstimate.toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold text-emerald-500 uppercase tracking-wider">ROI Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${aiResult.roiStatus === 'Positive' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {aiResult.roiStatus}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleLogExpense}
                disabled={logLoading}
                className="w-full mt-4 bg-emerald-800 text-white py-2 rounded-lg font-medium hover:bg-emerald-900 transition disabled:opacity-50"
              >
                {logLoading ? 'Mencatat...' : 'Beli & Catat Pengeluaran'}
              </button>
            </div>
          )}
        </section>

        {/* Finance / Tracking Component */}
        <section className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-700">Buku Kas Operasional</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-emerald-100 text-emerald-600 text-sm">
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Item Penanganan</th>
                  <th className="pb-3 font-semibold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-emerald-400 italic">
                      Belum ada transaksi tercatat.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-emerald-50 last:border-0">
                      <td className="py-3 text-emerald-500">{new Date(expense.timestamp).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 font-medium">{expense.item_name}</td>
                      <td className="py-3 text-right font-semibold text-red-600">
                        - Rp {expense.cost.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-emerald-800 text-white rounded-lg flex justify-between items-center">
            <span className="font-medium">Total Pengeluaran AI</span>
            <span className="text-xl font-bold">
              Rp {expenses.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString('id-ID')}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}