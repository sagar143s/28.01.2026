export default function WalletDetailsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">Wallet Rules</h1>
        <ul className="list-disc pl-5 text-slate-700 space-y-2">
          <li>New register: 50 coins free bonus</li>
          <li>Earn: For every ₹100 delivered order, you get 10 coins</li>
          <li>Redeem: 10 coins = ₹5 on next order</li>
          <li>Coins are added only after order status is DELIVERED</li>
        </ul>
      </div>
    </div>
  );
}
