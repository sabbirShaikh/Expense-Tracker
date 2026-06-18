import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { useAuth } from './useAuth'

export interface CreditRecord {
  _id?: string
  Amount: number
  Purpose: string
  'Credited From': string
  Date: string
  'Source of Payment': string
  Note: string
  Email: string
}

export interface DebitRecord {
  _id?: string
  Amount: number
  'Payment Method': string
  'Paid to': string
  Date: string
  Note: string
  Email: string
}

export interface UnifiedRecord {
  _id?: string
  Date: string
  'Source of Payment': string
  Purpose: string
  Debit: number
  Credit: number
  Balance: number
  Email: string
}

export interface LedgerContextType {
  credits: CreditRecord[]
  debits: DebitRecord[]
  unifiedRecords: UnifiedRecord[]
  loading: boolean
  error: string | null
  fetchCredits: () => Promise<void>
  fetchDebits: () => Promise<void>
  fetchUnifiedRecords: () => Promise<void>
  addCredit: (
    amount: number,
    purpose: string,
    creditedFrom: string,
    sourceOfPayment: string,
    note: string,
    date: string
  ) => Promise<number | null>
  addDebit: (
    amount: number,
    paymentMethod: string,
    paidTo: string,
    note: string,
    date: string
  ) => Promise<number | null>
  balance: number
  setBalance: (bal: number) => void
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined)

export function LedgerProvider({ children }: { children: ReactNode }) {
  const { user, email, refreshUser } = useAuth()
  const [balance, setBalance] = useState<number>(0)

  // Sync user profile balance
  useEffect(() => {
    if (user?.Balance !== undefined && user?.Balance !== null) {
      setBalance(user.Balance)
    }
  }, [user])

  // Fetch latest user data on mount/email changes to sync the starting balance on load
  useEffect(() => {
    if (email) {
      refreshUser()
    }
  }, [email, refreshUser])

  const [credits, setCredits] = useState<CreditRecord[]>([])
  const [debits, setDebits] = useState<DebitRecord[]>([])
  const [unifiedRecords, setUnifiedRecords] = useState<UnifiedRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userRowId = user?._id

  // 1. Fetch Credits
  const fetchCredits = useCallback(async () => {
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/ledger/credits', { email })
      const data = res.data?.results?.data || []
      data.sort((a: any, b: any) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      setCredits(data)
    } catch (err: any) {
      console.error('Fetch Credits Client Error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch credit records.')
    } finally {
      setLoading(false)
    }
  }, [email])

  // 2. Fetch Debits
  const fetchDebits = useCallback(async () => {
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/ledger/debits', { email })
      const data = res.data?.results?.data || []
      data.sort((a: any, b: any) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      setDebits(data)
    } catch (err: any) {
      console.error('Fetch Debits Client Error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch debit records.')
    } finally {
      setLoading(false)
    }
  }, [email])

  // 3. Fetch Unified Records
  const fetchUnifiedRecords = useCallback(async () => {
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/ledger/unified', { email })
      const data = res.data?.results?.data || []
      data.sort((a: any, b: any) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      setUnifiedRecords(data)
    } catch (err: any) {
      console.error('Fetch Unified Records Client Error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch unified records.')
    } finally {
      setLoading(false)
    }
  }, [email])

  // 4. Log Credit
  const addCredit = async (
    amount: number,
    purpose: string,
    creditedFrom: string,
    sourceOfPayment: string,
    note: string,
    date: string
  ): Promise<number | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/ledger/credit', {
        email,
        userRowId,
        currentBalance: balance,
        amount,
        purpose,
        creditedFrom,
        sourceOfPayment,
        note,
        date,
      })
      if (res.data?.success) {
        const newBalance = res.data.balance
        setBalance(newBalance)
        await refreshUser()
        await fetchCredits()
        await fetchUnifiedRecords()
        return newBalance
      }
      return null
    } catch (err: any) {
      console.error('Log Credit Client Error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to record credit transaction.')
      return null
    } finally {
      setLoading(false)
    }
  }

  // 5. Log Debit
  const addDebit = async (
    amount: number,
    paymentMethod: string,
    paidTo: string,
    note: string,
    date: string
  ): Promise<number | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/ledger/debit', {
        email,
        userRowId,
        currentBalance: balance,
        amount,
        paymentMethod,
        paidTo,
        note,
        date,
      })
      if (res.data?.success) {
        const newBalance = res.data.balance
        setBalance(newBalance)
        await refreshUser()
        await fetchDebits()
        await fetchUnifiedRecords()
        return newBalance
      }
      return null
    } catch (err: any) {
      console.error('Log Debit Client Error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to record debit transaction.')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Auto fetch when authenticated
  const isBalanceUnset = user?.Balance === null || user?.Balance === undefined
  useEffect(() => {
    if (user && !isBalanceUnset) {
      fetchUnifiedRecords()
      fetchCredits()
      fetchDebits()
    }
  }, [user, isBalanceUnset, fetchUnifiedRecords, fetchCredits, fetchDebits])

  return (
    <LedgerContext.Provider
      value={{
        credits,
        debits,
        unifiedRecords,
        loading,
        error,
        fetchCredits,
        fetchDebits,
        fetchUnifiedRecords,
        addCredit,
        addDebit,
        balance,
        setBalance,
      }}
    >
      {children}
    </LedgerContext.Provider>
  )
}

export function useLedger() {
  const context = useContext(LedgerContext)
  if (context === undefined) {
    throw new Error('useLedger must be used within a LedgerProvider')
  }
  return context
}
