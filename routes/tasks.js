const router = require("express").Router();
const { createTask, submitTask } = require("../controllers/tasks");
const multer = require("multer");

router.post("/assignTask", createTask);
router.post("/submitTask", multer().any(), submitTask);

module.exports = router;
