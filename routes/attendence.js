const router = require("express").Router();
const {
  checkIn,
  checkOut,
  userStatus,
  getUserMonthDetails,
  manualEntry,
} = require("../controllers/attendence");
const { verifyToken } = require("../middleware/auth");

router.get("/checkIn", verifyToken, checkIn);
router.get("/checkOut", verifyToken, checkOut);
router.get("/userAvailableStatus/:id", userStatus);
router.post("/getMonthAttendence", getUserMonthDetails);
router.post("/manualEntry", verifyToken, manualEntry);

module.exports = router;
