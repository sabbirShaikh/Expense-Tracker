import { useState } from 'react'
import { useLedger } from '../hooks/useLedger'
import {
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronDown,
  Calendar,
  FileText
} from 'lucide-react'

// Helper to get local date-time string formatted for datetime-local inputs
const getLocalDateTimeString = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

// Payment method brand custom SVG icons - standardized to w-4 h-4
const PhonePeIcon = () => (
  <svg className="w-4 h-4 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#5F259F"/>
    <path d="M12 4a3.5 3.5 0 00-3.5 3.5v9a3.5 3.5 0 007 0v-9A3.5 3.5 0 0012 4zm2 12.5a2 2 0 11-4 0v-1.5h4v1.5zm0-3.5h-4V7.5a2 2 0 114 0V13z" fill="white"/>
  </svg>
)

const GPayIcon = () => (
  <svg className="w-4 h-4 bg-white rounded-sm border border-zinc-700 p-0.5 shrink-0" viewBox="0 0 40 40" fill="none">
    <path d="M20 8c-6.63 0-12 5.37-12 12s5.37 12 12 12c3.67 0 6.96-1.65 9.2-4.24l-3.12-3.12A7.54 7.54 0 0120 26.4c-3.53 0-6.4-2.87-6.4-6.4s2.87-6.4 6.4-6.4c1.92 0 3.65.85 4.86 2.19l3.12-3.12A11.93 11.93 0 0020 8z" fill="#4285F4"/>
    <path d="M29.6 17.6h-6.4v4.8h6.4v-4.8z" fill="#34A853"/>
    <path d="M28 14.4h-3.2v11.2H28V14.4z" fill="#EA4335"/>
    <path d="M26.4 12.8H24.8V28.8h1.6V12.8z" fill="#FBBC05"/>
  </svg>
)

const PaytmIcon = () => (
  <svg className="w-4 h-4 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#002E7E"/>
    <text x="12" y="15" textAnchor="middle" fill="#00B9F5" fontSize="7" fontFamily="system-ui, sans-serif" fontWeight="900">Paytm</text>
  </svg>
)

const SuperMoneyIcon = () => (
  <svg className="w-4 h-4 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#0A0B0D"/>
    <path d="M12 5l1.5 5.5H19l-4.5 3.5 1.5 5.5-4-3.5-4 3.5 1.5-5.5L7 10.5h5.5L12 5z" fill="#10B981"/>
  </svg>
)

const AmazonPayIcon = () => (
  <svg className="w-4 h-4 rounded-sm bg-zinc-900 border border-zinc-700 p-0.5 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M16.4 14.5c-.7.6-1.7.9-2.7.9-2.1 0-3.6-1.3-3.6-3.4 0-2.4 1.8-3.7 4.5-3.7h1.8v.8c0 1.2-.5 2-1.8 2-1 0-1.7-.5-1.7-1.3 0-.9.9-1.4 2.1-1.4h1.4v6.2h-1.8v-.6zm-1.8-4.5c-1.1 0-1.6.4-1.6.9 0 .5.4.8 1.1.8s1.6-.4 1.6-1v-.7h-1.1z" fill="white"/>
    <path d="M6 18c3.5 2 8.5 2 12 0" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16.5 16.5l1.5 1.5-.5 1" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const PopUpiIcon = () => (
  <svg className="w-4 h-4 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#E11D48"/>
    <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="900">POP</text>
  </svg>
)

const CashIcon = () => (
  <svg className="w-4 h-4 rounded-sm bg-emerald-600 p-0.5 shrink-0" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
    <path d="M6 12h1M17 12h1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const OtherIcon = () => (
  <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
)

// Category visual custom SVG icons
const BusIcon = () => (
  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 18h8M6 12h12M6 8h12M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
)

const RentIcon = () => (
  <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const LunchIcon = () => (
  <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M6 6l12 12M6 18L12 12" />
  </svg>
)

const SweetIcon = () => (
  <svg className="w-4 h-4 text-pink-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v2m0 8v2M6 12h2m8 0h2" />
  </svg>
)

const DrinkIcon = () => (
  <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 2h6M12 2v4M8 6h8l-2 15H10L8 6z" />
  </svg>
)

const TransferIcon = () => (
  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
)

const TeaIcon = () => (
  <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h10v2a3 3 0 01-3 3H9a3 3 0 01-3-3v-2zm10-3h1a2 2 0 012 2v1a2 2 0 01-2 2h-1M9 3v4M13 3v4M5 10h14" />
  </svg>
)

const OrderIcon = () => (
  <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

export function DebitsPage() {
  const {
    debits,
    loading,
    error,
    addDebit,
    fetchDebits,
  } = useLedger()

  const [amountInput, setAmountInput] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('GPay')
  const [otherPaymentMethodText, setOtherPaymentMethodText] = useState('')
  const [selectedPaidTo, setSelectedPaidTo] = useState('')
  const [otherPaidToText, setOtherPaidToText] = useState('')
  const [dateInput, setDateInput] = useState(() => getLocalDateTimeString())
  const [noteInput, setNoteInput] = useState('')
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isPaidToOpen, setIsPaidToOpen] = useState(false)
  const [buttonState, setButtonState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const paymentMethods = [
    { value: 'PhonePe', label: 'PhonePe', icon: <PhonePeIcon /> },
    { value: 'GPay', label: 'GPay', icon: <GPayIcon /> },
    { value: 'Paytm', label: 'Paytm', icon: <PaytmIcon /> },
    { value: 'Super Money', label: 'Super Money', icon: <SuperMoneyIcon /> },
    { value: 'Amazon Pay', label: 'Amazon Pay', icon: <AmazonPayIcon /> },
    { value: 'Pop UPI', label: 'Pop UPI', icon: <PopUpiIcon /> },
    { value: 'Cash', label: 'Cash', icon: <CashIcon /> },
    { value: 'Other', label: 'Other', icon: <OtherIcon /> },
  ]

  const paidToOptions = [
    { value: 'Bus Ticket', label: 'Bus Ticket', icon: <BusIcon /> },
    { value: 'PG Rent', label: 'PG Rent', icon: <RentIcon /> },
    { value: 'Lunch Meal', label: 'Lunch Meal', icon: <LunchIcon /> },
    { value: 'Sweet/Snacks', label: 'Sweet/Snacks', icon: <SweetIcon /> },
    { value: 'Cold Drinks', label: 'Cold Drinks', icon: <DrinkIcon /> },
    { value: 'UPI Transfer', label: 'UPI Transfer', icon: <TransferIcon /> },
    { value: 'Tea', label: 'Tea', icon: <TeaIcon /> },
    { value: 'Online Order', label: 'Online Order', icon: <OrderIcon /> },
    { value: 'Other', label: 'Other', icon: <OtherIcon /> },
  ]

  const presetItems = [
    { label: '🚌 Bus', amount: 12, paidTo: 'Bus Ticket' },
    { label: '🏠 Rent', amount: 7800, paidTo: 'PG Rent' },
    { label: '🍱 Lunch', amount: 150, paidTo: 'Lunch Meal' },
    { label: '☕ Tea', amount: 20, paidTo: 'Tea' },
  ]

  const handlePresetSelect = (amount: number, paidTo: string) => {
    setAmountInput(amount.toString())
    setSelectedPaidTo(paidTo)
    setOtherPaidToText('')
    setDateInput(getLocalDateTimeString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) return

    setButtonState('saving')
    const finalPaymentMethod = selectedPaymentMethod === 'Other' ? otherPaymentMethodText : selectedPaymentMethod
    const finalPaidTo = selectedPaidTo === 'Other' ? otherPaidToText : selectedPaidTo

    const success = await addDebit(
      amt,
      finalPaymentMethod,
      finalPaidTo,
      noteInput,
      new Date(dateInput).toISOString()
    )

    if (success !== null) {
      setButtonState('saved')
      setAmountInput('')
      setSelectedPaymentMethod('GPay')
      setOtherPaymentMethodText('')
      setSelectedPaidTo('')
      setOtherPaidToText('')
      setDateInput(getLocalDateTimeString())
      setNoteInput('')
      setTimeout(() => setButtonState('idle'), 1800)
    } else {
      setButtonState('error')
      setTimeout(() => setButtonState('idle'), 1800)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-6 text-zinc-100 antialiased">
      
      {/* Alert Message for API Errors */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Record Debit Form Container */}
        <div className="lg:col-span-5 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl shadow-black/40">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Record New Expense
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Log internal financial outflows and expenses securely.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Quick Presets</span>
              <div className="flex flex-wrap gap-2">
                {presetItems.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset.amount, preset.paidTo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-[11px] text-zinc-300 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 hover:border-zinc-600"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                Amount (₹) <span className="text-rose-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all duration-150 shadow-inner">
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-zinc-100 text-sm bg-transparent outline-none border-none pr-10 font-medium placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Payment Method Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                Payment Method <span className="text-rose-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentOpen(!isPaymentOpen)
                    setIsPaidToOpen(false)
                  }}
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-left flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950 hover:bg-zinc-900/40 transition-all duration-150 text-zinc-200 font-medium cursor-pointer focus:border-zinc-700 focus:ring-2 focus:ring-zinc-800"
                >
                  <div className="flex items-center gap-2.5">
                    {paymentMethods.find(m => m.value === selectedPaymentMethod)?.icon}
                    <span className="text-sm">{selectedPaymentMethod || 'Select Method'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200" style={{ transform: isPaymentOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>

              {isPaymentOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPaymentOpen(false)} />
                  <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 overflow-y-auto max-h-56 animate-in fade-in zoom-in-95 duration-100">
                    {paymentMethods.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedPaymentMethod(opt.value)
                          setIsPaymentOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-900 transition-colors duration-100 cursor-pointer"
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Other Payment Method Input */}
            {selectedPaymentMethod === 'Other' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Specify Method</label>
                <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-zinc-700 transition-all duration-150">
                  <input
                    type="text"
                    required
                    placeholder="Type custom method..."
                    value={otherPaymentMethodText}
                    onChange={(e) => setOtherPaymentMethodText(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 px-3.5 text-zinc-200 text-sm bg-transparent outline-none border-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            {/* Paid To Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Paid To</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaidToOpen(!isPaidToOpen)
                    setIsPaymentOpen(false)
                  }}
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-left flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950 hover:bg-zinc-900/40 transition-all duration-150 text-zinc-200 font-medium cursor-pointer focus:border-zinc-700 focus:ring-2 focus:ring-zinc-800"
                >
                  <div className="flex items-center gap-2.5">
                    {selectedPaidTo ? (
                      <>
                        {paidToOptions.find(o => o.value === selectedPaidTo)?.icon}
                        <span className="text-sm">{selectedPaidTo}</span>
                      </>
                    ) : (
                      <span className="text-zinc-500 text-sm">Select Category</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200" style={{ transform: isPaidToOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>

              {isPaidToOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPaidToOpen(false)} />
                  <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 overflow-y-auto max-h-56 animate-in fade-in zoom-in-95 duration-100">
                    {paidToOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedPaidTo(opt.value)
                          setIsPaidToOpen(false)
                        }}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-900 transition-colors duration-100 cursor-pointer"
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Other Paid To Input */}
            {selectedPaidTo === 'Other' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Specify Custom Name</label>
                <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-zinc-700 transition-all duration-150">
                  <input
                    type="text"
                    required
                    placeholder="Type name here..."
                    value={otherPaidToText}
                    onChange={(e) => setOtherPaidToText(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 px-3.5 text-zinc-200 text-sm bg-transparent outline-none border-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            {/* Date Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                Date <span className="text-rose-400 font-bold ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-zinc-700 transition-all duration-150 flex items-center">
                  <input
                    type="datetime-local"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 px-3.5 text-zinc-200 text-sm bg-transparent outline-none border-none font-medium text-left cursor-pointer scheme-dark"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDateInput(getLocalDateTimeString())}
                  className="px-4 h-11 border border-zinc-800 hover:border-zinc-700 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95"
                >
                  Now
                </button>
              </div>
            </div>

            {/* Note Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Note (Optional)</label>
              <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-zinc-700 transition-all duration-150">
                <textarea
                  rows={2}
                  placeholder="Include extra metadata or context..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-3 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-700 resize-none font-medium"
                />
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !amountInput || (selectedPaymentMethod === 'Other' && !otherPaymentMethodText)}
                className={`w-full h-11 rounded-xl text-sm font-semibold shadow-md transition-all duration-150 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 ${
                  buttonState === 'saving'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    : buttonState === 'saved'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : buttonState === 'error'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-white/5'
                }`}
              >
                {buttonState === 'saving' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Outflow...
                  </>
                ) : buttonState === 'saved' ? (
                  'Saved Successfully ✓'
                ) : buttonState === 'error' ? (
                  'Transaction Error ✗'
                ) : (
                  'Submit Record'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Debits History Table List */}
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-black/20 backdrop-blur-md">
          <div className="px-6 py-4.5 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                Debits Log History
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Real-time ledger updates and transaction histories.</p>
            </div>
            <button
              onClick={fetchDebits}
              disabled={loading}
              className="p-2 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer active:scale-95 transition-all"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950/40 text-zinc-400 font-medium tracking-wider uppercase text-[10px] border-b border-zinc-800/60">
                  <th className="px-6 py-3.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> Date</th>
                  <th className="px-6 py-3.5">Paid To</th>
                  <th className="px-6 py-3.5">Payment Node</th>
                  <th className="px-6 py-3.5 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 font-sans text-sm">
                {debits.map((record) => (
                  <tr key={record._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                      {formatDate(record.Date)}
                    </td>
                    <td className="px-6 py-4 text-zinc-200 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {paidToOptions.find(o => o.value === record['Paid to'])?.icon || <FileText className="w-4 h-4 text-zinc-400" />}
                        <span>{record['Paid to']}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800/80 text-zinc-300 rounded-lg text-xs font-medium">
                        {paymentMethods.find(o => o.value === record['Payment Method'])?.icon}
                        <span>{record['Payment Method']}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-rose-400 text-sm whitespace-nowrap">
                      -₹{record.Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {debits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-zinc-500 italic font-normal">
                      {loading ? 'Processing asset entries...' : 'No debit balances or logs initialized.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}