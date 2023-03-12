const Leave = require('../models/Leave');
const LeaveType = require('../models/LeaveType');
const joi = require('joi');

const validateLeave = joi.object({
    LeaveTypeId: joi.string().required(),
    FromDate:  joi.string().required(),
    ToDate:  joi.string().required(),
})

exports.ApplyForLeave = async (req,res) => {
    try {
        const ValidateLeaves = validateLeave.validate(req.body);
        if (ValidateLeaves.error) {
            return res
              .status(400)
              .json({ status: "fail", message: ValidateLeaves.error.message });
        }
        // testing purpose
        const lv = new Leave({
            LeaveTypeId:req.body.LeaveTypeId,
            FromDate:req.body.FromDate,
            ToDate:req.body.ToDate,
            CancelledBy:null,
            Reason: null,
            SendTo:'manager'
        });
        const result = await lv.save();
        res.send(result);
        
    } catch (error) {
        console.log("Apply for leave", error.message);
        res.status(500).json({
            message:"Internal server error"
        })
    }

}

// get the current user id and fetch leave
exports.getAllLeaves = (req,res) => {
    
}