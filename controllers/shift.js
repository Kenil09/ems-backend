const Shift = require("../models/Shift");
const Joi = require("joi");

const createShiftValidation = Joi.object({
    name: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    margin: Joi.string().required(),
    marginBefore: Joi.string().when("margin", { is: true, then: Joi.string().required() }),
    marginAfter: Joi.string().when("margin", { is: true, then: Joi.string().required() }),
    company: Joi.string().required(),
    applicableDepartments: Joi.array().items(Joi.string().required()).required()
});

exports.addShift = async (req, res) => {
    try {
        const validateRequest = createShiftValidation.validate(req.body);
        if (validateRequest.error) {
            console.log(validateRequest.error.details);
            return res
                .status(400)
                .json({ status: "fail", message: validateRequest.error.message });
        }
        const shift = new Shift({ ...req.body, createdBy: req.user._id, type: "custom" });
        return res
            .status(200)
            .json({ message: "Shift created succesfully", shift });
    } catch (error) {
        console.log("create shift", error.message, error);
        res.status(500).json({ message: "Internal sever error" });
    }
}

exports.getCompanyShifts = async (req, res) => {
    try {
        const shifts = await Shift.find({ company: req.query.company }).populate("company").populate("applicableDepartments");
        res.status(200).json({ shifts });
    } catch (error) {
        console.log("Get company shifts", error.message);
        res.status(500).json({ message: "Internal sever error" });
    }
}

exports.deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findByIdAndDelete(req.query._id);
        if (!shift) {
            res.status(404).json("Shift not found");
        }
        res.status(200).json({ message: "shift deleted successfully" });
    } catch (error) {
        console.log("Get company shifts", error.message);
        res.status(500).json({ message: "Internal sever error" });
    }
}

exports.updateShift = async (req, res) => {
    try {
        const validateRequest = createShiftValidation.validate(req.body);
        if (validateRequest.error) {
            return res
                .status(400)
                .json({ status: "fail", message: validateRequest.error.message });
        }
        const shift = await Shift.findOne(req.params.id);
        if (!shift) {
            return res.status(404).json({ message: "Unable to find the shift" });
        }
        const allowedUpdates = ["name", "startTime", "endTime", "margin", "marginBefore", "marginAfter", "applicableDepartments"];
        const updates = Object.keys(req.body);
        updates.every((update) => {
            if (!allowedUpdates.includes(update)) {
                return res.status(401).json({ message: `${update} is not allowed` });
            }
        });
        updates.forEach((update) => (company[update] = req.body[update]));
        let result = await company.save();
        res
            .status(200)
            .json({ message: "Shift updated successfully", company: result });

    } catch (error) {
        console.log("Get company shifts", error.message);
        res.status(500).json({ message: "Internal sever error" });
    }
}