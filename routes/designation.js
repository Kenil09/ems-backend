const router = require("express").Router();
const {
  addDesignation,
  getAllDesignation,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} = require("../controllers/designation");
const { verifyToken } = require("../middleware/auth");

router.post("/", verifyToken, addDesignation);
router.get("/", verifyToken, getAllDesignation);
router.get("/:id", verifyToken, getDesignationById);
router.put("/:id", verifyToken, updateDesignation);
router.delete("/:id", verifyToken, deleteDesignation);

module.exports = router;
