const { model, Schema } = require('mongoose');

const Leave = new Schema({
    LeaveTypeId:{
        type : Schema.Types.ObjectId,
        ref:"",
        require:true
    },
    FromDate:{
        type: Date
    },
    ToDate:{
        type: Date
    },
    CancelledBy:{
        type : Schema.Types.ObjectId,
        default:null,
        ref:"User"
    },
    Reason:{
        type: String,
        default:null,
    },
    Status:{
        type: String,
        enum:['Approved','Rejected','Pending'],
        default:'Pending'
    },
    // this is for messaging purpose only
    SendTo:{
        type:String
    }
});

module.exports = model("Leave",Leave);