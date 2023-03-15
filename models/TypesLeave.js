const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    casualLeave: {
      total: { type: Number, default: 12 },
      taken: { type: Number, default: 0 }
    },
    earnedLeave: {
      total: { type: Number, default: 12 },
      taken: { type: Number, default: 0 }
    },
    leaveWithoutPay: {
      total: { type: Number, default: 12 },
      taken: { type: Number, default: 0 }
    },
    sabbaticalLeave: {
      total: { type: Number, default: 12 },
      taken: { type: Number, default: 0 }
    },
    sickLeave: {
      total: { type: Number, default: 12 },
      taken: { type: Number, default: 0 }
    }
  });
   module.exports = mongoose.model('TypesLeave', leaveSchema);
  