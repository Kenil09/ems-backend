const router = require("express").Router();
const department = require("../controllers/department");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, department.getAllDepartment);
router.get("/:id", verifyToken, department.getDepartment);
router.post("/", verifyToken, department.postAddDepartment);
router.delete("/:id", verifyToken, department.deleteDepartment);
router.put("/:id", verifyToken, department.updateDepartment);

module.exports = router;
