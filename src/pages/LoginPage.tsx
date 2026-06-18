import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

export function LoginPage() {
  const {
    email,
    loading: authLoading,
    error: authError,
    step,
    checkEmail,
    prepareRegister,
    verifyOtpCode,
    setStep,
  } = useAuth()

  const [emailInput, setEmailInput] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [registerForm, setRegisterForm] = useState({
    Name: '',
    Phone: '',
    Occupation: '',
    City: '',
  })

  // Sync email input
  useEffect(() => {
    if (email) {
      setEmailInput(email)
    }
  }, [email])

  // Reset OTP input when step changes
  useEffect(() => {
    setOtpInput('')
  }, [step])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return
    checkEmail(emailInput.trim())
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpInput.length !== 6) return
    await verifyOtpCode(otpInput)
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.Name || !registerForm.Phone || !registerForm.Occupation || !registerForm.City) {
      return
    }
    prepareRegister({
      Email: email,
      ...registerForm,
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden font-sans select-none">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      {/* Auth Screen Card Layout */}
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* Step 1: Request Email */}
        {step === 'email' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Expense Tracker Workspace</h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Enter your email address to access your secure ledger.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={authLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-650 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading || !emailInput}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification for Login */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <button
                onClick={() => setStep('email')}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">Verify Code</h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                We found your account! We emailed a 6-digit OTP code to <strong className="text-zinc-200">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    disabled={authLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/80 rounded-lg text-sm tracking-widest font-mono text-zinc-100 placeholder-zinc-750 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading || otpInput.length !== 6}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Log In'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Register Form */}
        {step === 'register' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <button
                onClick={() => setStep('email')}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">Create Account</h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Register your account email to start tracking your records.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={registerForm.Name}
                    onChange={(e) => setRegisterForm({ ...registerForm, Name: e.target.value })}
                    disabled={authLoading}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-750 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    placeholder="919876543210"
                    value={registerForm.Phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, Phone: e.target.value })}
                    disabled={authLoading}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Occupation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Software Engineer"
                    value={registerForm.Occupation}
                    onChange={(e) => setRegisterForm({ ...registerForm, Occupation: e.target.value })}
                    disabled={authLoading}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={registerForm.City}
                    onChange={(e) => setRegisterForm({ ...registerForm, City: e.target.value })}
                    disabled={authLoading}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5 opacity-60">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 focus:outline-none"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Send Registration OTP'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: OTP Verification for Registration */}
        {step === 'register-otp' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <button
                onClick={() => setStep('register')}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">Verify Registration</h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                We sent a 6-digit verification code to <strong className="text-zinc-200">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                  Registration OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    disabled={authLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/80 rounded-lg text-sm tracking-widest font-mono text-zinc-100 placeholder-zinc-750 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading || otpInput.length !== 6}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Complete Registration'
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
