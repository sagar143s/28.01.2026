'use client'


import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { auth, googleProvider } from '@/lib/firebase'
import { signInWithPopup } from 'firebase/auth'

export default function SignInClient() {
  const params = useSearchParams()
  const router = useRouter()
  const [redirect, setRedirect] = useState('/')

  useEffect(() => {
    const redirectUrl = params.get('redirect_to') || '/'
    setRedirect(redirectUrl)
  }, [params])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      router.push(redirect)
    } catch (err) {
      alert('Sign-in failed: ' + (err?.message || err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Sign in</h1>
        <p className="text-gray-600 mb-4">Sign in with your email or Google account.</p>
        <button className="inline-block px-5 py-2 bg-orange-600 text-white rounded-lg" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
