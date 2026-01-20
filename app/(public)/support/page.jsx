'use client'

export default function SupportPage() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 min-h-[60vh]">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
        <p className="text-gray-600 mb-8">Were here to help. Choose an option below or email us at <a href="mailto:support@QuickFynd.com" className="text-orange-600 underline">support@QuickFynd.com</a>.</p>

        <div className="grid gap-4">
          <a href="/faq" className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
            <h2 className="font-semibold text-gray-900">Read FAQs</h2>
            <p className="text-gray-600 text-sm mt-1">Quick answers to common questions.</p>
          </a>
          <a href="mailto:support@QuickFynd.com" className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
            <h2 className="font-semibold text-gray-900">Email Support</h2>
            <p className="text-gray-600 text-sm mt-1">We typically reply within 24048 hours.</p>
          </a>
          <a href="/return-policy" className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
            <h2 className="font-semibold text-gray-900">Return & Replacement Policy</h2>
            <p className="text-gray-600 text-sm mt-1">Understand eligibility and timelines.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
