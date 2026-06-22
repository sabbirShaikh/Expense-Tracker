import mongoose from 'mongoose';

const creditSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    index: true
  },
  Amount: {
    type: Number,
    required: true
  },
  Purpose: {
    type: String,
    default: ''
  },
  'Credited From': {
    type: String,
    default: ''
  },
  Date: {
    type: String,
    required: true
  },
  'Source of Payment': {
    type: String,
    default: ''
  },
  'Source Of Payment': {
    type: String,
    default: ''
  },
  Note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Credit = mongoose.model('Credit', creditSchema);
export default Credit;
