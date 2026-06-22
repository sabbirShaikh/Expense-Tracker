import mongoose from 'mongoose';

const debitSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    index: true
  },
  Amount: {
    type: Number,
    required: true
  },
  'Payment Method': {
    type: String,
    default: ''
  },
  'Paid to': {
    type: String,
    default: ''
  },
  Date: {
    type: String,
    required: true
  },
  Note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Debit = mongoose.model('Debit', debitSchema);
export default Debit;
