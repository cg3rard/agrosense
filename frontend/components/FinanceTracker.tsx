"use client";

import { useState, useEffect } from "react";
import { AnalyzeResponse, TransactionResponse } from "@/types";

const API_BASE = "http://localhost:8000";

interface FinanceTrackerProps {
  pendingAnalysis: AnalyzeResponse | null;
  onExpenseLogged: () => void;
}

function StatusBadge({ roi }: { roi: string }) {
  const lower = roi.toLowerCase();
  const positive = lower.includes("positive") || lower.includes("good");
  const negative = lower.includes("negative") || lower.includes("poor");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        positive
          ? "bg-green-100 text-green-700"
          : negative
            ? "bg-red-100 text-red-600"
            : "bg-amber-100 text-amber-700"
      }`}
    >
      {roi}
    </span>
  );
}

export default function FinanceTracker({
  pendingAnalysis,
  onExpenseLogged,
}: FinanceTrackerProps) {
  const [expenses, setExpenses] = useState<TransactionResponse[]>([]);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Persist expenses in sessionStorage so they survive re-renders
  useEffect(() => {
    const stored = sessionStorage.getItem("agrosense_expenses");
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  const persistExpenses = (updated: TransactionResponse[]) => {
    setExpenses(updated);
    sessionStorage.setItem("agrosense_expenses", JSON.stringify(updated));
  };

  const logExpense = async () => {
    if (!pendingAnalysis) return;
    setError(null);
    setSuccessMsg(null);
    setLogging(true);

    try {
      const res = await fetch(`${API_BASE}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: pendingAnalysis.recommended_action,
          cost: pendingAnalysis.cost_estimate,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.detail ?? `Error ${res.status}`);
      }
      const data: TransactionResponse = await res.json();
      persistExpenses([data, ...expenses]);
      setSuccessMsg("Expense logged successfully.");
      onExpenseLogged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLogging(false);
    }
  };

  const totalCost = expenses.reduce((sum, e) => sum + e.cost, 0);

  return (
    <section className="rounded-2xl border border-green-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white text-lg">
            💰
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Finance Tracker</h2>
            <p className="text-xs text-gray-500">Log and review crop expenses</p>
          </div>
        </div>
        {expenses.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-base font-bold text-green-800">${totalCost.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Pending recommendation banner */}
      {pendingAnalysis && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs text-green-700 font-medium mb-1">Pending recommendation</p>
          <p className="text-sm text-gray-800 mb-1">{pendingAnalysis.recommended_action}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-900">
                ${pendingAnalysis.cost_estimate.toFixed(2)}
              </span>
              <StatusBadge roi={pendingAnalysis.roi_status} />
            </div>
            <button
              onClick={logExpense}
              disabled={logging}
              className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-60 transition-colors"
            >
              {logging ? "Logging…" : "Log Expense"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
          ✓ {successMsg}
        </p>
      )}

      {/* Expense table */}
      {expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
          <p className="text-sm text-gray-400">No expenses logged yet.</p>
          <p className="text-xs text-gray-300 mt-1">
            Run an analysis and log the recommended action.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-50 text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-green-800 uppercase tracking-wide">
                  Item / Action
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-green-800 uppercase tracking-wide text-right">
                  Cost
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-green-800 uppercase tracking-wide hidden sm:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-green-50/40 transition-colors">
                  <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">
                    {exp.item_name}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-900">
                    ${exp.cost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(exp.timestamp).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-green-50 border-t border-green-200">
                <td className="px-4 py-2.5 text-xs font-semibold text-green-800 uppercase">
                  Total
                </td>
                <td className="px-4 py-2.5 text-right text-base font-bold text-green-900">
                  ${totalCost.toFixed(2)}
                </td>
                <td className="hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
