const router = require("express").Router();
const user = require("../controllers/user");

router.post("/", user.postCreateUser);
router.post("/login", user.postLoginUser);

module.exports = router;
