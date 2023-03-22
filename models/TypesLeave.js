const mongoose = require('mongoose');
const CompanyLeaveAccount=require('./CompanyLeaveAccount')

const leaveSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
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
  leaveSchema.pre('save', function (next) {
    const leaveDefaults = new CompanyLeaveAccount();
    this.casualLeave.total = leaveDefaults.casualLeave;
    this.earnedLeave.total = leaveDefaults.earnedLeave;
    this.leaveWithoutPay.total = leaveDefaults.leaveWithoutPay;
    this.sabbaticalLeave.total = leaveDefaults.sabbaticalLeave;
    this.sickLeave.total = leaveDefaults.sickLeave;
    next();
  })
   module.exports = mongoose.model('TypesLeave', leaveSchema);
  