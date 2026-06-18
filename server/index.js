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

// -------------------------------------------------------------
// 1. Check Email API
// -------------------------------------------------------------
app.post('/api/auth/check', async (req, res) => {
  const { email } = req.body
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

// Serve static assets from Vite build in production
app.use(express.static(path.join(__dirname, '../dist')))

// Wildcard routing to route all other requests to React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Secure API Proxy Server running locally on http://localhost:${PORT}`)
})
