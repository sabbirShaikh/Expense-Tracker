import { useLedger } from '../hooks/useLedger'
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Layers,
  RefreshCw,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react'

export function DashboardPage() {
  const {
    credits,
    debits,
    unifiedRecords,
    balance,
    loading,
    error,
    fetchUnifiedRecords,
  } = useLedger()

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
                  
                </tr>
              ))}
              
              {/* Empty State */}
              {unifiedRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-500 italic font-normal">
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

    </div>
  )
}