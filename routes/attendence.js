const router = require("express").Router();
const {
  checkIn,
  checkOut,
  userStatus,
  getUserMonthDetails,
  addAttendenceEntry,
  getAttendenceEntry,
  updateAttendenceEntry,
  deleteAttendenceEntry,
} = require("../controllers/attendence");
const { verifyToken } = require("../middleware/auth");

router.get("/checkIn", verifyToken, checkIn); // For checkIn
router.get("/checkOut", verifyToken, checkOut); // For checkout
router.get("/userAvailableStatus/:id", userStatus); // For check that user is check in or not
router.post("/getMonthAttendence", getUserMonthDetails); // for getting user month attendence entry
router.post("/addEntry", verifyToken, addAttendenceEntry); // adding manual entry for user
router.post("/getEntries", getAttendenceEntry); // getting user specific date entry
router.put("/updateEntry", updateAttendenceEntry); // for updating user entry
router.delete("/deleteEntry/:id", deleteAttendenceEntry); // for deleting user entry

module.exports = router;
