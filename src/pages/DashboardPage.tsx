import { useState } from 'react'
import { useLedger } from '../hooks/useLedger'
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Layers,
  RefreshCw,
  Calendar,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  ChevronDown
} from 'lucide-react'

// Helper to get local date-time string formatted for datetime-local inputs
const getLocalDateTimeString = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

export function DashboardPage() {
  const {
    credits,
    debits,
    unifiedRecords,
    balance,
    loading,
    error,
    fetchUnifiedRecords,
    deleteCredit,
    deleteDebit,
    updateCredit,
    updateDebit,
  } = useLedger()

  // Analytics State Hooks
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [hoveredCreditCat, setHoveredCreditCat] = useState<string | null>(null)
  const [hoveredDebitCat, setHoveredDebitCat] = useState<string | null>(null)

  const creditColors: { [key: string]: string } = {
    'Salary': '#10B981', // emerald-500
    'Freelance': '#06B6D4', // cyan-500
    'Investments': '#6366F1', // indigo-500
    'Gift': '#F43F5E', // rose-500
    'Refund': '#F59E0B', // amber-500
    'Borrowed / Loan': '#8B5CF6', // violet-500
    'Other': '#71717A' // zinc-500
  }

  const debitColors: { [key: string]: string } = {
    'Bus Ticket': '#F59E0B',
    'PG Rent': '#6366F1',
    'Lunch Meal': '#F97316',
    'Sweet/Snacks': '#EC4899',
    'Cold Drinks': '#06B6D4',
    'UPI Transfer': '#10B981',
    'Tea': '#EAB308',
    'Online Order': '#8B5CF6',
    'Lent / Loan': '#EF4444',
    'Other': '#71717A'
  }

  // Get filtered credit categories
  const creditBreakdown = (() => {
    const monthlyCredits = credits.filter(c => c.Date.startsWith(selectedMonth))
    const total = monthlyCredits.reduce((sum, c) => sum + c.Amount, 0)
    
    const groups: { [key: string]: number } = {}
    monthlyCredits.forEach(c => {
      let category = c.Purpose || 'Other'
      if (category.startsWith('Borrowed / Loan')) {
        category = 'Borrowed / Loan'
      }
      const isPredefined = ['Salary', 'Freelance', 'Investments', 'Gift', 'Refund', 'Borrowed / Loan'].some(opt => category.startsWith(opt))
      if (!isPredefined) {
        category = 'Other'
      }
      groups[category] = (groups[category] || 0) + c.Amount
    })

    return Object.entries(groups).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount)
  })()

  const monthlyCreditTotal = credits.filter(c => c.Date.startsWith(selectedMonth)).reduce((sum, c) => sum + c.Amount, 0)

  // Get filtered debit categories
  const debitBreakdown = (() => {
    const monthlyDebits = debits.filter(d => d.Date.startsWith(selectedMonth))
    const total = monthlyDebits.reduce((sum, d) => sum + d.Amount, 0)

    const groups: { [key: string]: number } = {}
    monthlyDebits.forEach(d => {
      let category = d['Paid to'] || 'Other'
      if (category.startsWith('Lent / Loan')) {
        category = 'Lent / Loan'
      }
      const isPredefined = ['Bus Ticket', 'PG Rent', 'Lunch Meal', 'Sweet/Snacks', 'Cold Drinks', 'UPI Transfer', 'Tea', 'Online Order', 'Lent / Loan'].some(opt => category.startsWith(opt))
      if (!isPredefined) {
        category = 'Other'
      }
      groups[category] = (groups[category] || 0) + d.Amount
    })

    return Object.entries(groups).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount)
  })()

  const monthlyDebitTotal = debits.filter(d => d.Date.startsWith(selectedMonth)).reduce((sum, d) => sum + d.Amount, 0)

  // Get last 6 months relative to selectedMonth
  const last6Months = (() => {
    const list = []
    const [yearStr, monthStr] = selectedMonth.split('-')
    const baseDate = new Date(Number(yearStr), Number(monthStr) - 1, 15)
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 15)
      const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
      const key = d.toISOString().slice(0, 7)
      
      const monthlyIncome = credits.filter(c => c.Date.startsWith(key)).reduce((sum, c) => sum + c.Amount, 0)
      const monthlyExpense = debits.filter(d => d.Date.startsWith(key)).reduce((sum, d) => sum + d.Amount, 0)
      
      list.push({
        label,
        key,
        income: monthlyIncome,
        expense: monthlyExpense
      })
    }
    return list
  })()

  const maxMonthlyVal = Math.max(
    ...last6Months.map(m => Math.max(m.income, m.expense)),
    1000
  )

  const getConicGradientString = (data: Array<{ name: string; percentage: number }>, colorsMap: { [key: string]: string }) => {
    if (data.length === 0) return 'rgb(39, 39, 42)'
    let accumulated = 0
    const parts = data.map(item => {
      const start = accumulated
      const end = accumulated + item.percentage
      accumulated = end
      const color = colorsMap[item.name] || '#71717A'
      return `${color} ${start.toFixed(1)}% ${end.toFixed(1)}%`
    })
    return `conic-gradient(${parts.join(', ')})`
  }

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editType, setEditType] = useState<'credit' | 'debit' | null>(null)
  const [editingRecord, setEditingRecord] = useState<any | null>(null)
  
  const [editAmount, setEditAmount] = useState('')
  const [editPurpose, setEditPurpose] = useState('')
  const [editOtherPurposeText, setEditOtherPurposeText] = useState('')
  const [editSourceOfPayment, setEditSourceOfPayment] = useState('')
  const [editOtherSourceText, setEditOtherSourceText] = useState('')
  const [editCreditedFrom, setEditCreditedFrom] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  
  const [isEditSourceOpen, setIsEditSourceOpen] = useState(false)
  const [isEditPurposeOpen, setIsEditPurposeOpen] = useState(false)
  const [editButtonState, setEditButtonState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'credit' | 'debit' | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<any | null>(null)
  const [deleteButtonState, setDeleteButtonState] = useState<'idle' | 'deleting' | 'deleted' | 'error'>('idle')

  const sourceOptions = [
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Other', label: 'Other' },
  ]

  const purposeOptions = [
    { value: 'Salary', label: 'Salary' },
    { value: 'Freelance', label: 'Freelance / Projects' },
    { value: 'Investments', label: 'Investments / Dividends' },
    { value: 'Gift', label: 'Gift' },
    { value: 'Refund', label: 'Refund / Cashbacks' },
    { value: 'Borrowed / Loan', label: 'Borrowed / Loan' },
    { value: 'Other', label: 'Other' },
  ]

  const paymentMethods = [
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'GPay', label: 'GPay' },
    { value: 'Paytm', label: 'Paytm' },
    { value: 'Super Money', label: 'Super Money' },
    { value: 'Amazon Pay', label: 'Amazon Pay' },
    { value: 'Pop UPI', label: 'Pop UPI' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Other', label: 'Other' },
  ]

  const paidToOptions = [
    { value: 'Bus Ticket', label: 'Bus Ticket' },
    { value: 'PG Rent', label: 'PG Rent' },
    { value: 'Lunch Meal', label: 'Lunch Meal' },
    { value: 'Sweet/Snacks', label: 'Sweet/Snacks' },
    { value: 'Cold Drinks', label: 'Cold Drinks' },
    { value: 'UPI Transfer', label: 'UPI Transfer' },
    { value: 'Tea', label: 'Tea' },
    { value: 'Online Order', label: 'Online Order' },
    { value: 'Lent / Loan', label: 'Lent / Loan' },
    { value: 'Other', label: 'Other' },
  ]

  const handleEditClick = (record: any) => {
    if (record.Credit > 0) {
      const match = credits.find(c => 
        new Date(c.Date).getTime() === new Date(record.Date).getTime() &&
        c.Amount === record.Credit &&
        c.Purpose === record.Purpose
      )
      if (!match) {
        alert("Could not locate original credit transaction details.")
        return
      }
      setEditType('credit')
      setEditingRecord(match)
      setEditAmount(match.Amount.toString())
      
      const isSourcePredefined = ['Bank Transfer', 'GPay', 'PhonePe', 'Cash', 'Cheque'].includes(match['Source of Payment'])
      if (isSourcePredefined) {
        setEditSourceOfPayment(match['Source of Payment'])
        setEditOtherSourceText('')
      } else {
        setEditSourceOfPayment('Other')
        setEditOtherSourceText(match['Source of Payment'] || '')
      }

      const isPurposePredefined = ['Salary', 'Freelance', 'Investments', 'Gift', 'Refund'].includes(match.Purpose)
      if (isPurposePredefined) {
        setEditPurpose(match.Purpose)
        setEditOtherPurposeText('')
      } else {
        setEditPurpose('Other')
        setEditOtherPurposeText(match.Purpose || '')
      }

      setEditCreditedFrom(match['Credited From'] || '')
      setEditDate(getLocalDateTimeString(new Date(match.Date)))
      setEditNote(match.Note || '')
      setIsEditOpen(true)
    } else if (record.Debit > 0) {
      const match = debits.find(d => 
        new Date(d.Date).getTime() === new Date(record.Date).getTime() &&
        d.Amount === record.Debit &&
        d['Paid to'] === record.Purpose
      )
      if (!match) {
        alert("Could not locate original debit transaction details.")
        return
      }
      setEditType('debit')
      setEditingRecord(match)
      setEditAmount(match.Amount.toString())
      
      const isMethodPredefined = ['PhonePe', 'GPay', 'Paytm', 'Super Money', 'Amazon Pay', 'Pop UPI', 'Cash'].includes(match['Payment Method'])
      if (isMethodPredefined) {
        setEditSourceOfPayment(match['Payment Method'])
        setEditOtherSourceText('')
      } else {
        setEditSourceOfPayment('Other')
        setEditOtherSourceText(match['Payment Method'] || '')
      }

      const isPaidToPredefined = ['Bus Ticket', 'PG Rent', 'Lunch Meal', 'Sweet/Snacks', 'Cold Drinks', 'UPI Transfer', 'Tea', 'Online Order'].includes(match['Paid to'])
      if (isPaidToPredefined) {
        setEditPurpose(match['Paid to'])
        setEditOtherPurposeText('')
      } else {
        setEditPurpose('Other')
        setEditOtherPurposeText(match['Paid to'] || '')
      }

      setEditDate(getLocalDateTimeString(new Date(match.Date)))
      setEditNote(match.Note || '')
      setIsEditOpen(true)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord || !editType) return
    const amt = parseFloat(editAmount)
    if (isNaN(amt) || amt <= 0) return

    setEditButtonState('saving')
    const finalSource = editSourceOfPayment === 'Other' ? editOtherSourceText : editSourceOfPayment
    const finalPurpose = editPurpose === 'Other' ? editOtherPurposeText : editPurpose

    let success = false
    if (editType === 'credit') {
      success = await updateCredit(
        editingRecord._id,
        editingRecord.Amount,
        amt,
        editingRecord.Purpose,
        finalPurpose,
        editingRecord.Date,
        new Date(editDate).toISOString(),
        editCreditedFrom,
        finalSource,
        editNote
      )
    } else {
      success = await updateDebit(
        editingRecord._id,
        editingRecord.Amount,
        amt,
        editingRecord['Paid to'],
        finalPurpose,
        editingRecord.Date,
        new Date(editDate).toISOString(),
        finalPurpose,
        finalSource,
        editNote
      )
    }

    if (success) {
      setEditButtonState('saved')
      setTimeout(() => {
        setIsEditOpen(false)
        setEditingRecord(null)
        setEditType(null)
        setEditButtonState('idle')
      }, 1000)
    } else {
      setEditButtonState('error')
      setTimeout(() => setEditButtonState('idle'), 1500)
    }
  }

  const handleDeleteClick = (record: any) => {
    if (record.Credit > 0) {
      const match = credits.find(c => 
        new Date(c.Date).getTime() === new Date(record.Date).getTime() &&
        c.Amount === record.Credit &&
        c.Purpose === record.Purpose
      )
      if (!match) return
      setDeleteType('credit')
      setDeletingRecord(match)
      setIsDeleteOpen(true)
    } else if (record.Debit > 0) {
      const match = debits.find(d => 
        new Date(d.Date).getTime() === new Date(record.Date).getTime() &&
        d.Amount === record.Debit &&
        d['Paid to'] === record.Purpose
      )
      if (!match) return
      setDeleteType('debit')
      setDeletingRecord(match)
      setIsDeleteOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingRecord || !deleteType) return
    setDeleteButtonState('deleting')

    let success = false
    if (deleteType === 'credit') {
      success = await deleteCredit(
        deletingRecord._id,
        deletingRecord.Amount,
        deletingRecord.Purpose,
        deletingRecord.Date
      )
    } else {
      success = await deleteDebit(
        deletingRecord._id,
        deletingRecord.Amount,
        deletingRecord['Paid to'],
        deletingRecord.Date
      )
    }

    if (success) {
      setDeleteButtonState('deleted')
      setTimeout(() => {
        setIsDeleteOpen(false)
        setDeletingRecord(null)
        setDeleteType(null)
        setDeleteButtonState('idle')
      }, 1000)
    } else {
      setDeleteButtonState('error')
      setTimeout(() => setDeleteButtonState('idle'), 1500)
    }
  }

  // Derived metrics
  const totalIncome = credits.reduce((sum, item) => sum + item.Amount, 0)
  const totalExpense = debits.reduce((sum, item) => sum + item.Amount, 0)

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
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

      {/* Financial Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Balance Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group shadow-xl shadow-black/40">
          <div className="space-y-1.5 z-10">
            <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase block">Total Balance</span>
            <span className={`text-3xl font-bold tracking-tight block ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-indigo-400 shrink-0 z-10 shadow-inner">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>

        {/* Total Income Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group shadow-xl shadow-black/40">
          <div className="space-y-1.5 z-10">
            <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase block">Total Credits</span>
            <span className="text-3xl font-bold text-emerald-400 tracking-tight block">
              +₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-emerald-400 shrink-0 z-10 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>

        {/* Total Expense Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group shadow-xl shadow-black/40">
          <div className="space-y-1.5 z-10">
            <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase block">Total Debits</span>
            <span className="text-3xl font-bold text-rose-400 tracking-tight block">
              -₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-rose-400 shrink-0 z-10 shadow-inner">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      </div>

      {/* Category Breakdown & Trend Charts */}
      <div className="space-y-6">
        {/* Month Selector Filter Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-5 rounded-2xl gap-3 shadow-xl shadow-black/40">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              Category Distributions & Trends
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Visualize monthly cash flow breakdowns and financial trends.</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950 p-1.5 border border-zinc-800/60 rounded-xl shrink-0">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono pl-2">Select Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono cursor-pointer scheme-dark"
            />
          </div>
        </div>

        {/* Chart Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card A: Credits Category Distribution (Donut Chart) */}
          <div className="lg:col-span-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-xl shadow-black/40 flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-300 min-h-[380px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Income breakdown</h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                  ₹{monthlyCreditTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Donut Chart representation */}
              <div className="flex flex-col items-center py-2 relative">
                <div
                  className="w-32 h-32 rounded-full border border-zinc-800/50 shadow-inner relative transition-all duration-500 group-hover:scale-105"
                  style={{ background: getConicGradientString(creditBreakdown, creditColors) }}
                >
                  {/* Center Donut Hole */}
                  <div className="absolute inset-[15%] bg-zinc-950 border border-zinc-800/60 rounded-full flex flex-col items-center justify-center shadow-2xl">
                    {hoveredCreditCat ? (
                      <div className="text-center px-1.5 animate-in fade-in duration-200">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block font-mono truncate max-w-[70px]">
                          {hoveredCreditCat}
                        </span>
                        <span className="text-xs font-black text-white mt-0.5 block font-mono truncate max-w-[80px]">
                          ₹{creditBreakdown.find(c => c.name === hoveredCreditCat)?.amount.toLocaleString('en-IN') || '0'}
                        </span>
                        <span className="text-[8px] font-bold text-emerald-400 font-mono block mt-0.5">
                          {creditBreakdown.find(c => c.name === hoveredCreditCat)?.percentage.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <div className="text-center px-1.5">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">
                          Inflow
                        </span>
                        <span className="text-xs font-black text-emerald-400 mt-0.5 block font-mono truncate max-w-[80px]">
                          ₹{monthlyCreditTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 mt-4 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                {creditBreakdown.map(item => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredCreditCat(item.name)}
                    onMouseLeave={() => setHoveredCreditCat(null)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border transition-all duration-150 cursor-default ${
                      hoveredCreditCat === item.name
                        ? 'bg-zinc-800/60 border-zinc-700 text-zinc-100 scale-[1.01]'
                        : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: creditColors[item.name] || '#71717A' }}
                      />
                      <span className="text-[11px] font-semibold truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                      <span className="text-zinc-250 font-bold">₹{item.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-zinc-500 font-bold">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
                {creditBreakdown.length === 0 && (
                  <div className="text-center py-6 text-zinc-650 italic text-[11px] font-mono">
                    No income logged for {selectedMonth}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card B: Debits Category Distribution (Donut Chart) */}
          <div className="lg:col-span-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-xl shadow-black/40 flex flex-col justify-between group hover:border-rose-500/20 transition-all duration-300 min-h-[380px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Expense breakdown</h4>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md font-mono">
                  ₹{monthlyDebitTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Donut Chart representation */}
              <div className="flex flex-col items-center py-2 relative">
                <div
                  className="w-32 h-32 rounded-full border border-zinc-800/50 shadow-inner relative transition-all duration-500 group-hover:scale-105"
                  style={{ background: getConicGradientString(debitBreakdown, debitColors) }}
                >
                  {/* Center Donut Hole */}
                  <div className="absolute inset-[15%] bg-zinc-950 border border-zinc-800/60 rounded-full flex flex-col items-center justify-center shadow-2xl">
                    {hoveredDebitCat ? (
                      <div className="text-center px-1.5 animate-in fade-in duration-200">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block font-mono truncate max-w-[70px]">
                          {hoveredDebitCat}
                        </span>
                        <span className="text-xs font-black text-white mt-0.5 block font-mono truncate max-w-[80px]">
                          ₹{debitBreakdown.find(c => c.name === hoveredDebitCat)?.amount.toLocaleString('en-IN') || '0'}
                        </span>
                        <span className="text-[8px] font-bold text-rose-400 font-mono block mt-0.5">
                          {debitBreakdown.find(c => c.name === hoveredDebitCat)?.percentage.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <div className="text-center px-1.5">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">
                          Outflow
                        </span>
                        <span className="text-xs font-black text-rose-400 mt-0.5 block font-mono truncate max-w-[80px]">
                          ₹{monthlyDebitTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 mt-4 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                {debitBreakdown.map(item => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredDebitCat(item.name)}
                    onMouseLeave={() => setHoveredDebitCat(null)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border transition-all duration-150 cursor-default ${
                      hoveredDebitCat === item.name
                        ? 'bg-zinc-850 border-zinc-700/60 text-zinc-100 scale-[1.01]'
                        : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: debitColors[item.name] || '#71717A' }}
                      />
                      <span className="text-[11px] font-semibold truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                      <span className="text-zinc-250 font-bold">₹{item.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-zinc-500 font-bold">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
                {debitBreakdown.length === 0 && (
                  <div className="text-center py-6 text-zinc-650 italic text-[11px] font-mono">
                    No expenses logged for {selectedMonth}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card C: 6-Month comparative cash flow trend bar chart */}
          <div className="lg:col-span-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-xl shadow-black/40 flex flex-col justify-between group hover:border-indigo-500/20 transition-all duration-300 min-h-[380px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Cash Flow Overview</h4>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono">
                  6-Month Trend
                </span>
              </div>

              {/* Bar Chart Container */}
              <div className="flex items-end justify-between h-40 border-b border-zinc-800/80 pb-2 px-1 mt-6 relative">
                {/* Horizontal gridlines */}
                <div className="absolute inset-x-0 top-0 border-t border-zinc-800/10 h-0 w-full pointer-events-none" />
                <div className="absolute inset-x-0 top-[25%] border-t border-zinc-800/10 h-0 w-full pointer-events-none" />
                <div className="absolute inset-x-0 top-[50%] border-t border-zinc-800/10 h-0 w-full pointer-events-none" />
                <div className="absolute inset-x-0 top-[75%] border-t border-zinc-800/10 h-0 w-full pointer-events-none" />

                {last6Months.map((m) => {
                  const incomePct = (m.income / maxMonthlyVal) * 100
                  const expensePct = (m.expense / maxMonthlyVal) * 100

                  return (
                    <div key={m.key} className="flex flex-col items-center flex-1 group/col relative">
                      {/* Tooltip Overlay (displays on column hover) */}
                      <div className="absolute bottom-[105%] bg-zinc-950 border border-zinc-800/80 px-2.5 py-1.5 rounded-xl shadow-2xl hidden group-hover/col:flex flex-col text-[10px] font-mono font-bold space-y-1 z-30 pointer-events-none whitespace-nowrap leading-none border-indigo-500/25">
                        <p className="text-zinc-500 uppercase tracking-wider text-[9px] mb-0.5">{m.label}</p>
                        <p className="text-emerald-400">In: ₹{m.income.toLocaleString('en-IN')}</p>
                        <p className="text-rose-400">Out: ₹{m.expense.toLocaleString('en-IN')}</p>
                      </div>

                      {/* Twin Bars */}
                      <div className="flex items-end gap-1.5 h-32 w-full justify-center">
                        <div
                          className="w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 transition-all rounded-t-sm cursor-pointer relative shadow-inner"
                          style={{ height: `${Math.max(incomePct, 2)}%` }}
                        />
                        <div
                          className="w-2.5 bg-gradient-to-t from-rose-600 to-rose-400 hover:from-rose-500 hover:to-rose-350 transition-all rounded-t-sm cursor-pointer relative shadow-inner"
                          style={{ height: `${Math.max(expensePct, 2)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* X-Axis labels */}
              <div className="flex justify-between px-1 pt-2 font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
                {last6Months.map(m => (
                  <span key={m.key} className="flex-1 text-center truncate">{m.label}</span>
                ))}
              </div>
            </div>

            {/* Subtitle Legend for the trend chart */}
            <div className="flex items-center justify-center gap-4.5 pt-4 border-t border-zinc-800/40 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Inflow (Credit)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>Outflow (Debit)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-black/20 backdrop-blur-md">
        
        {/* Table Header Area */}
        <div className="px-6 py-4.5 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-400" />
              Unified Transactions Ledger
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Comprehensive view of all financial activities and running balance.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase bg-zinc-950 border border-zinc-800/80 px-2.5 py-1.5 rounded-lg shadow-inner">
              {unifiedRecords.length} Records
            </span>

            <button
              onClick={fetchUnifiedRecords}
              disabled={loading}
              className="p-2 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer active:scale-95 transition-all"
              title="Refresh Transactions Ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Body Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/40 text-zinc-400 font-medium tracking-wider uppercase text-[10px] border-b border-zinc-800/60">
                <th className="px-6 py-3.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> Date</th>
                <th className="px-6 py-3.5">Purpose / Paid To</th>
                <th className="px-6 py-3.5">Payment Node</th>
                <th className="px-6 py-3.5 text-right">Debit (-)</th>
                <th className="px-6 py-3.5 text-right">Credit (+)</th>
                <th className="px-6 py-3.5 text-right">Running Balance</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 font-sans text-sm">
              {unifiedRecords.map((record) => (
                <tr key={record._id} className="hover:bg-zinc-800/20 transition-colors">
                  
                  {/* Date */}
                  <td className="px-6 py-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                    {formatDate(record.Date)}
                  </td>
                  
                  {/* Purpose / Paid To */}
                  <td className="px-6 py-4 text-zinc-200 font-medium whitespace-nowrap">
                    {record.Purpose || '-'}
                  </td>
                  
                  {/* Payment Node Pill */}
                  <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800/80 text-zinc-300 rounded-lg text-xs font-medium">
                      <span>{record['Source of Payment'] || '-'}</span>
                    </span>
                  </td>
                  
                  {/* Debit Amount */}
                  <td className="px-6 py-4 text-right font-mono font-bold text-rose-400 text-sm whitespace-nowrap">
                    {record.Debit > 0 ? `-₹${record.Debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  
                  {/* Credit Amount */}
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                    {record.Credit > 0 ? `+₹${record.Credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  
                  {/* Running Balance */}
                  <td className="px-6 py-4 text-right font-mono font-bold text-white text-sm whitespace-nowrap">
                    ₹{record.Balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(record)}
                        className="p-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white rounded-lg cursor-pointer transition-all active:scale-90"
                        title="Edit Transaction"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(record)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-450 hover:text-rose-450 rounded-lg cursor-pointer transition-all active:scale-90"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  
                </tr>
              ))}
              
              {/* Empty State */}
              {unifiedRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 italic font-normal">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>Synchronizing ledger...</span>
                      </div>
                    ) : (
                      'No ledger transactions recorded yet. Navigate to Debit or Credit sheets to enter data.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && editingRecord && editType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200 text-xs">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
                <Edit className={`w-5 h-5 ${editType === 'credit' ? 'text-emerald-400' : 'text-rose-450'}`} />
                Edit {editType === 'credit' ? 'Income' : 'Expense'} Record
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Modify current transaction values in the master ledger.</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Amount Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                  Amount (₹) <span className={`${editType === 'credit' ? 'text-emerald-400' : 'text-rose-450'} font-bold ml-0.5`}>*</span>
                </label>
                <div className={`relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-${editType === 'credit' ? 'emerald-500/50' : 'rose-500/50'} transition-all duration-150`}>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full h-10 px-3 text-zinc-100 text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Source of Payment / Payment Method Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                    {editType === 'credit' ? 'Source of Payment' : 'Payment Method'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditSourceOpen(!isEditSourceOpen)
                      setIsEditPurposeOpen(false)
                    }}
                    className="w-full h-10 px-3 text-left flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950 hover:bg-zinc-900/40 text-zinc-200 font-medium cursor-pointer"
                  >
                    <span className="text-xs truncate">
                      {editSourceOfPayment || 'Select Item'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </button>

                  {isEditSourceOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsEditSourceOpen(false)} />
                      <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 overflow-y-auto max-h-40">
                        {(editType === 'credit' ? sourceOptions : paymentMethods).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setEditSourceOfPayment(opt.value)
                              setIsEditSourceOpen(false)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-900 cursor-pointer"
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Purpose / Category Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                    {editType === 'credit' ? 'Purpose / Category' : 'Paid To / Category'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditPurposeOpen(!isEditPurposeOpen)
                      setIsEditSourceOpen(false)
                    }}
                    className="w-full h-10 px-3 text-left flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950 hover:bg-zinc-900/40 text-zinc-200 font-medium cursor-pointer"
                  >
                    <span className="text-xs truncate">
                      {editPurpose || 'Select Category'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </button>

                  {isEditPurposeOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsEditPurposeOpen(false)} />
                      <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 overflow-y-auto max-h-40">
                        {(editType === 'credit' ? purposeOptions : paidToOptions).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setEditPurpose(opt.value)
                              setIsEditPurposeOpen(false)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-900 cursor-pointer"
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Other Source / Method Text Input */}
              {editSourceOfPayment === 'Other' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                    Specify {editType === 'credit' ? 'Source' : 'Method'}
                  </label>
                  <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950">
                    <input
                      type="text"
                      required
                      placeholder="Specify details..."
                      value={editOtherSourceText}
                      onChange={(e) => setEditOtherSourceText(e.target.value)}
                      className="w-full h-10 px-3 text-zinc-200 text-xs bg-transparent outline-none border-none placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              )}

              {/* Other Purpose / Category Text Input */}
              {editPurpose === 'Other' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Specify Category</label>
                  <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950">
                    <input
                      type="text"
                      required
                      placeholder="Specify custom category..."
                      value={editOtherPurposeText}
                      onChange={(e) => setEditOtherPurposeText(e.target.value)}
                      className="w-full h-10 px-3 text-zinc-200 text-xs bg-transparent outline-none border-none placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              )}

              {/* Credited From Field (Only for Credits) */}
              {editType === 'credit' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Credited From</label>
                  <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corp"
                      value={editCreditedFrom}
                      onChange={(e) => setEditCreditedFrom(e.target.value)}
                      className="w-full h-10 px-3 text-zinc-200 text-xs bg-transparent outline-none border-none placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              )}

              {/* Date Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Date</label>
                <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950">
                  <input
                    type="datetime-local"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full h-10 px-3 text-zinc-200 text-xs bg-transparent outline-none border-none scheme-dark cursor-pointer"
                  />
                </div>
              </div>

              {/* Note Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Note (Optional)</label>
                <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950">
                  <textarea
                    rows={2}
                    placeholder="Transaction details..."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-none outline-none text-xs text-zinc-200 placeholder:text-zinc-700 resize-none font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false)
                    setEditingRecord(null)
                    setEditType(null)
                  }}
                  className="flex-1 h-10 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 font-semibold cursor-pointer active:scale-[0.98] transition-all bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || editButtonState === 'saving'}
                  className={`flex-1 h-10 rounded-xl font-semibold transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                    editButtonState === 'saving'
                      ? 'bg-zinc-850 text-zinc-500 border border-zinc-800/80 cursor-not-allowed'
                      : editButtonState === 'saved'
                      ? 'bg-emerald-600 text-white'
                      : editButtonState === 'error'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-zinc-950 hover:bg-zinc-200'
                  }`}
                >
                  {editButtonState === 'saving' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : editButtonState === 'saved' ? (
                    'Updated ✓'
                  ) : editButtonState === 'error' ? (
                    'Failed ✗'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && deletingRecord && deleteType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-150 text-xs">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-rose-500 animate-pulse" />
                Confirm {deleteType === 'credit' ? 'Inflow' : 'Expense'} Deletion
              </h3>
              <p className="text-xs text-zinc-400 mt-1">This operation is permanent. Please review the details below.</p>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-xl p-4.5 space-y-3 font-medium text-zinc-300">
              <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                <span className="text-zinc-500 font-normal">Amount:</span>
                <span className={`font-mono font-bold ${deleteType === 'credit' ? 'text-emerald-400' : 'text-rose-450'}`}>
                  {deleteType === 'credit' ? '+' : '-'}₹{deletingRecord.Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                <span className="text-zinc-500 font-normal">Category:</span>
                <span>{deleteType === 'credit' ? deletingRecord.Purpose : deletingRecord['Paid to']}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                <span className="text-zinc-500 font-normal">{deleteType === 'credit' ? 'Credited From' : 'Payment Method'}:</span>
                <span>{deleteType === 'credit' ? deletingRecord['Credited From'] : deletingRecord['Payment Method']}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-normal">Date:</span>
                <span className="font-mono">{formatDate(deletingRecord.Date)}</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl flex items-start gap-3 ${deleteType === 'credit' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450'}`}>
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${deleteType === 'credit' ? 'text-rose-500' : 'text-emerald-500'}`} />
              <div className="space-y-1">
                <p className="font-semibold text-zinc-200">Wallet Impact Warning</p>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  {deleteType === 'credit' ? (
                    <>
                      Deleting this credit will reduce your wallet balance by <span className="text-rose-400 font-bold font-mono">₹{deletingRecord.Amount.toLocaleString()}</span>.
                    </>
                  ) : (
                    <>
                      Deleting this expense will increase your wallet balance by <span className="text-emerald-400 font-bold font-mono">₹{deletingRecord.Amount.toLocaleString()}</span>.
                    </>
                  )}
                  {" "}This change propagates to the unified cash flow ledger instantly.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false)
                  setDeletingRecord(null)
                  setDeleteType(null)
                }}
                className="flex-1 h-10 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 font-semibold cursor-pointer active:scale-[0.98] transition-all bg-transparent"
              >
                Keep Record
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading || deleteButtonState === 'deleting'}
                className={`flex-1 h-10 rounded-xl font-semibold transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                  deleteButtonState === 'deleting'
                    ? 'bg-rose-900/40 text-rose-450/50 border border-rose-900/60 cursor-not-allowed'
                    : deleteButtonState === 'deleted'
                    ? 'bg-zinc-800 text-zinc-500'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
              >
                {deleteButtonState === 'deleting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : deleteButtonState === 'deleted' ? (
                  'Deleted ✓'
                ) : deleteButtonState === 'error' ? (
                  'Error ✗'
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
