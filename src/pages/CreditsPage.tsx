import { useState } from 'react'
import { useLedger } from '../hooks/useLedger'
import {
  PlusCircle,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Loader2,
  Briefcase,
  Code,
  TrendingUp as TrendIcon,
  Gift,
  RotateCcw,
  Landmark,
  FileCheck,
  ChevronDown,
  Calendar,
  FileText
} from 'lucide-react'

// Helper to get local date-time string formatted for datetime-local inputs
const getLocalDateTimeString = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

// Payment method brand custom SVG icons - standardized and streamlined
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

const SalaryIcon = () => <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
const FreelanceIcon = () => <Code className="w-4 h-4 text-cyan-400 shrink-0" />
const InvestmentIcon = () => <TrendIcon className="w-4 h-4 text-indigo-400 shrink-0" />
const GiftIcon = () => <Gift className="w-4 h-4 text-rose-400 shrink-0" />
const RefundIcon = () => <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />

export function CreditsPage() {
  const { credits, loading, error, addCredit, fetchCredits } = useLedger()

  const [amountInput, setAmountInput] = useState('')
  const [selectedSourceOfPayment, setSelectedSourceOfPayment] = useState('Bank Transfer')
  const [otherSourceText, setOtherSourceText] = useState('')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [otherPurposeText, setOtherPurposeText] = useState('')
  const [creditedFromInput, setCreditedFromInput] = useState('')
  const [dateInput, setDateInput] = useState(() => getLocalDateTimeString())
  const [noteInput, setNoteInput] = useState('')
  
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [isPurposeOpen, setIsPurposeOpen] = useState(false)
  const [buttonState, setButtonState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const sourceOptions = [
    { value: 'Bank Transfer', label: 'Bank Transfer', icon: <Landmark className="w-4 h-4 text-zinc-400 shrink-0" /> },
    { value: 'GPay', label: 'GPay', icon: <GPayIcon /> },
    { value: 'PhonePe', label: 'PhonePe', icon: <PhonePeIcon /> },
    { value: 'Cash', label: 'Cash', icon: <CashIcon /> },
    { value: 'Cheque', label: 'Cheque', icon: <FileCheck className="w-4 h-4 text-zinc-400 shrink-0" /> },
    { value: 'Other', label: 'Other', icon: <OtherIcon /> },
  ]

  const purposeOptions = [
    { value: 'Salary', label: 'Salary', icon: <SalaryIcon /> },
    { value: 'Freelance', label: 'Freelance / Projects', icon: <FreelanceIcon /> },
    { value: 'Investments', label: 'Investments / Dividends', icon: <InvestmentIcon /> },
    { value: 'Gift', label: 'Gift', icon: <GiftIcon /> },
    { value: 'Refund', label: 'Refund / Cashbacks', icon: <RefundIcon /> },
    { value: 'Other', label: 'Other', icon: <OtherIcon /> },
  ]

  const presetItems = [
    { label: '💼 Salary', amount: 5000, purpose: 'Salary', creditedFrom: 'Corporate Workspace' },
    { label: '💻 Freelance', amount: 1500, purpose: 'Freelance', creditedFrom: 'Client Project' },
    { label: '📈 Dividend', amount: 250, purpose: 'Investments', creditedFrom: 'Broker Account' },
    { label: '🎁 Gift', amount: 100, purpose: 'Gift', creditedFrom: 'Family member' },
  ]

  const handlePresetSelect = (amount: number, purpose: string, creditedFrom: string) => {
    setAmountInput(amount.toString())
    setSelectedPurpose(purpose)
    setOtherPurposeText('')
    setCreditedFromInput(creditedFrom)
    setDateInput(getLocalDateTimeString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) return

    setButtonState('saving')
    const finalSourceOfPayment = selectedSourceOfPayment === 'Other' ? otherSourceText : selectedSourceOfPayment
    const finalPurpose = selectedPurpose === 'Other' ? otherPurposeText : selectedPurpose

    const success = await addCredit(
      amt,
      finalPurpose,
      creditedFromInput,
      finalSourceOfPayment,
      noteInput,
      new Date(dateInput).toISOString()
    )

    if (success !== null) {
      setButtonState('saved')
      setAmountInput('')
      setSelectedSourceOfPayment('Bank Transfer')
      setOtherSourceText('')
      setSelectedPurpose('')
      setOtherPurposeText('')
      setCreditedFromInput('')
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
        
        {/* Record Credit Form Container */}
        <div className="lg:col-span-5 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl shadow-black/40">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              Record New Income
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Log internal financial inflows and transactions securely.</p>
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
                    onClick={() => handlePresetSelect(preset.amount, preset.purpose, preset.creditedFrom)}
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
                Amount (₹) <span className="text-emerald-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-150 shadow-inner">
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

            {/* Source of Payment Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                Source of Payment <span className="text-emerald-400 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsSourceOpen(!isSourceOpen)
                    setIsPurposeOpen(false)
                  }}
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-left flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950 hover:bg-zinc-900/40 transition-all duration-150 text-zinc-200 font-medium cursor-pointer focus:border-zinc-700 focus:ring-2 focus:ring-zinc-800"
                >
                  <div className="flex items-center gap-2.5">
                    {sourceOptions.find(o => o.value === selectedSourceOfPayment)?.icon}
                    <span className="text-sm">{selectedSourceOfPayment || 'Select Source'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200" style={{ transform: isSourceOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>

              {isSourceOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSourceOpen(false)} />
                  <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 overflow-y-auto max-h-56 animate-in fade-in zoom-in-95 duration-100">
                    {sourceOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedSourceOfPayment(opt.value)
                          setIsSourceOpen(false)
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

            {/* Other Source Text Input */}
            {selectedSourceOfPayment === 'Other' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Specify Source</label>
                <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-zinc-700 transition-all duration-150">
                  <input
                    type="text"
                    required
                    placeholder="Type payment source..."
                    value={otherSourceText}
                    onChange={(e) => setOtherSourceText(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 px-3.5 text-zinc-200 text-sm bg-transparent outline-none border-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            {/* Purpose / Category Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Purpose / Category</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPurposeOpen(!isPurposeOpen)
                    setIsSourceOpen(false)
                  }}
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-left flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950 hover:bg-zinc-900/40 transition-all duration-150 text-zinc-200 font-medium cursor-pointer focus:border-zinc-700 focus:ring-2 focus:ring-zinc-800"
                >
                  <div className="flex items-center gap-2.5">
                    {selectedPurpose ? (
                      <>
                        {purposeOptions.find(o => o.value === selectedPurpose)?.icon}
                        <span className="text-sm">{selectedPurpose}</span>
                      </>
                    ) : (
                      <span className="text-zinc-500 text-sm">Select Category</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200" style={{ transform: isPurposeOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>

              {isPurposeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPurposeOpen(false)} />
                  <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 overflow-y-auto max-h-56 animate-in fade-in zoom-in-95 duration-100">
                    {purposeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedPurpose(opt.value)
                          setIsPurposeOpen(false)
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

            {/* Other Purpose Text Input */}
            {selectedPurpose === 'Other' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Specify Category</label>
                <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-zinc-700 transition-all duration-150">
                  <input
                    type="text"
                    required
                    placeholder="Type custom category..."
                    value={otherPurposeText}
                    onChange={(e) => setOtherPurposeText(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 px-3.5 text-zinc-200 text-sm bg-transparent outline-none border-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            {/* Credited From Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Credited From</label>
              <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-zinc-700 transition-all duration-150">
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp, Client Name"
                  value={creditedFromInput}
                  onChange={(e) => setCreditedFromInput(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 px-3.5 text-zinc-200 text-sm bg-transparent outline-none border-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Date Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                Date <span className="text-emerald-400 font-bold ml-0.5">*</span>
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
                disabled={loading || !amountInput || (selectedSourceOfPayment === 'Other' && !otherSourceText)}
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
                    Saving Inflow...
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

        {/* Credits History Table List */}
        <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-black/20 backdrop-blur-md">
          <div className="px-6 py-4.5 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Credits Log History
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Real-time ledger updates and transaction histories.</p>
            </div>
            <button
              onClick={fetchCredits}
              disabled={loading}
              className="p-2 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer active:scale-95 transition-all"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950/40 text-zinc-400 font-medium tracking-wider uppercase text-[10px] border-b border-zinc-800/60">
                  <th className="px-6 py-3.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> Date</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Credited From</th>
                  <th className="px-6 py-3.5">Payment Node</th>
                  <th className="px-6 py-3.5 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 font-sans text-sm">
                {credits.map((record) => (
                  <tr key={record._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                      {formatDate(record.Date)}
                    </td>
                    <td className="px-6 py-4 text-zinc-200 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {purposeOptions.find(o => o.value === record.Purpose)?.icon || <FileText className="w-4 h-4 text-zinc-400" />}
                        <span>{record.Purpose}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-normal">{record['Credited From']}</td>
                    <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800/80 text-zinc-300 rounded-lg text-xs font-medium">
                        {sourceOptions.find(o => o.value === record['Source of Payment'])?.icon}
                        <span>{record['Source of Payment']}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                      +₹{record.Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {credits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 italic font-normal">
                      {loading ? 'Processing asset entries...' : 'No credit balances or logs initialized.'}
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