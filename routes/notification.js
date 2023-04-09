const router = require("express").Router();
const {
  notifyTaskUsers,
  getNotification,
  deleteNotification,
  getNotificationCount,
} = require("../controllers/notification");
const { verifyToken } = require("../middleware/auth");

router.post("/task", notifyTaskUsers);
router.get("/", verifyToken, getNotification);
router.delete("/:id", verifyToken, deleteNotification);
router.get("/count", verifyToken, getNotificationCount);

module.exports = router;
