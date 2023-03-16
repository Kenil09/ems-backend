const router = require("express").Router();
const {
  addShift,
  updateShift,
  deleteShift,
  getCompanyShifts,
} = require("../controllers/shift");
const { verifyToken } = require("../middleware/auth");

router.get("/:id", getCompanyShifts);
router.post("/", verifyToken, addShift);
router.put("/:id", verifyToken, updateShift);
router.delete("/:id", verifyToken, deleteShift);

module.exports = router;
