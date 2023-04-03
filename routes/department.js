const router = require("express").Router();
const department = require("../controllers/department");

router.get("/", department.getAllDepartment);
router.get("/:id", department.getDepartment);
router.post("/", department.postAddDepartment);
router.delete("/:id", department.deleteDepartment);
router.put("/:id", department.updateDepartment);

module.exports = router;
