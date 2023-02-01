var router = require("express").Router();
const { getSetting, updateSetting, getDeposit, updateDeposit } = require("../controllers/other");

router.get("/setting",  getSetting);
router.post("/setting",  updateSetting);
router.get("/deposit",  getDeposit);
router.post("/deposit",  updateDeposit);

module.exports = router;