import Credit from '../models/Credit.js';
import Debit from '../models/Debit.js';
import Unified from '../models/Unified.js';
import User from '../models/User.js';

export const getCredits = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const credits = await Credit.find({ Email: email.trim().toLowerCase() }).sort({ createdAt: -1 });
    res.json({
      success: true,
      results: {
        data: credits
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDebits = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const debits = await Debit.find({ Email: email.trim().toLowerCase() }).sort({ createdAt: -1 });
    res.json({
      success: true,
      results: {
        data: debits
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnified = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const unified = await Unified.find({ Email: email.trim().toLowerCase() }).sort({ createdAt: -1 });
    res.json({
      success: true,
      results: {
        data: unified
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addCredit = async (req, res) => {
  const { email, userRowId, currentBalance, amount, purpose, creditedFrom, sourceOfPayment, note, date } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const amtVal = Number(amount);
  const newBalance = Number(currentBalance) + amtVal;

  try {
    // 1. Create Credit record
    const newCredit = new Credit({
      Email: normalizedEmail,
      Amount: amtVal,
      Purpose: purpose,
      'Credited From': creditedFrom,
      Date: date,
      'Source of Payment': sourceOfPayment,
      'Source Of Payment': sourceOfPayment,
      Note: note
    });
    await newCredit.save();

    // 2. Create Unified record
    const newUnified = new Unified({
      Email: normalizedEmail,
      Date: date,
      'Source of Payment': sourceOfPayment,
      Purpose: purpose,
      Debit: 0,
      Credit: amtVal,
      Balance: newBalance
    });
    await newUnified.save();

    // 3. Update User balance
    await User.findByIdAndUpdate(userRowId, { Balance: newBalance });

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error('Add Credit Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to record credit transaction.' });
  }
};

export const addDebit = async (req, res) => {
  const { email, userRowId, currentBalance, amount, paymentMethod, paidTo, note, date } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const amtVal = Number(amount);
  const newBalance = Number(currentBalance) - amtVal;

  try {
    // 1. Create Debit record
    const newDebit = new Debit({
      Email: normalizedEmail,
      Amount: amtVal,
      'Payment Method': paymentMethod,
      'Paid to': paidTo,
      Date: date,
      Note: note
    });
    await newDebit.save();

    // 2. Create Unified record
    const newUnified = new Unified({
      Email: normalizedEmail,
      Date: date,
      'Source of Payment': paymentMethod,
      Purpose: paidTo,
      Debit: amtVal,
      Credit: 0,
      Balance: newBalance
    });
    await newUnified.save();

    // 3. Update User balance
    await User.findByIdAndUpdate(userRowId, { Balance: newBalance });

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error('Add Debit Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to record debit transaction.' });
  }
};

export const deleteCredit = async (req, res) => {
  const { email, userRowId, creditRowId, amount, purpose, date } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const amtVal = Number(amount);

  try {
    // 1. Delete Credit record
    await Credit.findByIdAndDelete(creditRowId);

    // 2. Delete Unified record
    await Unified.findOneAndDelete({
      Email: normalizedEmail,
      Date: date,
      Credit: amtVal,
      Purpose: purpose
    });

    // 3. Recompute user balance
    const user = await User.findById(userRowId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const newBalance = user.Balance - amtVal;
    user.Balance = newBalance;
    await user.save();

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error('Delete Credit Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to delete credit record.' });
  }
};

export const deleteDebit = async (req, res) => {
  const { email, userRowId, debitRowId, amount, purpose, date } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const amtVal = Number(amount);

  try {
    // 1. Delete Debit record
    await Debit.findByIdAndDelete(debitRowId);

    // 2. Delete Unified record
    await Unified.findOneAndDelete({
      Email: normalizedEmail,
      Date: date,
      Debit: amtVal,
      Purpose: purpose
    });

    // 3. Recompute user balance
    const user = await User.findById(userRowId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const newBalance = user.Balance + amtVal;
    user.Balance = newBalance;
    await user.save();

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error('Delete Debit Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to delete debit record.' });
  }
};

export const updateCredit = async (req, res) => {
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
  } = req.body;

  const normalizedEmail = email.trim().toLowerCase();
  const oldAmtVal = Number(oldAmount);
  const newAmtVal = Number(newAmount);
  const diff = newAmtVal - oldAmtVal;

  try {
    // 1. Update Credit record
    await Credit.findByIdAndUpdate(creditRowId, {
      Amount: newAmtVal,
      Purpose: newPurpose,
      'Credited From': creditedFrom,
      Date: newDate,
      'Source of Payment': sourceOfPayment,
      'Source Of Payment': sourceOfPayment,
      Note: note
    });

    // 2. Update Unified record
    const unifiedRecord = await Unified.findOne({
      Email: normalizedEmail,
      Date: oldDate,
      Credit: oldAmtVal,
      Purpose: oldPurpose
    });

    if (unifiedRecord) {
      unifiedRecord.Date = newDate;
      unifiedRecord['Source of Payment'] = sourceOfPayment;
      unifiedRecord.Purpose = newPurpose;
      unifiedRecord.Credit = newAmtVal;
      unifiedRecord.Balance = unifiedRecord.Balance + diff;
      await unifiedRecord.save();
    }

    // 3. Update User balance
    const user = await User.findById(userRowId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const newBalance = user.Balance + diff;
    user.Balance = newBalance;
    await user.save();

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error('Update Credit Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to update credit record.' });
  }
};

export const updateDebit = async (req, res) => {
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
  } = req.body;

  const normalizedEmail = email.trim().toLowerCase();
  const oldAmtVal = Number(oldAmount);
  const newAmtVal = Number(newAmount);
  const diff = newAmtVal - oldAmtVal;

  try {
    // 1. Update Debit record
    await Debit.findByIdAndUpdate(debitRowId, {
      Amount: newAmtVal,
      'Paid to': paidTo,
      Date: newDate,
      'Payment Method': paymentMethod,
      Note: note
    });

    // 2. Update Unified record
    const unifiedRecord = await Unified.findOne({
      Email: normalizedEmail,
      Date: oldDate,
      Debit: oldAmtVal,
      Purpose: oldPurpose
    });

    if (unifiedRecord) {
      unifiedRecord.Date = newDate;
      unifiedRecord['Source of Payment'] = paymentMethod;
      unifiedRecord.Purpose = paidTo;
      unifiedRecord.Debit = newAmtVal;
      unifiedRecord.Balance = unifiedRecord.Balance - diff;
      await unifiedRecord.save();
    }

    // 3. Update User balance
    const user = await User.findById(userRowId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const newBalance = user.Balance - diff;
    user.Balance = newBalance;
    await user.save();

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error('Update Debit Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to update debit record.' });
  }
};
export default { getCredits, getDebits, getUnified, addCredit, addDebit, deleteCredit, deleteDebit, updateCredit, updateDebit };
