import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Tablesprint Secrets & Constants
const API_BASE_URL = process.env.TABLESPRINT_API_BASE_URL
const WORKSHEET_ID = process.env.TABLESPRINT_WORKSHEET_ID
const AUTH_TOKEN = process.env.TABLESPRINT_AUTH_TOKEN

const USER_VIEW_ID = process.env.TABLESPRINT_USER_VIEW_ID
const CREDIT_VIEW_ID = process.env.TABLESPRINT_CREDIT_VIEW_ID
const DEBIT_VIEW_ID = process.env.TABLESPRINT_DEBIT_VIEW_ID
const UNIFIED_VIEW_ID = process.env.TABLESPRINT_UNIFIED_VIEW_ID

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': AUTH_TOKEN,
}

const STATEMENT_EMAIL_DAILY_LIMIT = 5
const STATEMENT_EMAIL_COOLDOWN_MS = 5 * 60 * 1000
const statementEmailRateLimitStore = new Map()

const getStatementDayKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeEmail = (email = '') => email.trim().toLowerCase()

const formatDuration = (ms) => {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }

  if (seconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${seconds}s`
}

const buildStatementRateLimitSnapshot = (email, now = Date.now()) => {
  const emailKey = normalizeEmail(email)
  const dayKey = getStatementDayKey(new Date(now))
  const stored = statementEmailRateLimitStore.get(emailKey)
  const baseState = !stored || stored.dayKey !== dayKey
    ? { dayKey, count: 0, lastSentAt: null }
    : stored

  if (!stored || stored.dayKey !== dayKey) {
    statementEmailRateLimitStore.set(emailKey, baseState)
  }

  const cooldownRemainingMs = baseState.lastSentAt
    ? Math.max(0, STATEMENT_EMAIL_COOLDOWN_MS - (now - baseState.lastSentAt))
    : 0
  const nextAllowedAt = baseState.lastSentAt ? baseState.lastSentAt + STATEMENT_EMAIL_COOLDOWN_MS : null
  const remainingToday = Math.max(0, STATEMENT_EMAIL_DAILY_LIMIT - baseState.count)

  let blockedReason = null
  let blockedMessage = null

  if (cooldownRemainingMs > 0) {
    blockedReason = 'cooldown'
    blockedMessage = `Please wait ${formatDuration(cooldownRemainingMs)} before sending another PDF statement.`
  } else if (baseState.count >= STATEMENT_EMAIL_DAILY_LIMIT) {
    blockedReason = 'daily'
    blockedMessage = `You can email PDF statements a maximum of ${STATEMENT_EMAIL_DAILY_LIMIT} times per day. Please try again tomorrow.`
  }

  return {
    emailKey,
    state: baseState,
    remainingToday,
    cooldownRemainingMs,
    nextAllowedAt,
    blockedReason,
    blockedMessage,
    response: {
      dayKey: baseState.dayKey,
      count: baseState.count,
      lastSentAt: baseState.lastSentAt,
      remainingToday,
      nextAllowedAt,
      cooldownMs: STATEMENT_EMAIL_COOLDOWN_MS,
      dailyLimit: STATEMENT_EMAIL_DAILY_LIMIT,
      blockedReason,
    },
  }
}

const recordStatementEmailSend = (email, now = Date.now()) => {
  const snapshot = buildStatementRateLimitSnapshot(email, now)
  const nextState = {
    dayKey: snapshot.state.dayKey,
    count: snapshot.state.count + 1,
    lastSentAt: now,
  }

  statementEmailRateLimitStore.set(snapshot.emailKey, nextState)

  return buildStatementRateLimitSnapshot(email, now)
}

// -------------------------------------------------------------
// 1. Check Email API
// -------------------------------------------------------------
app.post('/api/auth/check', async (req, res) => {
  const { email } = req.body
  
  console.log('--- DIAGNOSTIC ENVIRONMENT LOG ---')
  console.log('API_BASE_URL:', API_BASE_URL)
  console.log('WORKSHEET_ID:', WORKSHEET_ID)
  console.log('USER_VIEW_ID:', USER_VIEW_ID)
  console.log('AUTH_TOKEN Length:', AUTH_TOKEN ? AUTH_TOKEN.length : 0)
  console.log('AUTH_TOKEN Starts With Bearer:', AUTH_TOKEN ? AUTH_TOKEN.startsWith('Bearer ') : false)
  if (AUTH_TOKEN) {
    console.log('AUTH_TOKEN snippet:', AUTH_TOKEN.substring(0, 15) + '...' + AUTH_TOKEN.substring(AUTH_TOKEN.length - 10))
  }
  console.log('---------------------------------')

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' })
  }

  const payload = {
    filter: [
      {
        condition: 'where',
        columnId: 'Email',
        operator: '=',
        operand1: { type: 'value', value: email },
      },
    ],
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      payload,
      { headers }
    )
    const usersList = response.data?.results?.data || []
    if (usersList.length > 0) {
      const existingUser = usersList[0]
      // Touch the user row to trigger the Tablesprint Workagent workflow for login
      await axios.put(
        `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
        {
          data: [
            {
              _id: existingUser._id,
              LastLoginRequest: new Date().toISOString(),
            },
          ],
        },
        { headers }
      )
      res.json({ success: true, exists: true, user: existingUser })
    } else {
      res.json({ success: true, exists: false })
    }
  } catch (err) {
    console.error('Check Email Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to check email.',
    })
  }
})

// -------------------------------------------------------------
// 2. Register User (Insert User Row)
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const { name, phone, occupation, city, email } = req.body

  const payload = {
    data: [
      {
        Email: email,
        Name: name,
        Phone: phone,
        Occupation: occupation,
        City: city,
      },
    ],
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      payload,
      { headers }
    )
    if (response.data?.success && response.data?.results?.length > 0) {
      // User created. The Tablesprint workflow agent will automatically detect row insertion and send email OTP.
      res.json({ success: true, user: response.data.results[0] })
    } else {
      throw new Error('Registration failed to create user row.')
    }
  } catch (err) {
    console.error('Register Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Registration failed.',
    })
  }
})

// -------------------------------------------------------------
// 3. Fetch OTP and Verify Match
// -------------------------------------------------------------
app.post('/api/auth/verify', async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' })
  }

  const payload = {
    filter: [
      {
        condition: 'where',
        columnId: 'Email',
        operator: '=',
        operand1: { type: 'value', value: email },
      },
    ],
  }

  try {
    // Fetch the latest user record to read the OTP generated/written by the Tablesprint Workagent
    const response = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      payload,
      { headers }
    )
    const usersList = response.data?.results?.data || []
    if (usersList.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const latestUser = usersList[0]
    
    // Compare entered OTP with the OTP fetched from the worksheet row
    if (latestUser.OTP && latestUser.OTP.toString() === otp.trim()) {
      res.json({ success: true, user: latestUser })
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check your email and try again.',
      })
    }
  } catch (err) {
    console.error('Verify Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Verification failed.',
    })
  }
})

// -------------------------------------------------------------
// 4. Update Balance
// -------------------------------------------------------------
app.post('/api/auth/balance', async (req, res) => {
  const { userRowId, balance } = req.body

  try {
    const response = await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Balance: balance,
          },
        ],
      },
      { headers }
    )
    res.json({ success: true, user: response.data?.results?.[0] })
  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.message,
    })
  }
})

// -------------------------------------------------------------
// 5. Update Profile
// -------------------------------------------------------------
app.post('/api/auth/profile', async (req, res) => {
  const { userRowId, Name, Phone, Occupation, City, Address, Zipcode, State, Country } = req.body

  try {
    const response = await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Name,
            Phone,
            Occupation,
            City,
            Address,
            Zipcode,
            State,
            Country,
          },
        ],
      },
      { headers }
    )
    res.json({ success: true, user: response.data?.results?.[0] })
  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.message,
    })
  }
})

// -------------------------------------------------------------
// 6. Fetch Credits
// -------------------------------------------------------------
app.post('/api/ledger/credits', async (req, res) => {
  const { email } = req.body

  try {
    const response = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${CREDIT_VIEW_ID}`,
      {
        filter: [
          {
            condition: 'where',
            columnId: 'Email',
            operator: '=',
            operand1: { type: 'value', value: email },
          },
        ],
      },
      { headers }
    )
    res.json({
      success: true,
      results: {
        data: response.data?.results?.data || []
      }
    })
  } catch (err) {
    res.status(err.response?.status || 550).json({
      success: false,
      message: err.response?.data?.message || err.message
    })
  }
})

// -------------------------------------------------------------
// 7. Fetch Debits
// -------------------------------------------------------------
app.post('/api/ledger/debits', async (req, res) => {
  const { email } = req.body

  try {
    const response = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${DEBIT_VIEW_ID}`,
      {
        filter: [
          {
            condition: 'where',
            columnId: 'Email',
            operator: '=',
            operand1: { type: 'value', value: email },
          },
        ],
      },
      { headers }
    )
    res.json({
      success: true,
      results: {
        data: response.data?.results?.data || []
      }
    })
  } catch (err) {
    res.status(err.response?.status || 550).json({
      success: false,
      message: err.response?.data?.message || err.message
    })
  }
})

// -------------------------------------------------------------
// 8. Fetch Unified
// -------------------------------------------------------------
app.post('/api/ledger/unified', async (req, res) => {
  const { email } = req.body

  try {
    const response = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
      {
        filter: [
          {
            condition: 'where',
            columnId: 'Email',
            operator: '=',
            operand1: { type: 'value', value: email },
          },
        ],
      },
      { headers }
    )
    res.json({
      success: true,
      results: {
        data: response.data?.results?.data || []
      }
    })
  } catch (err) {
    res.status(err.response?.status || 550).json({
      success: false,
      message: err.response?.data?.message || err.message
    })
  }
})

// -------------------------------------------------------------
// 9. Add Credit
// -------------------------------------------------------------
app.post('/api/ledger/credit', async (req, res) => {
  const { email, userRowId, currentBalance, amount, purpose, creditedFrom, sourceOfPayment, note, date } = req.body
  const newBalance = currentBalance + amount

  try {
    // A. Write to Credit worksheet
    await axios.post(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${CREDIT_VIEW_ID}`,
      {
        data: [
          {
            Amount: amount,
            Purpose: purpose,
            'Credited From': creditedFrom,
            Date: date,
            'Source Of Payment': sourceOfPayment,
            Note: note,
            Email: email,
          },
        ],
      },
      { headers }
    )

    // B. Write to Unified Expense Tracker worksheet
    await axios.post(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
      {
        data: [
          {
            Date: date,
            'Source of Payment': sourceOfPayment,
            Purpose: purpose,
            Debit: 0,
            Credit: amount,
            Balance: newBalance,
            Email: email,
          },
        ],
      },
      { headers }
    )

    // C. Update user row balance in DB
    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Balance: newBalance,
          },
        ],
      },
      { headers }
    )

    res.json({ success: true, balance: newBalance })
  } catch (err) {
    console.error('Log Credit Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to record credit transaction.',
    })
  }
})

// -------------------------------------------------------------
// 10. Add Debit
// -------------------------------------------------------------
app.post('/api/ledger/debit', async (req, res) => {
  const { email, userRowId, currentBalance, amount, paymentMethod, paidTo, note, date } = req.body
  const newBalance = currentBalance - amount

  try {
    // A. Write to Debit worksheet
    await axios.post(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${DEBIT_VIEW_ID}`,
      {
        data: [
          {
            Amount: amount,
            'Payment Method': paymentMethod,
            'Paid to': paidTo,
            Date: date,
            Note: note,
            Email: email,
          },
        ],
      },
      { headers }
    )

    // B. Write to Unified Expense Tracker worksheet
    await axios.post(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
      {
        data: [
          {
            Date: date,
            'Source of Payment': paymentMethod,
            Purpose: paidTo,
            Debit: amount,
            Credit: 0,
            Balance: newBalance,
            Email: email,
          },
        ],
      },
      { headers }
    )

    // C. Update user row balance in DB
    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Balance: newBalance,
          },
        ],
      },
      { headers }
    )

    res.json({ success: true, balance: newBalance })
  } catch (err) {
    console.error('Log Debit Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to record debit transaction.',
    })
  }
})

// -------------------------------------------------------------
// 11. Delete Credit
// -------------------------------------------------------------
app.post('/api/ledger/credit/delete', async (req, res) => {
  const { email, userRowId, creditRowId, amount, purpose, date } = req.body

  try {
    // A. Delete from Credit worksheet
    await axios.delete(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${CREDIT_VIEW_ID}`,
      {
        headers,
        data: { _ids: [creditRowId] }
      }
    )

    // B. Search and delete from Unified worksheet
    const searchRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } },
          { condition: 'and', columnId: 'Date', operator: '=', operand1: { type: 'value', value: date } },
          { condition: 'and', columnId: 'Credit', operator: '=', operand1: { type: 'value', value: amount } },
          { condition: 'and', columnId: 'Purpose', operator: '=', operand1: { type: 'value', value: purpose } }
        ]
      },
      { headers }
    )
    
    const unifiedRows = searchRes.data?.results?.data || []
    if (unifiedRows.length > 0) {
      const unifiedRowId = unifiedRows[0]._id
      await axios.delete(
        `${API_BASE_URL}/row/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
        {
          headers,
          data: { _ids: [unifiedRowId] }
        }
      )
    }

    // C. Recompute & update user balance
    const userRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } }
        ]
      },
      { headers }
    )
    const userRow = userRes.data?.results?.data?.[0]
    const currentBalance = userRow ? Number(userRow.Balance || 0) : 0
    const newBalance = currentBalance - amount

    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Balance: newBalance
          }
        ]
      },
      { headers }
    )

    res.json({ success: true, balance: newBalance })
  } catch (err) {
    console.error('Delete Credit Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to delete credit record.'
    })
  }
})

// -------------------------------------------------------------
// 12. Delete Debit
// -------------------------------------------------------------
app.post('/api/ledger/debit/delete', async (req, res) => {
  const { email, userRowId, debitRowId, amount, purpose, date } = req.body

  try {
    // A. Delete from Debit worksheet
    await axios.delete(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${DEBIT_VIEW_ID}`,
      {
        headers,
        data: { _ids: [debitRowId] }
      }
    )

    // B. Search and delete from Unified worksheet
    const searchRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } },
          { condition: 'and', columnId: 'Date', operator: '=', operand1: { type: 'value', value: date } },
          { condition: 'and', columnId: 'Debit', operator: '=', operand1: { type: 'value', value: amount } },
          { condition: 'and', columnId: 'Purpose', operator: '=', operand1: { type: 'value', value: purpose } }
        ]
      },
      { headers }
    )
    
    const unifiedRows = searchRes.data?.results?.data || []
    if (unifiedRows.length > 0) {
      const unifiedRowId = unifiedRows[0]._id
      await axios.delete(
        `${API_BASE_URL}/row/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
        {
          headers,
          data: { _ids: [unifiedRowId] }
        }
      )
    }

    // C. Recompute & update user balance
    const userRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } }
        ]
      },
      { headers }
    )
    const userRow = userRes.data?.results?.data?.[0]
    const currentBalance = userRow ? Number(userRow.Balance || 0) : 0
    const newBalance = currentBalance + amount

    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Balance: newBalance
          }
        ]
      },
      { headers }
    )

    res.json({ success: true, balance: newBalance })
  } catch (err) {
    console.error('Delete Debit Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to delete debit record.'
    })
  }
})

// -------------------------------------------------------------
// 13. Update Credit
// -------------------------------------------------------------
app.post('/api/ledger/credit/update', async (req, res) => {
  const {
    email,
    userRowId,
    creditRowId,
    oldAmount,
    newAmount,
    oldPurpose,
    newPurpose,
    oldDate,
    newDate,
    creditedFrom,
    sourceOfPayment,
    note
  } = req.body

  try {
    // A. Update in Credit worksheet
    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${CREDIT_VIEW_ID}`,
      {
        data: [
          {
            _id: creditRowId,
            Amount: newAmount,
            Purpose: newPurpose,
            'Credited From': creditedFrom,
            Date: newDate,
            'Source Of Payment': sourceOfPayment,
            Note: note
          }
        ]
      },
      { headers }
    )

    // B. Search and update in Unified worksheet
    const searchRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } },
          { condition: 'and', columnId: 'Date', operator: '=', operand1: { type: 'value', value: oldDate } },
          { condition: 'and', columnId: 'Credit', operator: '=', operand1: { type: 'value', value: oldAmount } },
          { condition: 'and', columnId: 'Purpose', operator: '=', operand1: { type: 'value', value: oldPurpose } }
        ]
      },
      { headers }
    )
    
    const unifiedRows = searchRes.data?.results?.data || []
    if (unifiedRows.length > 0) {
      const unifiedRowId = unifiedRows[0]._id
      
      // Calculate new unified balance
      const currentUnifiedBalance = Number(unifiedRows[0].Balance || 0)
      const newUnifiedBalance = currentUnifiedBalance + (newAmount - oldAmount)

      await axios.put(
        `${API_BASE_URL}/row/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
        {
          data: [
            {
              _id: unifiedRowId,
              Date: newDate,
              'Source of Payment': sourceOfPayment,
              Purpose: newPurpose,
              Credit: newAmount,
              Balance: newUnifiedBalance
            }
          ]
        },
        { headers }
      )
    }

    // C. Recompute & update user balance
    const userRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } }
        ]
      },
      { headers }
    )
    const userRow = userRes.data?.results?.data?.[0]
    const currentBalance = userRow ? Number(userRow.Balance || 0) : 0
    const newBalance = currentBalance + (newAmount - oldAmount)

    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Balance: newBalance
          }
        ]
      },
      { headers }
    )

    res.json({ success: true, balance: newBalance })
  } catch (err) {
    console.error('Update Credit Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to update credit record.'
    })
  }
})

// -------------------------------------------------------------
// 14. Update Debit
// -------------------------------------------------------------
app.post('/api/ledger/debit/update', async (req, res) => {
  const {
    email,
    userRowId,
    debitRowId,
    oldAmount,
    newAmount,
    oldPurpose,
    newPurpose,
    oldDate,
    newDate,
    paidTo,
    paymentMethod,
    note
  } = req.body

  try {
    // A. Update in Debit worksheet
    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${DEBIT_VIEW_ID}`,
      {
        data: [
          {
            _id: debitRowId,
            Amount: newAmount,
            'Paid to': paidTo,
            Date: newDate,
            'Payment Method': paymentMethod,
            Note: note
          }
        ]
      },
      { headers }
    )

    // B. Search and update in Unified worksheet
    const searchRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } },
          { condition: 'and', columnId: 'Date', operator: '=', operand1: { type: 'value', value: oldDate } },
          { condition: 'and', columnId: 'Debit', operator: '=', operand1: { type: 'value', value: oldAmount } },
          { condition: 'and', columnId: 'Purpose', operator: '=', operand1: { type: 'value', value: oldPurpose } }
        ]
      },
      { headers }
    )
    
    const unifiedRows = searchRes.data?.results?.data || []
    if (unifiedRows.length > 0) {
      const unifiedRowId = unifiedRows[0]._id
      
      // Calculate new unified balance
      const currentUnifiedBalance = Number(unifiedRows[0].Balance || 0)
      const newUnifiedBalance = currentUnifiedBalance - (newAmount - oldAmount)

      await axios.put(
        `${API_BASE_URL}/row/${WORKSHEET_ID}/${UNIFIED_VIEW_ID}`,
        {
          data: [
            {
              _id: unifiedRowId,
              Date: newDate,
              'Source of Payment': paymentMethod,
              Purpose: paidTo,
              Debit: newAmount,
              Balance: newUnifiedBalance
            }
          ]
        },
        { headers }
      )
    }

    // C. Recompute & update user balance
    const userRes = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        filter: [
          { condition: 'where', columnId: 'Email', operator: '=', operand1: { type: 'value', value: email } }
        ]
      },
      { headers }
    )
    const userRow = userRes.data?.results?.data?.[0]
    const currentBalance = userRow ? Number(userRow.Balance || 0) : 0
    const newBalance = currentBalance - (newAmount - oldAmount)

    await axios.put(
      `${API_BASE_URL}/row/${WORKSHEET_ID}/${USER_VIEW_ID}`,
      {
        data: [
          {
            _id: userRowId,
            Balance: newBalance
          }
        ]
      },
      { headers }
    )

    res.json({ success: true, balance: newBalance })
  } catch (err) {
    console.error('Update Debit Proxy Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to update debit record.'
    })
  }
})

// -------------------------------------------------------------
// 15. Send Statement Email Webhook Proxy
// -------------------------------------------------------------
app.post('/api/statement/email', async (req, res) => {
  const { email, html, startDate, endDate } = req.body
  const webhookUrl = process.env.TABLESPRINT_STATEMENT_WEBHOOK_URL

  if (!email || !html) {
    return res.status(400).json({ success: false, message: 'Email and HTML content are required' })
  }

  if (!webhookUrl) {
    console.error('TABLESPRINT_STATEMENT_WEBHOOK_URL is not configured in .env')
    return res.status(500).json({ success: false, message: 'Statement email webhook is not configured on the server.' })
  }

  const rateLimitSnapshot = buildStatementRateLimitSnapshot(email)
  if (rateLimitSnapshot.blockedReason) {
    return res.status(429).json({
      success: false,
      message: rateLimitSnapshot.blockedMessage,
      rateLimit: rateLimitSnapshot.response,
    })
  }

  try {
    console.log(`Forwarding HTML statement to Tablesprint webhook: ${webhookUrl} for user: ${email}`)
    const response = await axios.post(
      webhookUrl,
      {
        email,
        html,
        startDate,
        endDate
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    const updatedRateLimit = recordStatementEmailSend(email)

    res.json({
      success: true,
      message: 'Statement email request sent successfully.',
      details: response.data,
      rateLimit: updatedRateLimit.response,
    })
  } catch (err) {
    console.error('Statement Webhook Error:', err.message)
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to dispatch email statement.',
      rateLimit: rateLimitSnapshot.response,
    })
  }
})

// -------------------------------------------------------------
// Mock Webhook endpoint for local testing
// -------------------------------------------------------------
app.post('/api/mock-webhook', (req, res) => {
  const { email, html, startDate, endDate } = req.body
  console.log('--- MOCK WEBHOOK RECEIVED REQUEST ---')
  console.log('Target Email:', email)
  console.log('Date Range:', startDate, 'to', endDate)
  console.log('HTML length:', html ? html.length : 0)
  console.log('--------------------------------------')
  
  res.json({
    success: true,
    message: '[MOCK SUCCESS] Webhook received HTML and details successfully. Tablesprint would now render PDF and email it.'
  })
})


if (!process.env.VERCEL) {
  // Serve static assets from Vite build in production
  app.use(express.static(path.join(__dirname, '../dist')))


  // Wildcard routing to route all other requests to React index.html
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })

  app.listen(PORT, () => {
    console.log(`Secure API Proxy Server running locally on http://localhost:${PORT}`)
  })
}

export default app
