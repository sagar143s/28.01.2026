'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

import Loading from '@/components/Loading'
import Link from 'next/link'
import DashboardSidebar from '@/components/DashboardSidebar'

export default function SettingsPage() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null))
    return () => unsub()
  }, [])

  if (user === undefined) return <Loading />

  if (user === null) {
    return (
      <>
        {/* <Navbar /> removed, now global via ClientLayout */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold text-slate-800 mb-3">Account Settings</h1>
          <p className="text-slate-600 mb-6">Please sign in to access your account settings.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Home</Link>
        </div>
        {/* <Footer /> removed, now global via ClientLayout */}
      </>
    )
  }

  return (
    <>
      {/* <Navbar /> removed, now global via ClientLayout */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardSidebar />
        <main className="md:col-span-3">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">Account Settings</h1>
          
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-slate-700">Email notifications for orders</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-slate-700">Promotional emails</span>
                </label>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Privacy</h2>
              <p className="text-slate-600 text-sm mb-4">Control how your data is used and shared.</p>
              <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                Manage Privacy Settings
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Danger Zone</h2>
              <p className="text-slate-600 text-sm mb-4">Permanently delete your account and all associated data.</p>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>
      {/* <Footer /> removed, now global via ClientLayout */}
    </>
  )
}
