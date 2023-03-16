const Leave = require('../models/Leave');
const TypeLeave = require('../models/TypesLeave');
const User = require("../models/User");

const joi = require('joi');

const validateLeave = joi.object({
    LeaveTypeId: joi.string().required(),
    FromDate: joi.string().required(),
    ToDate: joi.string().required(),
})
function addDays(date) {
    var result = new Date(date);
    result.setDate(result.getDate() + 1);
    return result;
}
function isDateEqual(fromDate,ToDate){
    const isfromDate=new Date(fromDate).getDate();
    const isToDate=new Date(ToDate).getDate();
    return isfromDate===isToDate;
}
// Function to apply for leave
exports.applyLeave = async (req, res) => {
    const { employee, leaveType, fromDate, toDate, reason } = req.body;
    console.log(fromDate,"fromDate");
    try {
        // Find the user's leave record
        const validLeaveTypes = [
            'casualLeave',
            'earnedLeave',
            'leaveWithoutPay',
            'sabbaticalLeave',
            'sickLeave'
        ];
        console.log(leaveType, "leaveTypes")
        console.log(validLeaveTypes.includes(leaveType))
        if (!validLeaveTypes.includes(leaveType)) {
            return res.status(400).json({ message: 'Invalid leave type' });
        }
        let duration;
        if(fromDate==toDate){
            duration=1;
        }else{
            duration = Math.ceil((addDays(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24));
        }
        let userLeave = await TypeLeave.findOne({ employee: employee });

        // If the user doesn't have a leave record, create one with default values
        if (!userLeave) {
            userLeave = new TypeLeave({ employee: employee });
            await userLeave.save();
        }

        // Check if the user has enough leave balance
        const typesLeave = await TypeLeave.findOne({ employee: employee });
        if (!typesLeave) {
            return res.status(400).json({ message: 'Leave balance not found' });
        }
        if ((typesLeave[leaveType].taken >= typesLeave[leaveType].total) || (typesLeave[leaveType].total - typesLeave[leaveType].taken) < duration) {
            return res.status(400).json({ message: 'Insufficient leave balance' });
        }

        console.log("hii")
        // Check if the employee has already applied for leave on the given dates
        const existingLeave = await Leave.findOne({
            employee: employee,
            FromDate: { $lte: toDate },
            ToDate: { $gte: fromDate },
            Status: { $ne: 'Rejected' }
        });
        if (existingLeave) {
            return res.status(400).json({ message: 'Leave already applied for these dates' });
        }

        // Calculate the duration of the leave

        // Check if the leave duration is valid for casual leave
        // if (leaveType === 'casualLeave' && duration > 3) {
        //   return res.status(400).json({ message: 'Casual leave cannot be more than 3 days' });
        // }

        // Create a new leave request
        const newLeave = new Leave({
            employee: employee,
            FromDate: fromDate,
            ToDate: toDate,
            Reason: reason,
            LeaveType: leaveType,
            Status : 'Approved',
            duration:duration,
            CancelledBy : null
        });

        // Save the new leave request
        await newLeave.save();

        /////
        const findLeaveAccount = await TypeLeave.findOne({ employee: employee });
        
        findLeaveAccount[leaveType].taken += duration;
        await findLeaveAccount.save()
        /////

        return res.status(200).json({ message: 'Leave submitted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.approveLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { userId } = req.body;

        // Check if leave exists and is pending
        console.log(leaveId, "leaveId")
        const leave = await Leave.findOne({ _id: leaveId, Status: 'Pending' });
        if (!leave) {
            return res.status(400).json({ message: 'Leave not found or already processed' });
        }

        // Update leave status and cancelled by field
        leave.Status = 'Approved';
        leave.CancelledBy = null;
        await leave.save();

        // Cut leave days from employee's leave types
        const leaveType = leave.LeaveType;
        
        const typesLeave = await TypeLeave.findOne({ employee: userId });
        if (!typesLeave) {
            return res.status(400).json({ message: 'Leave balance not found' });
        }
        if ((typesLeave[leaveType].taken >= typesLeave[leaveType].total) || (typesLeave[leaveType].total - typesLeave[leaveType].taken) < duration) {
            return res.status(400).json({ message: 'Insufficient leave balance' });
        }

        typesLeave[leaveType].taken += leave.duration;
        await typesLeave.save();

        res.json({ message: 'Leave approved and leaves deducted from employee\'s account' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelledLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { userId, CancelledMessage } = req.body;

        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }

        if (leave.CancelledBy) {
            return res.status(400).json({ error: 'Leave already cancelled' });
        }
        const typesLeave = await TypeLeave.findOne({ employee: leave.employee });
        if(!typesLeave){
            return res.status(400).json({ error: 'Leave Account not found' });
        }
        typesLeave[leave.LeaveType].taken -= leave.duration;
        await typesLeave.save();
        leave.CancelledBy = userId;
        leave.Status = 'Rejected';
        if(CancelledMessage){
            leave.CancelledMessage = CancelledMessage;
        }
        
        await leave.save();

        return res.json({ message: 'Leave cancelled successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getAvailableLeaves = async (req, res) => {
    try {
        const leaves = await TypeLeave.findOne({ employee: req.params.userId });
        const user = await User.findOne({ _id: req.params.userId });
        if (leaves && user) {
            return res.status(200).json({ success: true, leaves });
        }
        if (!leaves && user) {
            const newUserTypeLeave = new TypeLeave({
                employee: req.params.userId
            })
            await newUserTypeLeave.save();
            return res.status(200).json({ success: true,message:"new Created Leave", leaves:newUserTypeLeave });
        } else {
            return res.status(400).json({ success: false, message: "Leaves not found" });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find();
        res.status(200).json({ success: true, leaves });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getUserLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employee: req.params.userId });
        res.status(200).json({ success: true, leaves });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};