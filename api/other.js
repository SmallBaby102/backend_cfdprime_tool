var router = require("express").Router();
const { getSetting, updateSetting, getDeposit, updateDeposit, getWallets } = require("../controllers/other");

router.get("/setting",  getSetting);
router.post("/setting",  updateSetting);
router.get("/deposit",  getDeposit);
router.get("/wallets",  getWallets);
router.post("/deposit",  updateDeposit);

module.exports = router;
