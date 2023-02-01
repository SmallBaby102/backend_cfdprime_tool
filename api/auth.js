var router = require("express").Router();
const controller = require("../controllers/auth");
router.post("/admin-signup", controller.adminSignup);
router.post("/admin-signin", controller.adminSignin);
module.exports = router;