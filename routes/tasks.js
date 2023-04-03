const router = require("express").Router();
const {
  createTask,
  submitTask,
  completeTask,
  reassignTask,
  getUserTasks,
  updateTask,
} = require("../controllers/tasks");
const multer = require("multer");

router.get("/:id", getUserTasks);
router.post("/assignTask", multer().any(), createTask);
router.post("/submitTask/:id", multer().any(), submitTask);
router.post("/completeTask/:id", completeTask);
router.get("/reassign/:id", reassignTask);
router.put("/:id", updateTask);

module.exports = router;
