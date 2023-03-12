const router = require("express").Router();
const user = require("../controllers/user");
const { verifyToken } = require("../middleware/auth");

router.post("/", verifyToken, user.postCreateUser);
router.post("/login", user.postLoginUser);
router.post("/register", user.registerUser);
router.get("/", verifyToken, user.getAllUsers);
router.get("/:id", verifyToken, user.getUserById);
router.delete("/:id", verifyToken, user.deleteUser);

module.exports = router;