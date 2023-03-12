const router = require("express").Router();
const {
  addDesignation,
  getAllDesignation,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} = require("../controllers/designation");

router.post("/", addDesignation);
router.get("/", getAllDesignation);
router.get("/:id", getDesignationById);
router.put("/:id", updateDesignation);
router.delete("/:id", deleteDesignation);

module.exports = router;
