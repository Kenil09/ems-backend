const router = require("express").Router();
const {
  createTask,
  submitTask,
  completeTask,
  reassignTask,
} = require("../controllers/tasks");
const multer = require("multer");

router.post("/assignTask", createTask);
router.post("/submitTask/:id", multer().any(), submitTask);
router.post("/completeTask/:id", completeTask);
router.get("/reassign/:id", reassignTask);

module.exports = router;
