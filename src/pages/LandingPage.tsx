import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Layers,
  RefreshCw,
  GitMerge,
  Smartphone,
  Banknote,
  Wallet,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react'
import './LandingPage.css'

export function LandingPage() {
  // Balance lock card state
  const [locked, setLocked] = useState(true)
  const [lockAmount, setLockAmount] = useState(50000)

  // Interactive playground state
  const [pgAmount, setPgAmount] = useState('')
  const [pgCategory, setPgCategory] = useState('')
  const [pgType, setPgType] = useState<'credit' | 'debit'>('credit')
  const [pgBalance, setPgBalance] = useState(0)
  const [pgLog, setPgLog] = useState<Array<{ cat: string; amt: number; type: 'credit' | 'debit'; time: string }>>([])
  const [showToast, setShowToast] = useState(false)
  const [errorInput, setErrorInput] = useState(false)

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
    setShowToast(true)
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2200)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const fmtINR = (n: number) => {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 })
  }

  // Hero section static ledger mock rows
  const heroRows = [
    { cat: 'Client payment · Acme Co.', node: 'PhonePe', amt: 18200, type: 'credit', time: '2m ago' },
    { cat: 'AWS · Infra hosting', node: 'Card', amt: -4500, type: 'debit', time: '41m ago' },
    { cat: 'Freelance retainer · Nova', node: 'GPay', amt: 22000, type: 'credit', time: '1h ago' },
    { cat: 'Notion · Team plan', node: 'Card', amt: -1499, type: 'debit', time: '3h ago' },
    { cat: 'Salary deposit', node: 'Salary', amt: 65000, type: 'credit', time: 'yesterday' },
  ]

  return (
    <div className="landing-body min-h-screen bg-[#fcfcfd] font-['Manrope',sans-serif] text-zinc-800 selection:bg-indigo-100 scroll-smooth antialiased">
      
      {/* ============ NAV ============ */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-zinc-900">
              Workspace<span className="text-zinc-400 font-medium">/expense</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-zinc-500 tracking-wide">
            <a href="#features" className="nav-link hover:text-zinc-900 transition-colors">Features</a>
            <a href="#playground" className="nav-link hover:text-zinc-900 transition-colors">Interactive Demo</a>
            <a href="#sync" className="nav-link hover:text-zinc-900 transition-colors">Database Sync</a>
          </nav>

          <Link
            to="/login"
            className="transition-transform duration-150 active:scale-[0.98] bg-zinc-950 text-white text-[13px] font-semibold px-4.5 py-2 rounded-full hover:bg-zinc-800 shadow-sm"
          >
            Launch App
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
            Real-Time Cloud Sync · Zero Config
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-950">
            Master Your SaaS<br />
            Cash Flow, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Line by Line.</span>
          </h1>

          <p className="mt-5 text-zinc-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            A developer-first expense tracker powered by real-time cloud database sync. Configurable starting balances, unified transaction ledgers, and zero manual setup required.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="transition-transform duration-150 active:scale-[0.98] px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold text-[14px] shadow-lg shadow-indigo-600/15 hover:bg-indigo-500"
            >
              Get Started Free
            </Link>
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
                <span className="font-['JetBrains_Mono',monospace] text-[11px] text-zinc-400 font-semibold">workspace / ledger.live</span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/40">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5">Total Balance</p>
                  <p className="text-2xl font-bold font-['JetBrains_Mono',monospace] text-zinc-900">₹1,84,250.00</p>
                  <p className="text-[10px] text-zinc-500 mt-1">as of today, 6:42 PM</p>
                </div>
                
                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/40">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Total Credits
                  </p>
                  <p className="text-2xl font-bold font-['JetBrains_Mono',monospace] text-emerald-600">₹2,40,000.00</p>
                  <p className="text-[10px] text-zinc-500 mt-1">12 inflows this month</p>
                </div>

                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/40">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" /> Total Debits
                  </p>
                  <p className="text-2xl font-bold font-['JetBrains_Mono',monospace] text-rose-600">₹55,750.00</p>
                  <p className="text-[10px] text-zinc-500 mt-1">28 outflows this month</p>
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
      <section id="features" className="relative px-6 py-24 max-w-7xl mx-auto">
        <div className="mb-14 max-w-xl">
          <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Architecture</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">Simple budget tracking, built for modern SaaS.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Card A: Balance Lock */}
          <div className="md:col-span-1 md:row-span-2 bg-white border border-zinc-200/80 rounded-2xl p-6 transition-all duration-[300ms] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-zinc-200/30 flex flex-col group">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-extrabold text-[17px] text-zinc-900 mb-2">Starting Balance Lock</h3>
            <p className="text-zinc-500 text-[13px] leading-relaxed mb-6 font-medium">Configure your opening balance once. It locks in place to guarantee all upcoming ledger logs compute accurate balances — preventing drift.</p>

            <div className="mt-auto bg-zinc-50 border border-zinc-150 rounded-xl p-4" id="lockCard">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" id="lockLabel">
                  {locked ? 'Locked' : 'Unlocked — set starting balance'}
                </span>
                <button
                  onClick={() => setLocked(!locked)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                >
                  {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{locked ? 'Unlock' : 'Lock'}</span>
                </button>
              </div>
              <p className="font-['JetBrains_Mono',monospace] text-xl font-bold text-zinc-900 mb-3" id="lockAmount">
                {fmtINR(lockAmount)}
              </p>
              <input
                type="range"
                min="0"
                max="200000"
                step="500"
                value={lockAmount}
                onChange={(e) => setLockAmount(Number(e.target.value))}
                className="w-full"
                disabled={locked}
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
                <h3 className="font-extrabold text-[17px] text-zinc-900 mb-1">Unified Transaction Ledger</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed max-w-md font-medium">Credits and debits flow automatically into one running balance — removing the need for separate books or manual updates.</p>
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
              <text x="29" y="38" textAnchor="middle" fill="#4f46e5" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">local</text>
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
            <h3 className="font-extrabold text-[17px] text-zinc-900 mb-2">Multi-Channel Payment Nodes</h3>
            <p className="text-zinc-500 text-[13px] leading-relaxed mb-5 font-medium">Tag transactions by how money actually moves, creating structured audits for easy tax filing and cash flow planning.</p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-600 flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-zinc-400" />PhonePe
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-600 flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-zinc-400" />GPay
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-600 flex items-center gap-1.5">
                <Banknote className="w-3 h-3 text-zinc-400" />Salary
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-600 flex items-center gap-1.5">
                <Wallet className="w-3 h-3 text-zinc-400" />Cash
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ============ PLAYGROUND ============ */}
      <section id="playground" className="relative px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-indigo-600 text-[12px] font-bold tracking-[0.2em] uppercase mb-2.5">Try it live</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3">Log a transaction. Watch it sync.</h2>
          <p className="text-zinc-500 max-w-lg mx-auto text-sm font-medium">Simulate your cash ledger right here: enter an amount, set the category, and watch the balance calculate.</p>
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
                        : 'border-zinc-200 text-zinc-500 hover:border-rose-300 hover:bg-rose-50/30'
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live Simulation Log</span>
                <span className="font-['JetBrains_Mono',monospace] text-[11px] text-zinc-450">
                  Balance: <span className="text-zinc-800 font-bold">{fmtINR(pgBalance)}</span>
                </span>
              </div>
              <div className="bg-zinc-50/50 border border-zinc-200 rounded-xl divide-y divide-zinc-200/50 h-72 overflow-y-auto">
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
                        className="px-4 py-3 flex items-center justify-between transition-all duration-200 hover:bg-zinc-50 hover:translate-x-0.5 animate-in fade-in duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isCredit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-[12.5px] text-zinc-800 font-semibold">{tx.cat}</p>
                            <p className="text-[11px] text-zinc-400 font-medium">{tx.time}</p>
                          </div>
                        </div>
                        <span className={`font-['JetBrains_Mono',monospace] text-[12.5px] font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isCredit ? '+' : '−'} {fmtINR(tx.amt)}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Toast */}
          <div
            className={`transition-all duration-[300ms] fixed bottom-6 right-6 bg-white border border-zinc-200 rounded-lg px-4 py-3 flex items-center gap-2 text-[12px] font-semibold text-zinc-700 shadow-xl shadow-zinc-200/50 z-50 ${
              showToast ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0 pointer-events-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Record synced with database.
          </div>
        </div>
      </section>

      {/* ============ CTA + FOOTER ============ */}
      <section className="relative px-6 py-28 bg-zinc-50 border-t border-zinc-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(99,102,241,0.03),transparent_70%)]"></div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-3">Take control of your workspace cash flow</h2>
          <p className="text-zinc-555 mb-8 font-medium">Start organizing credits, debits, and running balances today.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Link
              to="/login"
              className="w-full transition-transform duration-150 active:scale-[0.98] bg-zinc-950 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-zinc-800 whitespace-nowrap flex items-center justify-center"
            >
              Launch Your Workspace
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200/80 bg-white px-6 pt-16 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="font-bold text-sm text-zinc-900">Workspace<span className="text-zinc-400 font-medium">/expense</span></span>
            </div>
            <p className="text-zinc-500 text-[13px] leading-relaxed max-w-xs font-medium">A developer-first ledger for freelancers and teams who want simple cash book tracking without the noise.</p>
          </div>
          
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-bold">Product</p>
            <ul className="space-y-2 text-[13px] font-semibold text-zinc-500">
              <li><a href="#features" className="hover:text-zinc-950 transition-colors">Features</a></li>
              <li><a href="#playground" className="hover:text-zinc-950 transition-colors">Interactive Demo</a></li>
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
          <p className="text-zinc-400 text-[11px] font-medium">© 2026 Expense Tracker Workspace. All rights reserved.</p>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>
            Secure API Proxy Active
          </p>
        </div>
      </footer>

    </div>
  )
}
