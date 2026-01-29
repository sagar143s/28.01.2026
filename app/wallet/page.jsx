"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function WalletPage() {
  const { user, loading, getToken } = useAuth();
  const [wallet, setWallet] = useState({ coins: 0, rupeesValue: 0, transactions: [] });
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      if (!user || !getToken) return;
      try {
        setFetching(true);
        const token = await getToken();
        const res = await fetch("/api/wallet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "Failed to load wallet.");
          return;
        }
        setWallet({
          coins: data.coins || 0,
          rupeesValue: data.rupeesValue || 0,
          transactions: data.transactions || [],
        });
      } catch (e) {
        setError(e?.message || "Failed to load wallet.");
      } finally {
        setFetching(false);
      }
    };
    loadWallet();
  }, [user, getToken]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-600">Please sign in to view your wallet.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Wallet</h1>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Coins</p>
              <p className="text-3xl font-bold text-slate-900">{wallet.coins}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Value</p>
              <p className="text-2xl font-semibold text-slate-900">₹ {wallet.rupeesValue}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Earn 10 coins for every ₹100 delivered. Redeem 10 coins for ₹5.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Transactions</h2>
          {fetching && <div className="text-slate-500 text-sm">Loading...</div>}
          {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
          {!fetching && wallet.transactions.length === 0 && (
            <div className="text-slate-500 text-sm">No wallet activity yet.</div>
          )}
          <ul className="divide-y">
            {wallet.transactions.map((t, idx) => (
              <li key={`${t.orderId || "tx"}-${idx}`} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {t.type === "EARN" ? "Earned" : "Redeemed"} {t.coins} coins
                  </p>
                  <p className="text-xs text-slate-500">Order: {t.orderId || "-"}</p>
                </div>
                <div className={`text-sm font-semibold ${t.type === "EARN" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === "EARN" ? "+" : "-"}₹ {t.rupees}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
