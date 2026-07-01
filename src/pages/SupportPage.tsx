import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { HelpCircle, Mail, AlertTriangle, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react'

interface SupportTicketForm {
  subject: string
  category: string
  priority: string
  message: string
}

export function SupportPage() {
  useEffect(() => {
    document.title = 'Contact Workspace Support | WalletInsights'
  }, [])

  const [ticketStatus, setTicketStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupportTicketForm>({
    defaultValues: {
      subject: '',
      category: 'Bug Report',
      priority: 'Medium',
      message: '',
    }
  })

  const onSubmit = async (data: SupportTicketForm) => {
    setTicketStatus('sending')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/support/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setTicketStatus('sent')
        reset()
        setTimeout(() => setTicketStatus('idle'), 4000)
      } else {
        setTicketStatus('error')
        setTimeout(() => setTicketStatus('idle'), 4000)
      }
    } catch (err) {
      setTicketStatus('error')
      setTimeout(() => setTicketStatus('idle'), 4000)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 text-zinc-100 antialiased">
      
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl shadow-black/40">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-zinc-800/80 pb-5">
          <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-indigo-400 shadow-inner">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Workspace Support Desk</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Submit an internal help ticket directly to our engineering team.</p>
          </div>
        </div>

        {/* Content & Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Instructions Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Ticket Guidelines
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Our support team typically reviews workspace tickets within 4-12 business hours. 
              </p>
              <ul className="text-[11px] text-zinc-500 space-y-2 list-disc list-inside font-medium">
                <li>Include screenshots or error messages if reporting a bug.</li>
                <li>Set priority 'High' only for critical blockers (e.g., mail delivery failure).</li>
                <li>Verify your account email is active for replies.</li>
              </ul>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-5 flex items-start gap-3">
              <Mail className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-300">Direct Support Email</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 font-semibold">sksabbirali99@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
              
              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Category</label>
                  <select
                    {...register('category')}
                    className="w-full h-12 md:h-11 px-3.5 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-200 text-base md:text-sm font-medium cursor-pointer outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-150"
                  >
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Billing / Wallet issue">Billing / Wallet issue</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full h-12 md:h-11 px-3.5 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-200 text-base md:text-sm font-medium cursor-pointer outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-150"
                  >
                    <option value="Low">Low - Normal inquiry</option>
                    <option value="Medium">Medium - Workflow block</option>
                    <option value="High">High - Urgent issue</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ticket Subject</label>
                <div className="relative w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150 shadow-inner flex items-center">
                  <MessageSquare className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="e.g. Cannot initialize balance on new profile"
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full py-3 md:py-2.5 pl-10 pr-3.5 text-zinc-100 text-base md:text-sm bg-transparent outline-none border-none font-medium placeholder:text-zinc-600"
                  />
                </div>
                {errors.subject && <span className="text-[11px] text-rose-450">{errors.subject.message}</span>}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Detailed Message</label>
                <div className="w-full border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-150">
                  <textarea
                    rows={5}
                    placeholder="Describe what occurred, steps to reproduce, or your general request..."
                    {...register('message', { required: 'Message body is required' })}
                    className="w-full px-3.5 py-3 bg-transparent border-none outline-none text-base md:text-sm text-zinc-200 placeholder:text-zinc-700 resize-none font-medium"
                  />
                </div>
                {errors.message && <span className="text-[11px] text-rose-450">{errors.message.message}</span>}
              </div>

              {/* Status Banner */}
              {ticketStatus === 'sent' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold animate-in fade-in">
                  Support ticket submitted successfully! Check your inbox for replies.
                </div>
              )}
              {ticketStatus === 'error' && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold animate-in flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Failed to send ticket. Please check SMTP configuration or try again.
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={ticketStatus === 'sending'}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-sm font-semibold shadow-md shadow-white/5 transition-all duration-150 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ticketStatus === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  )
}
