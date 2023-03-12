const { model , Schema } = require('mongoose');

const LeaveTypes = new Schema({
    CasualLeave: {
        available: {
            type:Number,
            default: 12
        },
        booked:{
            type:Number,
            default: 0
        }
    },
    EarnedLeave:{
        available:{
            type:Number,
            default: 12
        },
        booked:{
            type:Number,
            default: 0
        }
    },
    LeaveWithoutPay:{
        available:{
            type:Number,
            default: 12
        },
        booked: {
            type:Number,
            default: 0
        }
    },
    ParternityLeave:{
        available:{
            type:Number,
            default: 12
        },
        booked:{
            type:Number,
            default: 0
        }
    },
    SabbaticalLeave:{
        available:{
            type:Number,
            default: 12
        },
        booked: {
            type:Number,
            default: 0
        }
    },
    SickLeave:{
        available:{
            type:Number,
            default: 12
        },
        booked:{
            type:Number,
            default: 0
        }
    }
});



module.exports = model("LeaveTypes",LeaveTypes);