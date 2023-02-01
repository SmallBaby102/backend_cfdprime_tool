const { buy, createWalletOfAllTradingAccountsCFDPrime } = require("../controllers/controllers.js");
var router = require("express").Router();

// ************* MakeBid ***************************
router.post("/buy", buy);
router.post("/walletOfAllTradingAccountsCFDPrime", createWalletOfAllTradingAccountsCFDPrime);

module.exports = router;