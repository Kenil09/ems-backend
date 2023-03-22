const Attendence = require("../models/Attendence");
const Shift = require("../models/Shift");
const Leave = require("../models/Leave");
const Joi = require("joi");
const User = require("../models/User");
const dayjs = require("dayjs");
const WeekOfYear = require("dayjs/plugin/weekOfYear");
const IsoWeek = require("dayjs/plugin/isoWeek");
const Duration = require("dayjs/plugin/duration");
dayjs.extend(Duration);
dayjs.extend(WeekOfYear);
dayjs.extend(IsoWeek);

const getUserMonthDetails = Joi.object({
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().min(1950).max(2050).required(),
  userId: Joi.string().required(),
});

const manualEntryValidation = Joi.object({
  checkIn: Joi.date().required(),
  checkOut: Joi.date().required(),
  user: Joi.string().required(),
});

const getUserEntryValidation = Joi.object({
  userId: Joi.string().required(),
  date: Joi.date().required(),
});

const editAttendenceEntry = Joi.object({
  entryId: Joi.string().required(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date().required(),
});

exports.getAttendenceEntry = async (req, res) => {
  try {
    const validateRequest = getUserEntryValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const startDate = dayjs(req.body.date).startOf("day");
    const endDate = dayjs(startDate).endOf("day");

    const userEntries = await Attendence.find({
      user: req.body.userId,
      createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    }).populate(["user"]);

    res.status(200).json({ attendence: userEntries });
  } catch (error) {
    console.log("error in get user entries route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAttendenceEntry = async (req, res) => {
  try {
    const validateRequest = editAttendenceEntry.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const { entryId, checkIn, checkOut } = req.body;
    const attendenceEntry = await Attendence.findById(entryId);
    if (!attendenceEntry) {
      return res.status(404).json({ message: "record not found" });
    }
    if (
      !dayjs(checkIn).isAfter(dayjs(checkOut)) ||
      dayjs(checkIn).date() !== dayjs(checkOut).date()
    ) {
      return res
        .status(400)
        .json({ messgae: "Invalid check in date provided" });
    }
    attendenceEntry.checkIn = checkIn;
    attendenceEntry.checkOut = checkOut;
    const result = await (await attendenceEntry.save()).populate(["user"]);
    res.status(200).json({
      message: "Attendence record updated successfully",
      attendence: result,
    });
  } catch (error) {
    console.log("error in update attendence entries route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAttendenceEntry = async (req, res) => {
  try {
    if (req.params.id) {
      return res.status(400).json({ message: "bad request" });
    }
    const attendence = await Attendence.findByIdAndDelete(req.params.id);
    if (!attendence) {
      return res.status(404).json({ message: "Record not found" });
    }
    res
      .status(200)
      .json({ message: "Attendence entry deleted successfully", attendence });
  } catch (error) {
    console.log("error in delete attendence entries route", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addAttendenceEntry = async (req, res) => {
  try {
    const validateRequest = manualEntryValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const addEntry = new Attendence(req.body);
    const result = await (await addEntry.save()).populate("user");
    res
      .status(200)
      .json({ entry: result, message: "Entry added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkUserCheckIn = await Attendence.findOne({
      user: req.user._id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });
    if (!checkUserCheckIn.checkOut) {
      return res.status(400).json({ message: "User is already check in" });
    }

    const attendence = new Attendence({
      checkIn: new Date(),
      user: req.user._id,
    });
    const result = await (await attendence.save()).populate(["user"]);
    res
      .status(200)
      .json({ message: "User check in successfully", attendence: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const attendence = await Attendence.findOne({
      user: req.user._id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });
    if (attendence.checkOut) {
      return res.status(400).json({ message: "User is already checked out" });
    }
    attendence.checkOut = new Date();
    const result = await (await attendence.save()).populate(["user"]);
    res
      .status(200)
      .json({ message: "User is check out successfully", attendence: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const colorScheme = {
  leave: "blue",
  absent: "red",
  weekend: "yellow",
  present: "green",
};

const calculateAttendence = async (year, month, shift, user) => {
  const startMonth = dayjs([year, month]).add(
    dayjs([year, month]).utcOffset(),
    "minutes"
  );
  const endMonth = dayjs([year, month, dayjs().daysInMonth()]).add(
    dayjs([year, month]).utcOffset(),
    "minutes"
  );
  const attendences = await Attendence.find({
    user: user._id,
    createdAt: { $gte: startMonth.toISOString(), $lte: endMonth.toISOString() },
  });
  const leaves = await Leave.find({
    employee: user._id,
    createdAt: { $gte: startMonth.toISOString(), $lte: endMonth.toISOString() },
    CancelledBy: null,
  });
  // const startMonth = dayjs([year, month]);
  const userMonth = [];
  const presentDay = dayjs().add(dayjs().utcOffset(), "minutes");
  for (let i = 1; i <= startMonth.daysInMonth(); i++) {
    const calcDay = dayjs([year, month, i]).add(
      dayjs([year, month, i]).utcOffset(),
      "minutes"
    );
    const todayAttendence = attendences.filter(
      (attendence) => dayjs(attendence.createdAt).get("D") === calcDay.get("D")
    );
    const todayLeave = leaves.find(
      (leave) =>
        dayjs(leave.FromDate).get("D") >= calcDay.get("D") &&
        dayjs(leave.ToDate).get("D") <= calcDay.get("D")
    );
    const presentWeek = calcDay.week() - startMonth.week();
    const isWeekend =
      shift.weekDefinition[presentWeek][calcDay.format("dddd").toLowerCase()];
    const todayInfo = {
      start: calcDay.format("YYYY-MM-DD"),
      end: calcDay.format("YYYY-MM-DD"),
    };
    if (!todayAttendence.length && !Boolean(calcDay > presentDay)) {
      todayInfo.color = colorScheme.absent;
      todayInfo.type = "absent";
    }
    if (todayLeave) {
      (todayInfo.color = colorScheme.leave), (todayInfo.type = "leave");
    }
    if (isWeekend) {
      todayInfo.color = colorScheme.weekend;
      todayInfo.type = "weekend";
    }
    if (todayAttendence.length) {
      let attendedHour = dayjs.duration({ hours: 00, minutes: 00 });
      todayAttendence.forEach(({ checkIn, checkOut }) => {
        const start = dayjs(checkIn);
        const end = dayjs(checkOut);
        const diff = dayjs.duration(end.diff(start));
        attendedHour = attendedHour.add(diff);
      });
      todayInfo.attendedHour = attendedHour.format("HH:mm");
      todayInfo.color = colorScheme.present;
      todayInfo.type = "present";
    }
    userMonth.push(todayInfo);
  }
  return userMonth;
};

exports.getUserMonthDetails = async (req, res) => {
  try {
    const validateRequest = getUserMonthDetails.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }
    const { month, year, userId } = req.body;

    const user = await User.findById(userId).populate([
      "company",
      "department",
      "designation",
      "reportingManager",
      "createdBy",
      "updatedBy",
    ]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const customShift = await Shift.findOne({
      applicableDepartments: { $in: user.department?._id },
      company: user.company._id,
    });
    const generalShift = await Shift.findOne({ company: user.company._id });
    let userMonth = null;
    if (!customShift) {
      userMonth = await calculateAttendence(year, month, generalShift, user);
    } else {
      userMonth = await calculateAttendence(year, month, customShift, user);
    }
    res.status(200).json({ month: userMonth });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.userStatus = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkUserCheckIn = await Attendence.findOne({
      user: req.params.id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });
    if (!checkUserCheckIn) {
      return res.status(200).json({ checkIn: false });
    }
    res.status(200).json({ checkIn: Boolean(!checkUserCheckIn.checkOut) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
