import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authController from './controllers/authController.js';
import ledgerController from './controllers/ledgerController.js';
import statementController from './controllers/statementController.js';
import auth from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes (Public)
app.post('/api/auth/check', authController.checkEmail);
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/verify', authController.verifyOTP);

// Auth routes (Protected)
app.post('/api/auth/me', auth, authController.getMe);
app.post('/api/auth/balance', auth, authController.updateBalance);
app.post('/api/auth/profile', auth, authController.updateProfile);

// Ledger routes (Protected)
app.post('/api/ledger/credits', auth, ledgerController.getCredits);
app.post('/api/ledger/debits', auth, ledgerController.getDebits);
app.post('/api/ledger/unified', auth, ledgerController.getUnified);
app.post('/api/ledger/credit', auth, ledgerController.addCredit);
app.post('/api/ledger/debit', auth, ledgerController.addDebit);
app.post('/api/ledger/credit/delete', auth, ledgerController.deleteCredit);
app.post('/api/ledger/debit/delete', auth, ledgerController.deleteDebit);
app.post('/api/ledger/credit/update', auth, ledgerController.updateCredit);
app.post('/api/ledger/debit/update', auth, ledgerController.updateDebit);

// Statement routes (Protected)
app.post('/api/statement/email', auth, statementController.sendStatement);

// Mock webhook endpoint for local development
app.post('/api/mock-webhook', (req, res) => {
  console.log('\n==================================================');
  console.log('--- MOCK WEBHOOK RECEIVED REQUEST ---');
  console.log('Body Keys:', Object.keys(req.body));
  if (req.body.email) console.log('Target Email:', req.body.email);
  if (req.body.otp) console.log('OTP Code:', req.body.otp);
  if (req.body.startDate && req.body.endDate) {
    console.log('Statement Period:', req.body.startDate, 'to', req.body.endDate);
  }
  console.log('==================================================\n');
  res.json({
    success: true,
    message: '[MOCK SUCCESS] Webhook received payload successfully.'
  });
});

// Serve static assets in production if not run on Vercel (Vercel serves client automatically)
if (!process.env.VERCEL) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;
