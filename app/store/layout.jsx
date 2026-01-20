'use client'
import StoreLayout from "@/components/store/StoreLayout";

import { ImageKitContext } from 'imagekitio-next'
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function RootAdminLayout({ children }) {
    const { user, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    console.log('[layout.jsx] mounted:', mounted, 'loading:', loading, 'user:', user);

    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

    useEffect(() => {
        setMounted(true)
    }, [])

    const authenticator = async () => {
        try {
            const response = await fetch('/api/imagekit-auth')
            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Request failed with status ${response.status}: ${errorText}`)
            }
            const data = await response.json()
            const { signature, expire, token } = data
            return { signature, expire, token }
        } catch (error) {
            throw new Error(`Authentication request failed: ${error.message}`)
        }
    }


    // Prevent hydration mismatch
    if (!mounted || loading) {
        return null;
    }

    if (!user) {
        const handleGoogleSignIn = async () => {
            try {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } catch (error) {
                alert('Sign in failed: ' + error.message);
            }
        };
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <span>Please sign in to continue.</span>
                <button
                    onClick={handleGoogleSignIn}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <ImageKitContext.Provider value={{ publicKey, urlEndpoint, authenticator }}>
            <StoreLayout>
                {children}
            </StoreLayout>
        </ImageKitContext.Provider>
    );
}
