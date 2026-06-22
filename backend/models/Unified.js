import mongoose from 'mongoose';

const unifiedSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    index: true
  },
  Date: {
    type: String,
    required: true
  },
  'Source of Payment': {
    type: String,
    default: ''
  },
  Purpose: {
    type: String,
    default: ''
  },
  Debit: {
    type: Number,
    default: 0
  },
  Credit: {
    type: Number,
    default: 0
  },
  Balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Unified = mongoose.model('Unified', unifiedSchema);
export default Unified;
