import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  RefreshCw,
  GitMerge,
  Smartphone,
  Banknote,
  Wallet,
  CheckCircle2,
  Lock,
  Trash2,
  Edit2,
  Info,
  Calendar,
  UserCheck,
  TrendingUp,
  FileText,
  Mail
} from 'lucide-react'
import './LandingPage.css'

export function LandingPage() {
  const [lockAmount, setLockAmount] = useState(50000)

  // Public Q&A State
  const [activeQaIdx, setActiveQaIdx] = useState<number | null>(null);

  // Public Support Form State
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportStatus, setSupportStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportSubject || !supportMessage) return;

    setSupportStatus('sending');
    try {
      const res = await fetch('/api/support/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportName,
          email: supportEmail,
          subject: supportSubject,
          message: supportMessage
        })
      });

      if (res.ok) {
        setSupportStatus('sent');
        setSupportName('');
        setSupportEmail('');
        setSupportSubject('');
        setSupportMessage('');
        setTimeout(() => setSupportStatus('idle'), 4000);
      } else {
        setSupportStatus('error');
        setTimeout(() => setSupportStatus('idle'), 4000);
      }
    } catch (err) {
      setSupportStatus('error');
      setTimeout(() => setSupportStatus('idle'), 4000);
    }
  };

  // Interactive playground state
  const [pgAmount, setPgAmount] = useState('')
  const [pgCategory, setPgCategory] = useState('')
  const [pgType, setPgType] = useState<'credit' | 'debit'>('credit')
  const [pgBalance, setPgBalance] = useState(184250) // starts with hero amount
  
  // Starting playground transactions log
  const [pgLog, setPgLog] = useState<Array<{ cat: string; amt: number; type: 'credit' | 'debit'; time: string }>>([
    { cat: 'Client retainer · Acme Co.', amt: 18200, type: 'credit', time: '5m ago' },
    { cat: 'AWS · Infra hosting', amt: 4500, type: 'debit', time: '12m ago' },
    { cat: 'Freelance retainer · Nova', amt: 22000, type: 'credit', time: '1h ago' },
    { cat: 'Notion · Team plan', amt: 1499, type: 'debit', time: '3h ago' },
  ])
  
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errorInput, setErrorInput] = useState(false)

  // Peer Transaction Settle State
  interface PeerTx {
    name: string
    type: 'borrowed' | 'lent'
    amt: number
    purpose: string
    status: 'pending' | 'resolved'
  }
  const [peerTxs, setPeerTxs] = useState<PeerTx[]>([
    { name: 'Alex Johnson', type: 'borrowed', amt: 15000, purpose: 'Shared Server Hosting', status: 'pending' },
    { name: 'Sarah Miller', type: 'lent', amt: 12000, purpose: 'API Integration Project', status: 'pending' },
    { name: 'Dave Wilson', type: 'lent', amt: 4500, purpose: 'Figma Design Assets', status: 'resolved' },
    { name: 'Jessica Taylor', type: 'borrowed', amt: 3200, purpose: 'API Key Shared Billing', status: 'pending' },
  ])

  // Form submit handler
  const handlePlaygroundSubmit = () => {
    const amt = parseFloat(pgAmount)
    const cat = pgCategory.trim() || 'Uncategorized'
    if (isNaN(amt) || amt <= 0) {
      setErrorInput(true)
      setTimeout(() => setErrorInput(false), 900)
      return
    }

    const isCredit = pgType === 'credit'
    setPgBalance(prev => prev + (isCredit ? amt : -amt))
    setPgLog(prev => [{ cat, amt, type: pgType, time: 'just now' }, ...prev])
    setPgAmount('')
    setPgCategory('')
    setToastMessage('Transaction recorded and balance recalculated.')
    setShowToast(true)
  }

  // Delete transaction from sandbox simulation
  const handlePlaygroundDelete = (idx: number) => {
    const tx = pgLog[idx]
    const isCredit = tx.type === 'credit'
    setPgBalance(prev => prev - (isCredit ? tx.amt : -tx.amt))
    setPgLog(prev => prev.filter((_, i) => i !== idx))
    setToastMessage('Transaction deleted and balance recalculated.')
    setShowToast(true)
  }

  // Edit transaction from sandbox simulation (loads into input fields)
  const handlePlaygroundEdit = (idx: number) => {
    const tx = pgLog[idx]
    setPgAmount(tx.amt.toString())
    setPgCategory(tx.cat)
    setPgType(tx.type)
    
    // Remove it from log and subtract balance so they can edit it
    const isCredit = tx.type === 'credit'
    setPgBalance(prev => prev - (isCredit ? tx.amt : -tx.amt))
    setPgLog(prev => prev.filter((_, i) => i !== idx))
    
    setToastMessage('Loaded into form inputs below for modifications.')
    setShowToast(true)
  }

  // Resolve borrowed/lent peer transactions
  const handleResolvePeerTx = (idx: number) => {
    setPeerTxs(prev => prev.map((tx, i) => i === idx ? { ...tx, status: 'resolved' } : tx))
    setToastMessage(`Settled transaction with ${peerTxs[idx].name}.`)
    setShowToast(true)
  }

  useEffect(() => {
    document.title = "WalletInsights — Track Income, Expenses & Friends' Debits"
  }, [])

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const fmtINR = (n: number) => {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 })
  }

  // Hero section static ledger mock rows
  const heroRows: Array<{ cat: string; node: string; amt: number; type: string; time: string }> = [
    { cat: 'Client payment · Acme Co.', node: 'PhonePe', amt: 18200, type: 'credit', time: '2m ago' },
    { cat: 'AWS · Infra hosting', node: 'Card', amt: -4500, type: 'debit', time: '41m ago' },
    { cat: 'Freelance retainer · Nova', node: 'GPay', amt: 22000, type: 'credit', time: '1h ago' },
    { cat: 'Notion · Team plan', node: 'Card', amt: -1499, type: 'debit', time: '3h ago' },
    { cat: 'Salary deposit', node: 'Salary', amt: 65000, type: 'credit', time: 'yesterday' },
  ]

  return (
    <div className="landing-body min-h-screen bg-[#fcfcfd] font-['Manrope',sans-serif] text-zinc-800 selection:bg-indigo-100 scroll-smooth antialiased overflow-x-hidden">
      
      {/* ============ NAV ============ */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-extrabold text-[16px] tracking-tight text-zinc-900">
              Wallet<span className="text-indigo-600 font-medium">Insights</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-zinc-500 tracking-wide">
            <a href="#features" className="nav-link hover:text-zinc-900 transition-colors">Features</a>
            <a href="#analytics" className="nav-link hover:text-zinc-900 transition-colors">Monthly Reports</a>
            <a href="#lending" className="nav-link hover:text-zinc-900 transition-colors">Debt Settlement</a>
            <a href="#comparison" className="nav-link hover:text-zinc-900 transition-colors">Compare</a>
            <a href="#playground" className="nav-link hover:text-zinc-900 transition-colors">Sandbox Demo</a>
            <a href="#support-section" className="nav-link hover:text-zinc-900 transition-colors">Support</a>
          </nav>

          <Link
            to="/login"
            className="transition-transform duration-150 active:scale-[0.98] bg-zinc-950 text-white text-[13px] font-semibold px-4.5 py-2 rounded-full hover:bg-zinc-800 shadow-sm"
          >
            Launch Workspace
          </Link>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden" style={{ background: 'radial-gradient(ellipse 80% 65% at 50% -10%, rgba(99,102,241,0.06) 0%, transparent 60%)' }}>
        <div className="blob-a absolute rounded-full blur-[90px] pointer-events-none z-0 w-[450px] h-[450px] bg-indigo-100/60 -top-20 left-[10%]"></div>
        <div className="blob-b absolute rounded-full blur-[90px] pointer-events-none z-0 w-[400px] h-[400px] bg-violet-100/50 top-10 right-[8%]"></div>
        <div className="absolute inset-x-0 top-0 h-[600px] grid-fade z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/80 text-[12px] font-semibold text-zinc-600 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>
            Income, Expense, and Debt Management Workspace
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-950">
            Manage All Your Money, Expenses,<br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">and Peer Loans in One Place.</span>
          </h1>

          <p className="mt-5 text-zinc-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            WalletInsights is a complete financial workspace. Set starting balances, log daily earnings and spendings, manage loans you lend or borrow, create quick buttons for daily items, and email PDF reports.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="transition-transform duration-150 active:scale-[0.98] px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold text-[14px] shadow-lg shadow-indigo-600/15 hover:bg-indigo-500"
            >
              Get Started Free
            </Link>
            <a
              href="#playground"
              className="transition-transform duration-150 active:scale-[0.98] px-6 py-3 rounded-full border border-zinc-200 bg-white text-zinc-600 font-semibold text-[14px] hover:bg-zinc-50"
            >
              Try Interactive Sandbox
            </a>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 relative">
            <div className="absolute -inset-6 bg-gradient-to-b from-indigo-50/30 to-transparent blur-3xl rounded-[40px]"></div>
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-xl shadow-zinc-200/40 text-left">
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span>
                </div>
                <span className="font-['JetBrains_Mono',monospace] text-[11px] text-zinc-400 font-semibold">workspace / walletinsights.live</span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/40">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5 font-mono">Current Cash Balance</p>
                  <p className="text-2xl font-bold font-['JetBrains_Mono',monospace] text-zinc-900">₹1,84,250.00</p>
                  <p className="text-[10px] text-zinc-500 mt-1">as of today, 6:42 PM</p>
                </div>
                
                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/40">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Total Earnings (Inflow)
                  </p>
                  <p className="text-2xl font-bold font-['JetBrains_Mono',monospace] text-emerald-600">₹2,40,000.00</p>
                  <p className="text-[10px] text-zinc-500 mt-1">12 incomes this month</p>
                </div>

                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/40">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" /> Total Spendings (Outflow)
                  </p>
                  <p className="text-2xl font-bold font-['JetBrains_Mono',monospace] text-rose-600">₹55,750.00</p>
                  <p className="text-[10px] text-zinc-500 mt-1">28 expenses this month</p>
                </div>
              </div>

              <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-zinc-200/85 flex items-center justify-between bg-zinc-50">
                  <span className="text-[12px] font-bold text-zinc-700">Recent Transactions</span>
                  <span className="text-[10px] text-zinc-500 font-['JetBrains_Mono',monospace] uppercase font-bold tracking-wider">Live Log</span>
                </div>
                <div className="divide-y divide-zinc-200/50 max-h-48 overflow-y-auto">
                  {heroRows.map((r, i) => {
                    const isCredit = r.type === 'credit'
                    return (
                      <div key={i} className="px-4 py-2.5 flex items-center justify-between transition-all duration-200 hover:bg-zinc-50 hover:translate-x-0.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isCredit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-[12.5px] text-zinc-800 font-semibold">{r.cat}</p>
                            <p className="text-[11px] text-zinc-400 font-medium">{r.node} · {r.time}</p>
                          </div>
                        </div>
                        <span className={`font-['JetBrains_Mono',monospace] text-[12.5px] font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isCredit ? '+' : '−'} ₹{Math.abs(r.amt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE BENTO GRID ============ */}
      <section id="features" className="relative px-6 py-24 max-w-7xl mx-auto border-b border-zinc-100">
        <div className="mb-14 max-w-xl">
          <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Core Features</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">Complete money tracking, built for everyone.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Card A: Starting Balance Settings */}
          <div className="md:col-span-1 md:row-span-2 bg-white border border-zinc-200/80 rounded-2xl p-6 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-zinc-200/30 flex flex-col group">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-extrabold text-[17px] text-zinc-900 mb-2">Adjustable Starting Balance</h3>
            <p className="text-zinc-500 text-[13px] leading-relaxed mb-6 font-medium">Configure your starting balance during signup or update it anytime directly from your settings. The system automatically recalculates all ledger entries on the fly.</p>

            <div className="mt-auto bg-zinc-50 border border-zinc-150 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                  Fully Adjustable Sandbox
                </span>
              </div>
              <p className="font-['JetBrains_Mono',monospace] text-xl font-bold text-zinc-900 mb-3">
                {fmtINR(lockAmount)}
              </p>
              <input
                type="range"
                min="0"
                max="200000"
                step="500"
                value={lockAmount}
                onChange={(e) => setLockAmount(Number(e.target.value))}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Card B: Unified Ledger */}
          <div className="md:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-6 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-zinc-200/30 group">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="w-10 h-10 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-extrabold text-[17px] text-zinc-900 mb-1">Unified Transaction History</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed max-w-md font-medium">Incomes and expenses flow automatically into one running list sorted by date. View the exact payment method (like PhonePe, Cash, or Cards) to keep your ledger organized.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-500/[0.03] border border-emerald-500/15 p-4">
                <p className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase mb-1.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Inflow
                </p>
                <p className="font-['JetBrains_Mono',monospace] text-lg font-bold text-emerald-600">+ ₹18,200.00</p>
                <p className="text-[10px] text-zinc-400 mt-1">Client payment · Acme Co.</p>
              </div>
              
              <div className="rounded-xl bg-rose-500/[0.03] border border-rose-500/15 p-4">
                <p className="text-[10px] text-rose-600 font-bold tracking-wide uppercase mb-1.5 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Outflow
                </p>
                <p className="font-['JetBrains_Mono',monospace] text-lg font-bold text-rose-600">− ₹4,500.00</p>
                <p className="text-[10px] text-zinc-400 mt-1">AWS · Infra hosting</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-[12px] text-zinc-400 font-semibold">
              <GitMerge className="w-3.5 h-3.5" />
              Merged into running balance: <span className="font-['JetBrains_Mono',monospace] text-zinc-700 font-bold">₹63,700.00</span>
            </div>
          </div>

          {/* Card C: Cloud Sync */}
          <div id="sync" className="md:col-span-1 bg-white border border-zinc-200/80 rounded-2xl p-6 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-zinc-200/30 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
              <RefreshCw className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-[17px] text-zinc-900 mb-2">Real-Time Cloud Sync</h3>
            <p className="text-zinc-500 text-[13px] leading-relaxed mb-5 font-medium">Every change saved locally syncs instantly to your cloud database worksheets. Your reports are always perfectly in step.</p>
            
            <svg viewBox="0 0 200 70" className="w-full h-16">
              <rect x="4" y="22" width="50" height="26" rx="6" fill="rgba(79,70,229,0.04)" stroke="rgba(79,70,229,0.2)"/>
              <text x="29" y="38" text-anchor="middle" fill="#4f46e5" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">local</text>
              <path d="M58 35 H140" stroke="#10b981" strokeWidth="2" className="sync-line" fill="none"/>
              <rect x="146" y="22" width="50" height="26" rx="6" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.2)"/>
              <text x="171" y="38" text-anchor="middle" fill="#10b981" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">cloud</text>
            </svg>
          </div>

          {/* Card D: Payment Nodes */}
          <div className="md:col-span-1 bg-white border border-zinc-200/80 rounded-2xl p-6 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-zinc-200/30 group">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center mb-5">
              <Wallet className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-extrabold text-[17px] text-zinc-900 mb-2">Multi-Channel Nodes</h3>
            <p className="text-zinc-500 text-[13px] leading-relaxed mb-5 font-medium">Tag transactions by how money actually moves, creating structured audits for easy tax filing and cash flow planning.</p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-650 flex items-center gap-1.5 font-medium">
                <Smartphone className="w-3 h-3 text-zinc-400" />PhonePe
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-650 flex items-center gap-1.5 font-medium">
                <Smartphone className="w-3 h-3 text-zinc-400" />GPay
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-650 flex items-center gap-1.5 font-medium">
                <Banknote className="w-3 h-3 text-zinc-400" />Salary
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-650 flex items-center gap-1.5 font-medium">
                <Wallet className="w-3 h-3 text-zinc-400" />Cash
              </span>
            </div>
          </div>

          {/* Card E: Customizable Quick Presets (New Row Banner) */}
          <div className="md:col-span-3 bg-white border border-zinc-200/80 rounded-2xl p-6 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-zinc-200/30 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="max-w-xl">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-extrabold text-[17px] text-zinc-900 mb-1">Customizable Payment Presets</h3>
              <p className="text-zinc-500 text-[13px] leading-relaxed font-medium">
                Set any number of custom credit or debit quick preset pills. Save your recurring payments and tap to populate fields instantly next time you record.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">
              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-750 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> AWS Hosting · ₹5,000
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-750 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Client Retainer · ₹45,000
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-750 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Shared Office Rent · ₹15,000
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-400 border-dashed">
                + Add Custom Preset
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ============ MONTHLY REPORTS (ANALYTICS) ============ */}
      <section id="analytics" className="relative px-6 py-24 max-w-7xl mx-auto border-b border-zinc-100">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Category Insights</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
              Monthly Category-Wise Distribution
            </h2>
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Understand exactly where your cash flow originates and goes. WalletInsights aggregates transaction entries to present monthly breakdowns of income and expense categories instantly.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800">Identify High Earners</p>
                  <p className="text-xs text-zinc-500 font-medium">Spot consultancy client sources or ad-hoc retainers carrying the highest margins.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 text-rose-600">
                  <Info className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800">One-Click Statements & Email Reports</p>
                  <p className="text-xs text-zinc-500 font-medium">Generate offline Excel/CSV spreadsheet audits, download reports, or dispatch statements straight to your email inbox with a single tap.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-xl shadow-zinc-200/30">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-[13px] font-extrabold text-zinc-800">Monthly Cash Breakdown — June 2026</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Active Summary</span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Credit Distribution */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inflow Categories (Credits)
                  </h4>
                  <div className="flex flex-col gap-4.5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-700">Client Payments</span>
                        <span className="text-zinc-900 font-bold">₹1,85,000.00 (74%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="progress-bar-fill-credits" style={{ width: '74%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-700">Monthly Retainers</span>
                        <span className="text-zinc-900 font-bold">₹45,000.00 (18%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="progress-bar-fill-credits" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-700">Reimbursements</span>
                        <span className="text-zinc-900 font-bold">₹20,000.00 (8%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="progress-bar-fill-credits" style={{ width: '8%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Debit Distribution */}
                <div>
                  <h4 className="text-[12px] font-extrabold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Outflow Categories (Debits)
                  </h4>
                  <div className="flex flex-col gap-4.5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-700">Cloud Infra (AWS/Vercel)</span>
                        <span className="text-zinc-900 font-bold">₹25,000.00 (45%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="progress-bar-fill-debits" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-700">Software & Online Tools</span>
                        <span className="text-zinc-900 font-bold">₹18,000.00 (32%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="progress-bar-fill-debits" style={{ width: '32%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-700">Freelance Contractors</span>
                        <span className="text-zinc-900 font-bold">₹12,750.00 (23%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className="progress-bar-fill-debits" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download / Email Actions Demo */}
              <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-zinc-550 font-semibold flex items-center gap-1">
                    CSV / Excel exports and automated PDF email delivery active.
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setToastMessage('Statement Excel file generated and downloading.')
                      setShowToast(true)
                    }}
                    className="flex-1 sm:flex-initial transition-transform duration-150 active:scale-[0.98] px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Download XLS
                  </button>
                  <button
                    onClick={() => {
                      setToastMessage('Statement audit report emailed to user address.')
                      setShowToast(true)
                    }}
                    className="flex-1 sm:flex-initial transition-transform duration-150 active:scale-[0.98] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-650/10"
                  >
                    <Mail className="w-3.5 h-3.5" /> Send to Email
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ============ DEBT SETTLEMENT (BORROW & LEND TRACKER) ============ */}
      <section id="lending" className="relative px-6 py-24 max-w-7xl mx-auto border-b border-zinc-100">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 order-last lg:order-first min-w-0 w-full">
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-xl shadow-zinc-200/30 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
                <span className="text-[13px] font-extrabold text-zinc-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-zinc-400" />
                  Borrow & Lend Settle Ledger
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold font-['JetBrains_Mono',monospace]">Sandbox simulation</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold min-w-[650px]">
                  <thead>
                    <tr className="text-zinc-400 border-b border-zinc-100 uppercase tracking-wider">
                      <th className="pb-2.5">Peer Name</th>
                      <th className="pb-2.5">Flow Type</th>
                      <th className="pb-2.5">Amount</th>
                      <th className="pb-2.5">Purpose / Memo</th>
                      <th className="pb-2.5 text-right">Settlement Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {peerTxs.map((item, idx) => {
                      const isLent = item.type === 'lent'
                      const isResolved = item.status === 'resolved'
                      return (
                        <tr key={idx} className="hover:bg-zinc-50/50">
                          <td className="py-3 font-bold text-zinc-800">{item.name}</td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLent ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {isLent ? 'Lent (Owed to me)' : 'Borrowed (Owed)'}
                            </span>
                          </td>
                          <td className="py-3 font-['JetBrains_Mono',monospace] font-bold text-zinc-800">
                            {fmtINR(item.amt)}
                          </td>
                          <td className="py-3 text-zinc-500 font-medium">{item.purpose}</td>
                          <td className="py-3 text-right">
                            {isResolved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                              </span>
                            ) : (
                              <button
                                onClick={() => handleResolvePeerTx(idx)}
                                className="transition-transform duration-150 active:scale-[0.98] bg-zinc-950 text-white hover:bg-zinc-800 text-[10px] font-bold px-3 py-1 rounded-md"
                              >
                                Settle / Clear
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Resolve Peer Balances</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
              Peer lending & Borrow / Lend Tracker
            </h2>
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Don't lose track of money you borrowed from colleagues or lent to friends. WalletInsights comes with a built-in debt tracker to log peer-to-peer flows and clear them with a single click as soon as payments settle.
            </p>
            <div className="flex flex-col gap-3.5 text-sm text-zinc-600 font-medium">
              <p>✔ Log peer-to-peer debts alongside your main business balances.</p>
              <p>✔ Resolve balances to prevent double logging or balance inflation.</p>
              <p>✔ Link settlements directly back into credit/debit audit paths.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ============ COMPARISON SECTION ============ */}
      <section id="comparison" className="relative px-6 py-24 max-w-7xl mx-auto border-b border-zinc-100">
        <div className="text-center mb-16">
          <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Why WalletInsights</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">How WalletInsights Compares</h2>
          <p className="text-zinc-500 max-w-lg mx-auto text-sm font-medium mt-2">
            See why developers and small teams prefer WalletInsights over traditional apps and fragile manual spreadsheets.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-zinc-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[650px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-650 font-bold">
                  <th className="p-4.5 font-extrabold">Feature / Capability</th>
                  <th className="p-4.5 font-extrabold text-indigo-650 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> WalletInsights
                  </th>
                  <th className="p-4.5 font-extrabold text-zinc-500">Other Apps</th>
                  <th className="p-4.5 font-extrabold text-zinc-500">Spreadsheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                <tr className="hover:bg-zinc-50/40">
                  <td className="p-4.5">Pricing Model</td>
                  <td className="p-4.5 text-indigo-600 font-bold">100% Free for Everyone</td>
                  <td className="p-4.5 text-zinc-500 font-medium">Monthly subscriptions</td>
                  <td className="p-4.5 text-zinc-500 font-medium">Free / License required</td>
                </tr>
                <tr className="hover:bg-zinc-50/40">
                  <td className="p-4.5">Starting Balance Adjustment</td>
                  <td className="p-4.5 text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Yes (Change settings at any time)
                  </td>
                  <td className="p-4.5 text-rose-500 font-bold">No (Manual reconciliations)</td>
                  <td className="p-4.5 text-rose-500 font-bold">No (Accidental cell edits)</td>
                </tr>
                <tr className="hover:bg-zinc-50/40">
                  <td className="p-4.5">Peer-to-Peer Borrow/Lend Tracker</td>
                  <td className="p-4.5 text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Yes (One-click settle)
                  </td>
                  <td className="p-4.5 text-zinc-500 font-medium">No (Requires extra accounts)</td>
                  <td className="p-4.5 text-rose-500 font-bold">No (Messy manual ledgers)</td>
                </tr>
                <tr className="hover:bg-zinc-50/40">
                  <td className="p-4.5">Custom Quick Presets</td>
                  <td className="p-4.5 text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Yes (Unlimited custom shortcuts)
                  </td>
                  <td className="p-4.5 text-zinc-500 font-medium">No (Fixed categorizations)</td>
                  <td className="p-4.5 text-rose-500 font-bold">No (Requires manual typing)</td>
                </tr>
                <tr className="hover:bg-zinc-50/40">
                  <td className="p-4.5">Export Statements (Email / PDF)</td>
                  <td className="p-4.5 text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Yes (Single click delivery)
                  </td>
                  <td className="p-4.5 text-zinc-500 font-medium">Paid add-on</td>
                  <td className="p-4.5 text-zinc-500 font-medium">Manual print configuration</td>
                </tr>
                <tr className="hover:bg-zinc-50/40">
                  <td className="p-4.5">Real-Time Cloud Sync</td>
                  <td className="p-4.5 text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Yes (Zero-config instant save)
                  </td>
                  <td className="p-4.5 text-zinc-500 font-medium">Batch offline uploads</td>
                  <td className="p-4.5 text-zinc-500 font-medium">Fragile custom scripts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============ CRUD AND EDIT/DELETE SECTION ============ */}
      <section id="crud" className="relative px-6 py-24 max-w-7xl mx-auto border-b border-zinc-100">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Easy Updates</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
              Fix Mistakes Instantly: Edit or Delete
            </h2>
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Made an entry mistake? No problem. WalletInsights lets you easily edit description tags, payment methods, or transaction amounts, or delete them entirely.
            </p>
            <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                Every Edit or Delete operation instantly updates your running ledger. The starting balance is fully adjustable and can be changed at any time, instantly recalculating all subsequent values correctly without manual auditing.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-5 shadow-lg shadow-zinc-200/20">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Modifying Entries UI</div>
              
              <div className="border border-indigo-100 bg-indigo-50/[0.03] rounded-xl p-4 flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-bold text-zinc-800">Figma Contractor Invoice</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Editing</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">GPay · just now</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono',monospace] text-[12.5px] font-bold text-rose-600">− ₹18,000.00</span>
                  <div className="flex gap-1">
                    <div className="p-1 text-zinc-400 bg-white border border-zinc-200 rounded cursor-not-allowed">
                      <Edit2 className="w-3 h-3" />
                    </div>
                    <div className="p-1 text-zinc-400 bg-white border border-zinc-200 rounded cursor-not-allowed">
                      <Trash2 className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button className="px-3.5 py-1.5 rounded-full border border-zinc-200 bg-white text-[11px] font-bold text-zinc-650 hover:bg-zinc-50 cursor-not-allowed">Cancel</button>
                <button className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 cursor-not-allowed">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLAYGROUND (SANDBOX DEMO) ============ */}
      <section id="playground" className="relative px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Try it live</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">Interactive Ledger Sandbox</h2>
          <p className="text-zinc-500 max-w-lg mx-auto text-sm font-medium">
            Test our core features below: log transactions, test editing, or delete records to see the wallet balance automatically recalculate.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-xl shadow-zinc-200/40 relative">
          <div className="grid md:grid-cols-5 gap-8">

            {/* Input form */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Transaction Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={pgAmount}
                  onChange={(e) => setPgAmount(e.target.value)}
                  className={`w-full bg-zinc-50 border ${errorInput ? 'border-rose-500' : 'border-zinc-200'} rounded-lg px-3.5 py-2.5 font-['JetBrains_Mono',monospace] text-sm text-zinc-800 outline-none focus:border-indigo-500 transition-colors`}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Client retainer, AWS, Rent"
                  value={pgCategory}
                  onChange={(e) => setPgCategory(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPgType('credit')}
                    className={`transition-transform duration-150 active:scale-[0.98] py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1.5 ${
                      pgType === 'credit'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-zinc-200 text-zinc-500 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Credit
                  </button>
                  <button
                    onClick={() => setPgType('debit')}
                    className={`transition-transform duration-150 active:scale-[0.98] py-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1.5 ${
                      pgType === 'debit'
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : 'border-zinc-200 text-zinc-550 hover:border-rose-300 hover:bg-rose-50/30'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" /> Debit
                  </button>
                </div>
              </div>

              <button
                onClick={handlePlaygroundSubmit}
                className="transition-transform duration-150 active:scale-[0.98] mt-2 w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/10"
              >
                Record Transaction
              </button>
            </div>

            {/* Live log */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sandbox Log Summary</span>
                <span className="font-['JetBrains_Mono',monospace] text-[11px] text-zinc-450">
                  Wallet Balance: <span className="text-zinc-800 font-bold">{fmtINR(pgBalance)}</span>
                </span>
              </div>
              
              <div className="bg-zinc-50/50 border border-zinc-200 rounded-xl divide-y divide-zinc-200/50 h-72 overflow-y-auto font-medium">
                {pgLog.length === 0 ? (
                  <div className="px-4 py-8 text-center text-zinc-450 text-[13px]">
                    No transactions yet — record one to see it appear here.
                  </div>
                ) : (
                  pgLog.map((tx, idx) => {
                    const isCredit = tx.type === 'credit'
                    return (
                      <div
                        key={idx}
                        className="px-4 py-3 flex items-center justify-between transition-all duration-200 hover:bg-zinc-100/60 hover:translate-x-0.5 animate-in fade-in duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isCredit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-[12.5px] text-zinc-800 font-semibold">{tx.cat}</p>
                            <p className="text-[11px] text-zinc-400">{tx.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`font-['JetBrains_Mono',monospace] text-[12.5px] font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCredit ? '+' : '−'} {fmtINR(tx.amt)}
                          </span>
                          
                          {/* Edit / Delete actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePlaygroundEdit(idx)}
                              title="Edit transaction"
                              className="p-1 rounded bg-white border border-zinc-250 text-zinc-450 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePlaygroundDelete(idx)}
                              title="Delete transaction"
                              className="p-1 rounded bg-white border border-zinc-250 text-zinc-450 hover:text-rose-600 hover:border-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Toast */}
          <div
            className={`transition-all duration-[300ms] fixed bottom-6 right-6 bg-white border border-zinc-250 rounded-lg px-4 py-3 flex items-center gap-2 text-[12px] font-semibold text-zinc-700 shadow-xl shadow-zinc-200/50 z-50 ${
              showToast ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0 pointer-events-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative px-6 py-28 bg-[#fcfcfd] border-t border-zinc-200/50 overflow-hidden font-medium">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(99,102,241,0.02),transparent_70%)]"></div>
        <div className="relative max-w-7xl mx-auto">
          
          <div className="text-center mb-20">
            <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Flow Guide</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              Four Steps to Financial Clarity
            </h2>
            <p className="text-zinc-550 max-w-lg mx-auto text-sm md:text-base font-medium mt-3">
              WalletInsights is designed to be fast, clear, and highly structured. Here is how your daily bookkeeping flows.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 font-extrabold text-[15px] shadow-sm">
                    01
                  </span>
                  <Lock className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h4 className="font-extrabold text-[16px] text-zinc-900 mb-2">Set Opening Balance</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Initialize your ledger starting balance on sign-up, or update your wallet balance from settings at any time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-center">
                <span className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-150 text-[10px] font-bold text-zinc-500 font-['JetBrains_Mono',monospace]">
                  Starting: ₹50,000.00
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 font-extrabold text-[15px] shadow-sm">
                    02
                  </span>
                  <Layers className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h4 className="font-extrabold text-[16px] text-zinc-900 mb-2">Log Daily Cash Flow</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Record credits or debits in seconds. Tag categories and pick payment channels (PhonePe, Cash, Cards) to keep logs clean.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-center gap-1.5">
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-[9px] font-bold text-emerald-700">+ Credit</span>
                <span className="px-2.5 py-1 rounded bg-rose-50 text-[9px] font-bold text-rose-700">- Debit</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 font-extrabold text-[15px] shadow-sm">
                    03
                  </span>
                  <UserCheck className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h4 className="font-extrabold text-[16px] text-zinc-900 mb-2">Track Peer Debts</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Log borrowed and lent transactions. Instantly clear balances as peers settle up, auto-syncing the values.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-center">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[9px] font-bold text-indigo-700">
                  Sarah Settle: Active
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 font-extrabold text-[15px] shadow-sm">
                    04
                  </span>
                  <TrendingUp className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h4 className="font-extrabold text-[16px] text-zinc-900 mb-2">Audit & Export</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Examine category progress charts, download XLS spreadsheets, or email PDF logs to your team.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-center gap-3 text-zinc-400 group-hover:text-indigo-500 transition-colors">
                <FileText className="w-4 h-4" />
                <Mail className="w-4 h-4" />
              </div>
            </div>

          </div>
          
        </div>
      </section>


      {/* ============ Q&A & PUBLIC SUPPORT ============ */}
      <section id="support-section" className="relative px-6 py-28 bg-[#fafafa] border-t border-zinc-200/60 font-medium">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Q&A Section (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2">Q&A Knowledge Base</p>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4 pt-4">
              {[
                {
                  q: "How do I initialize my wallet balance?",
                  a: "When you register for the first time, you will be redirected to the Workspace Profile page. Here, you must initialize your starting balance before using credit or debit sheets."
                },
                {
                  q: "Can I adjust my starting balance later?",
                  a: "Yes! Your balance is not locked in place. You can update your starting or current wallet balance at any time from the Settings tab in your profile workspace."
                },
                {
                  q: "Are transaction records private?",
                  a: "Yes, absolutely. All ledger entries, credits, and debits are stored in your secure database. There are no third-party webhooks; everything is processed locally."
                },
                {
                  q: "How do I generate and receive statements?",
                  a: "Navigate to the 'Statement' page, select your start and end dates, and click 'Email PDF Statement'. The system generates a clean A4 PDF of your ledger and emails it to you instantly."
                },
                {
                  q: "What email service is used for OTP and statements?",
                  a: "We use a direct SMTP helper connected to your configured Gmail App Passwords or mail host. This ensures that OTP codes and PDFs are sent securely and instantly."
                }
              ].map((item, idx) => {
                const isOpen = activeQaIdx === idx;
                return (
                  <div key={idx} className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden transition-all duration-200">
                    <button
                      onClick={() => setActiveQaIdx(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-zinc-800 text-[13px] md:text-sm hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <span className="text-[15px] font-semibold text-zinc-400 select-none">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-zinc-555 leading-relaxed border-t border-zinc-100 animate-in fade-in duration-150">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Public Support Form (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[16px] font-extrabold text-zinc-900 tracking-tight mb-2">Contact Support</h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-medium">
              Need assistance? Send a request and our support desk will respond directly to your email.
            </p>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Zulfekar Khan"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="zulfekar@gmail.com"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Statement query, initialization error"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue or query in detail..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={supportStatus === 'sending'}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                {supportStatus === 'sending' ? 'Sending Request...' : 'Submit Support Ticket'}
              </button>

              {supportStatus === 'sent' && (
                <p className="text-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 py-2 rounded-lg animate-in fade-in">
                  Support ticket submitted successfully!
                </p>
              )}
              {supportStatus === 'error' && (
                <p className="text-center text-[11px] font-semibold text-rose-600 bg-rose-50 py-2 rounded-lg animate-in fade-in">
                  Failed to send request. Please try again.
                </p>
              )}
            </form>
          </div>

        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-zinc-200/80 bg-white px-6 pt-16 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="font-bold text-sm text-zinc-900">WalletInsights</span>
            </div>
            <p className="text-zinc-500 text-[13px] leading-relaxed max-w-xs font-medium">
              A developer-first ledger for small teams and freelancers who want simple cash book tracking without the noise.
            </p>
          </div>
          
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-bold">Product</p>
            <ul className="space-y-2 text-[13px] font-semibold text-zinc-500">
              <li><a href="#features" className="hover:text-zinc-950 transition-colors">Features</a></li>
              <li><a href="#playground" className="hover:text-zinc-950 transition-colors">Sandbox Demo</a></li>
              <li><Link to="/login" className="hover:text-zinc-950 transition-colors">Launch Workspace</Link></li>
            </ul>
          </div>
          
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-bold">Workspace Pages</p>
            <ul className="space-y-2 text-[13px] font-semibold text-zinc-500">
              <li><Link to="/login" className="hover:text-zinc-950 transition-colors">Login / Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-zinc-950 transition-colors">Overview Ledger</Link></li>
              <li><Link to="/profile" className="hover:text-zinc-950 transition-colors">Workspace Settings</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-bold">Ledger Sheets</p>
            <ul className="space-y-2 text-[13px] font-semibold text-zinc-500">
              <li><Link to="/credits" className="hover:text-zinc-950 transition-colors">Record Income</Link></li>
              <li><Link to="/debits" className="hover:text-zinc-950 transition-colors">Record Expenses</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-zinc-150 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-zinc-450 text-[11px] font-medium">© 2026 WalletInsights Workspace. All rights reserved.</p>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>
            Secure API Proxy Active
          </p>
        </div>
      </footer>

    </div>
  )
}
