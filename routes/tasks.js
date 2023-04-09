const router = require("express").Router();
const {
  createTask,
  submitTask,
  completeTask,
  reassignTask,
  getUserTasks,
  updateTask,
  commentOnTask,
  getTaskComments,
} = require("../controllers/tasks");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");

router.get("/:id", getUserTasks);
router.post("/assignTask", multer().any(), createTask);
router.post("/submitTask/:id", multer().any(), submitTask);
router.post("/completeTask/:id", completeTask);
router.get("/reassign/:id", reassignTask);
router.put("/:id", updateTask);
router.post("/addComment", verifyToken, commentOnTask);
router.get("/comment/:id", getTaskComments);

module.exports = router;
