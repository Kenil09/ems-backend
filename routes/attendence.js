const router = require("express").Router();
const { checkIn, checkOut, userStatus } = require("../controllers/attendence");
const { verifyToken } = require("../middleware/auth");

router.get("/checkIn", verifyToken, checkIn);
router.get("/checkOut", verifyToken, checkOut);
router.get("/userAvailableStatus/:id", userStatus);

module.exports = router;
