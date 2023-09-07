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
    const startDate = dayjs(req.body.date);
    const endDate = dayjs(startDate).add(24, "hours");
    const userEntries = await Attendence.find({
      user: req.body.userId,
      checkIn: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
      checkOut: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
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
    if (!req.params.id) {
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

const checkConflictingEntries = async (newCheckIn, newCheckOut, user) => {
  const date = dayjs(newCheckIn);
  const today = new Date(date.year(), date.month(), date.date());
  const tomorrow = dayjs(today).add(24, "hours");

  const newEntryCheckIn = new Date(newCheckIn);
  const newEntryCheckOut = new Date(newCheckOut);

  const prevEntries = await Attendence.find({
    user,
    checkIn: { $gte: today.toISOString(), $lte: tomorrow.toISOString() },
    checkOut: { $gte: today.toISOString(), $lte: tomorrow.toISOString() },
  });

  let foundDuplicate = false;

  if (!prevEntries.length) {
    return false;
  }

  prevEntries.forEach((entry) => {
    const existingEntryCheckIn = entry.checkIn;
    const existingEntryCheckOut = entry.checkOut;

    if (
      (newEntryCheckIn >= existingEntryCheckIn &&
        newEntryCheckIn < existingEntryCheckOut) ||
      (newEntryCheckOut > existingEntryCheckIn &&
        newEntryCheckOut <= existingEntryCheckOut)
    ) {
      foundDuplicate = true;
    }
  });

  return foundDuplicate;
};

exports.addAttendenceEntry = async (req, res) => {
  try {
    const validateRequest = manualEntryValidation.validate(req.body);
    if (validateRequest.error) {
      return res
        .status(400)
        .json({ status: "fail", message: validateRequest.error.message });
    }

    const { checkIn, checkOut } = req.body;
    const duplicateEntries = await checkConflictingEntries(
      checkIn,
      checkOut,
      req.body.userId
    );
    if (duplicateEntries) {
      return res.status(400).json({
        message:
          "Your previous entries of this day is conflicting with new entry. Please enter valid hours",
      });
    }

    const addEntry = new Attendence({ ...req.body, manual: true });
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
    const endDay = dayjs(now).endOf("day");
    const checkUserCheckIn = await Attendence.findOne({
      user: req.user._id,
      checkIn: { $gte: today, $lte: endDay.toDate() },
      checkOut: { $gte: today, $lte: endDay.toDate() },
    }).sort({ checkOut: -1, checkIn: -1 });
    if (checkUserCheckIn && !checkUserCheckIn?.checkOut) {
      return res.status(400).json({ message: "User is already check in" });
    }
    // if (!checkUserCheckIn.checkOut) {
    //   return res.status(400).json({ message: "User is already check in" });
    // }
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
    const endDay = dayjs(now).endOf("day");
    const attendence = await Attendence.findOne({
      user: req.user._id,
      checkIn: { $gte: today, $lte: endDay.toDate() },
      // checkOut: { $gte: today, $lte: endDay.toDate() },
    }).sort({ checkIn: -1 });
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
  leave: "lightblue",
  absent: "lightsalmon", // red
  weekend: "yellow",
  present: "lightgreen",
  default: "white",
  attendedAbsent: "salmon",
};

const calculateHours = (attendedHour, shiftHours) => {
  const hour = attendedHour / shiftHours;
  let attendType = "";
  if (!hour) {
    attendType = "unattended";
  } else if (hour <= 0.5) {
    attendType = "halfDay";
  } else {
    attendType = "present";
  }
  return attendType;
};

const getPresentWeek = (day) => {
  if (day >= 1 && day <= 7) {
    return 0;
  } else if (day >= 8 && day <= 14) {
    return 1;
  } else if (day >= 15 && day <= 21) {
    return 2;
  } else if (day >= 22 && day <= 28) {
    return 3;
  } else {
    return 4;
  }
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
    checkIn: { $gte: startMonth.toISOString(), $lte: endMonth.toISOString() },
    checkOut: { $gte: startMonth.toISOString(), $lte: endMonth.toISOString() },
  });
  const leaves = await Leave.find({
    employee: user._id,
    createdAt: { $gte: startMonth.toISOString(), $lte: endMonth.toISOString() },
    CancelledBy: null,
  });
  const userMonth = [];
  const presentDay = dayjs().startOf("day").add(dayjs().utcOffset(), "minutes");
  for (let i = 1; i <= startMonth.daysInMonth(); i++) {
    const calcDay = dayjs([year, month, i]).add(
      dayjs([year, month, i]).utcOffset(),
      "minutes"
    );
    const todayAttendence = attendences.filter((attendence) => {
      return dayjs(attendence.checkIn).get("D") === calcDay.get("D");
    });
    const todayLeave = leaves.find((leave) => {
      return (
        calcDay.get("date") >= dayjs(leave.FromDate).get("date") &&
        calcDay.get("date") <= dayjs(leave.ToDate).get("date")
      );
    });

    // const presentWeek = calcDay.week() - startMonth.week();
    const presentWeek = getPresentWeek(calcDay.date());
    const isWeekend =
      shift.weekDefinition[presentWeek][calcDay.format("dddd").toLowerCase()];
    const todayInfo = {
      start: calcDay.format("YYYY-MM-DD"),
      end: calcDay.format("YYYY-MM-DD"),
      display: "background",
      color: colorScheme.default,
    };

    const getShiftDate = (string) => {
      const time = string.split(":");
      const shift = { hour: time[0], minute: time[1] };
      return dayjs().set("hour", shift.hour).set("minute", shift.minute);
    };
    const shiftHours = getShiftDate(shift.endTime).diff(
      getShiftDate(shift.startTime),
      "hour"
    );
    if (
      !todayAttendence.length &&
      !Boolean(calcDay.toDate() >= presentDay.toDate())
    ) {
      todayInfo.color = colorScheme.absent;
      todayInfo.title = "Absent";
      todayInfo.type = "absent";
    }

    if (isWeekend) {
      todayInfo.color = colorScheme.weekend;
      todayInfo.title = "Weekend";
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
      todayInfo.title = "Present";
      todayInfo.type = "attended";
      const attendedType = calculateHours(attendedHour.hours(), shiftHours);
      if (attendedType === "unattended") {
        todayInfo.title = "Absent";
        todayInfo.color = colorScheme.attendedAbsent;
      } else if (attendedType === "halfDay") {
        todayInfo.title = "Half Day";
      }
    }
    if (todayLeave) {
      todayInfo.color = colorScheme.leave;
      todayInfo.title = "Leave";
      todayInfo.type = "leave";
      todayInfo.leaveReason = todayLeave.Reason;
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
    const generalShift = await Shift.findOne({
      company: user.company._id,
      type: "general",
    });
    let userMonth = null;
    if (!customShift && !generalShift) {
      return res.status(404).json({ message: "Shift not found" });
    }
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
    const endDay = dayjs(now).endOf("day");
    const checkUserCheckIn = await Attendence.findOne({
      user: req.params.id,
      checkIn: { $gte: today, $lte: endDay.toDate() },
      // checkOut: { $gte: today, $lte: endDay.toDate() },
    }).sort({ checkIn: -1 });

    console.log("checkUserCheckIn", checkUserCheckIn);
    if (!checkUserCheckIn) {
      return res.status(200).json({ checkIn: false });
    }
    res.status(200).json({ checkIn: Boolean(!checkUserCheckIn.checkOut) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
