import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLedger } from '../hooks/useLedger'
import {
  User,
  Phone,
  Briefcase,
  MapPin,
  Mail,
  IndianRupee,
  UserCheck,
  Loader2,
  AlertCircle,
  Home,
  Globe,
  Map,
  Hash
} from 'lucide-react'
import { useLocation } from 'react-router-dom'

export function ProfilePage() {
  const {
    user,
    loading: authLoading,
    error: authError,
    updateStartingBalance,
    updateProfile,
  } = useAuth()

  const {
    loading: ledgerLoading,
    error: ledgerError,
    setBalance,
  } = useLedger()

  const location = useLocation()
  const hasWarning = location.state?.balanceWarning

  const [initialBalanceInput, setInitialBalanceInput] = useState('')
  const [profileForm, setProfileForm] = useState({
    Name: '',
    Phone: '',
    Occupation: '',
    City: '',
    Address: '',
    Zipcode: '',
    State: '',
    Country: '',
    Balance: 0,
  })
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false)

  // Sync profile details
  useEffect(() => {
    if (user) {
      setProfileForm({
        Name: user.Name || '',
        Phone: user.Phone || '',
        Occupation: user.Occupation || '',
        City: user.City || '',
        Address: user.Address || '',
        Zipcode: user.Zipcode || '',
        State: user.State || '',
        Country: user.Country || '',
        Balance: user.Balance || 0,
      })
    }
  }, [user])

  const isGlobalLoading = authLoading || ledgerLoading
  const globalError = authError || ledgerError

  const handleSetInitialBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(initialBalanceInput)
    if (isNaN(amt)) return

    const success = await updateStartingBalance(amt)
    if (success) {
      setBalance(amt)
      setInitialBalanceInput('')
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Update balance if it was edited
    const updatedBalance = profileForm.Balance
    let balanceSuccess = true
    if (updatedBalance !== user?.Balance) {
      balanceSuccess = await updateStartingBalance(updatedBalance)
      if (balanceSuccess) {
        setBalance(updatedBalance)
      }
    }

    // 2. Update the rest of the profile fields
    if (balanceSuccess) {
      const { Balance, ...profileFields } = profileForm
      const success = await updateProfile(profileFields)
      if (success) {
        setProfileSuccessMsg(true)
        setTimeout(() => setProfileSuccessMsg(false), 3000)
      }
    }
  }

  const isBalanceUnset = user?.Balance === null || user?.Balance === undefined

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-6 text-zinc-100 antialiased">
      
      {/* Alert Message for API Errors */}
      {globalError && (
        <div className="max-w-2xl mx-auto flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{globalError}</span>
        </div>
      )}

      {isBalanceUnset ? (
        /* Onboarding View: Force Set Initial Balance */
        <div className="p-8 max-w-md mx-auto my-12 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl space-y-6 shadow-xl shadow-black/40 relative animate-in zoom-in-95 duration-300">
          
          {hasWarning && (
            <div className="absolute -top-12 left-0 w-full text-center text-xs text-indigo-300 font-medium tracking-wide uppercase bg-indigo-500/10 border border-indigo-500/20 py-2.5 rounded-xl backdrop-blur-md animate-pulse">
              Please initialize your wallet balance first
            </div>
          )}
          
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex items-center justify-center text-indigo-400 mb-2 shadow-inner">
              <UserCheck className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Initialize Wallet</h3>
            <p className="text-[13px] text-zinc-400 leading-relaxed max-w-[90%] mx-auto">
              Welcome to your new workspace profile! Before logging income or expenses, configure your starting ledger balance.
            </p>
          </div>

          <form onSubmit={handleSetInitialBalanceSubmit} className="space-y-5 text-xs pt-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase block">
                Starting Balance (₹) <span className="text-indigo-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                <IndianRupee className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={initialBalanceInput}
                  onChange={(e) => setInitialBalanceInput(e.target.value)}
                  disabled={isGlobalLoading}
                  className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGlobalLoading || !initialBalanceInput}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all duration-150 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGlobalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                'Set Starting Balance'
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Profile Edit Card */
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl shadow-black/40">
            
            <div className="flex items-center gap-3.5 border-b border-zinc-800/80 pb-5">
              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-indigo-400 shadow-inner">
                <User className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Profile & Workspace</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Manage your personal details and account configurations.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Full Name</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="Zulfekar Khan"
                      value={profileForm.Name}
                      onChange={(e) => setProfileForm({ ...profileForm, Name: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Phone Number</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={profileForm.Phone}
                      onChange={(e) => setProfileForm({ ...profileForm, Phone: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Occupation */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Occupation</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <Briefcase className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="Frontend Developer"
                      value={profileForm.Occupation}
                      onChange={(e) => setProfileForm({ ...profileForm, Occupation: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">City</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={profileForm.City}
                      onChange={(e) => setProfileForm({ ...profileForm, City: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Wallet Balance (₹)</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <IndianRupee className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={profileForm.Balance}
                      onChange={(e) => setProfileForm({ ...profileForm, Balance: parseFloat(e.target.value) || 0 })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">State / Province</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <Map className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Karnataka"
                      value={profileForm.State}
                      onChange={(e) => setProfileForm({ ...profileForm, State: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Street Address</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <Home className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Block, building, apartment..."
                      value={profileForm.Address}
                      onChange={(e) => setProfileForm({ ...profileForm, Address: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-10 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Zipcode */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Zipcode</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <Hash className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="560001"
                      value={profileForm.Zipcode}
                      onChange={(e) => setProfileForm({ ...profileForm, Zipcode: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-8 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Country</label>
                  <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                    <Globe className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="India"
                      value={profileForm.Country}
                      onChange={(e) => setProfileForm({ ...profileForm, Country: e.target.value })}
                      disabled={isGlobalLoading}
                      className="w-full h-11 pl-8 pr-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

              </div>

              {/* System Identifiers Divider */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-5">
                <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase flex items-center gap-2">
                  System Identifiers <span className="flex-1 h-px bg-zinc-800/80" />
                </span>
                
                <div className="grid grid-cols-1 gap-5 opacity-60 grayscale-[20%] pointer-events-none">
                  {/* Email (Read Only) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Authentication Email</label>
                    <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-900 shadow-inner flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        readOnly
                        disabled
                        value={user?.Email || ''}
                        className="w-full h-11 pl-10 pr-3.5 text-zinc-400 text-sm bg-transparent outline-none border-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area & Toasts */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80">
                <div className="w-full sm:w-auto h-11 flex items-center">
                  {profileSuccessMsg && (
                    <div className="flex items-center gap-2.5 px-4 h-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-medium text-emerald-400 animate-in fade-in slide-in-from-left-2 duration-300 w-full sm:w-auto">
                      <UserCheck className="w-4 h-4" />
                      Profile details synced successfully.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isGlobalLoading || !profileForm.Name || !profileForm.Phone || !profileForm.Occupation || !profileForm.City}
                  className="w-full sm:w-auto px-8 h-11 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-sm font-semibold shadow-md shadow-white/5 transition-all duration-150 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGlobalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Global Footer Metadata */}
      <footer className="mt-12 text-center flex flex-col items-center justify-center gap-2 relative z-10 opacity-70 hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-center gap-3 text-xs text-zinc-500 font-medium">
          <span>Table Sprint AI Client</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="flex items-center gap-1.5 font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            REST Nodes Active
          </span>
        </div>
      </footer>

    </div>
  )
}