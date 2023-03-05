const router = require("express").Router();
const company = require("../controllers/company");

router.get("/", company.getAllCompany);
router.get("/:id", company.getCompany);
router.post("/", company.postAddCompany);
router.delete("/:id", company.deleteCompany);
router.put("/:id", company.updateCompany);

module.exports = router;
