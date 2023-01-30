const router = require("express").Router();
const user = require("../controllers/user");

router.post("/", user.postCreateUser);
router.post("/login", user.postLoginUser);
router.get("/", user.getAllUsers);
router.get("/:id", user.getUserById);
router.delete("/:id", user.deleteUser);

module.exports = router;
