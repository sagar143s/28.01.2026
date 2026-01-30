import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Image from 'next/image';
import GoogleIcon from '../assets/google.png';
import Imageslider from '../assets/signin/76.webp';
import axios from 'axios';
import { countryCodes } from '../assets/countryCodes';

const SignInModal = ({ open, onClose, defaultMode = 'login', bonusMessage = '' }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setScrollPos(prev => (prev + 1) % 2000);
    }, 10);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (open) {
      setIsRegister(defaultMode === 'register');
    }
  }, [open, defaultMode]);

  if (!open) return null;

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const trackLoginLocation = async (token) => {
    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
      await axios.post('/api/users/track-location', {
        pageUrl
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      // Non-blocking
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Google sign-in clicked');
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      // Check if welcome bonus was claimed from top bar
      const bonusClaimed = localStorage.getItem('welcomeBonusClaimed');
      if (bonusClaimed === 'true') {
        // Mark user as eligible for free shipping on first order
        localStorage.setItem('freeShippingEligible', 'true');
        localStorage.removeItem('welcomeBonusClaimed');
      }
      
      // Send appropriate email based on whether user is new or returning
      try {
        const token = await result.user.getIdToken();
        await trackLoginLocation(token);
        if (isNewUser) {
          await axios.post('/api/wallet/bonus', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        const emailEndpoint = isNewUser ? '/api/send-welcome-email' : '/api/send-login-email';
        axios.post(emailEndpoint, {
          email: result.user.email,
          name: result.user.displayName
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).catch(() => {
          // Silently fail
        });
      } catch (emailError) {
        console.log('Failed to send email (non-critical)');
      }
      
      onClose();
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err?.message || 'Google sign-in failed');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister) {
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }

        try {
          const token = await userCredential.user.getIdToken();
          await trackLoginLocation(token);
          await axios.post('/api/wallet/bonus', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.warn('[wallet bonus] failed:', err?.response?.data || err.message);
        }
        
        // Check if welcome bonus was claimed from top bar
        const bonusClaimed = localStorage.getItem('welcomeBonusClaimed');
        if (bonusClaimed === 'true') {
          // Mark user as eligible for free shipping on first order
          localStorage.setItem('freeShippingEligible', 'true');
          localStorage.removeItem('welcomeBonusClaimed');
        }
        
        // Send welcome email for new registrations
        try {
          const token = await userCredential.user.getIdToken();
          await axios.post('/api/send-welcome-email', {
            email: email,
            name: name
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the signup if email fails
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Send login notification email in background
        try {
          const token = await userCredential.user.getIdToken();
          await trackLoginLocation(token);
          axios.post('/api/send-login-email', {
            email: email,
            name: userCredential.user.displayName || name || 'Customer'
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }).catch(() => {
            // Silently fail - don't block login
          });
        } catch (emailError) {
          console.log('Failed to send login email (non-critical)');
        }
      }
      onClose();
    } catch (err) {
      // User-friendly error messages
      let errorMessage = 'Authentication failed';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in or use a different email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Section - Image */}
        <div className="w-full bg-gradient-to-br from-amber-200 via-amber-100 to-yellow-100 relative overflow-hidden h-32 sm:h-40">
          {/* Image Container - Continuous Scrolling */}
          <div 
            className="absolute inset-0 flex"
            style={{
              transform: `translateX(-${scrollPos}px)`,
              transition: 'none',
              willChange: 'transform'
            }}
          >
            {/* Render image twice for seamless loop */}
            <div style={{ width: '2000px', height: '100%', flexShrink: 0, position: 'relative' }}>
              <Image
                src={Imageslider}
                alt="Sign In 1"
                width={2000}
                height={320}
                style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                priority
                unoptimized
              />
            </div>
            <div style={{ width: '2000px', height: '100%', flexShrink: 0, position: 'relative' }}>
              <Image
                src={Imageslider}
                alt="Sign In 2"
                width={2000}
                height={320}
                style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                priority
                unoptimized
              />
            </div>
          </div>
          
          {/* Decorative circles */}
          {/* <div className="absolute top-4 left-4 w-8 h-8 bg-green-400 rounded-full opacity-40 z-10" /> */}
          {/* <div className="absolute bottom-4 right-4 w-12 h-12 bg-pink-300 rounded-full opacity-40 z-10" /> */}
        </div>

        {/* Bottom Section - Form */}
        <div className="w-full p-4 sm:p-6 relative">
          <button
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Hala! Let's get started</h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Create account or sign in to your account</p>

          {bonusMessage && isRegister && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {bonusMessage}
            </div>
          )}

          {/* Tab Buttons */}
          <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold transition text-sm ${
                !isRegister
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold transition text-sm ${
                isRegister
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-2.5 sm:gap-3" onSubmit={handleSubmit}>
            {isRegister && (
              <input
                type="text"
                placeholder="Full Name"
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            )}
            {isRegister && (
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm w-24"
                  required
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            )}
            <input
              type={isRegister ? "email" : "text"}
              placeholder={isRegister ? "Email" : "Email or mobile number"}
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm w-full"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isRegister && (
              <input
                type="password"
                placeholder="Confirm Password"
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            )}
            
            {error && (
              <div className="text-red-500 text-xs sm:text-sm bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 sm:py-2.5 rounded-lg transition text-xs sm:text-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'CONTINUE'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-3 my-3 sm:my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-lg py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium bg-white hover:bg-gray-50 transition mb-3 sm:mb-5"
            disabled={loading}
          >
            <Image src={GoogleIcon} alt="Google" width={16} height={16} style={{objectFit:'contain'}} />
            <span className="text-gray-700">Continue with Google</span>
          </button>

          {/* Terms & Privacy */}
          <p className="text-xs text-gray-500 text-center">
            By continuing, I confirm that I have read the{' '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
