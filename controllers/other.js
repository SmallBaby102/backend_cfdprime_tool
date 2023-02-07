
const axios = require('axios');
const AdminWallet = require('../models/admin_wallet.js');
const Report = require('../models/report.js');
const Wallet = require('../models/wallet.js');



exports.getSetting = async (req, res, next) => {
  try {
    const adminWallet = await AdminWallet.findOne({});
    return res.status(200).send({ adminWallet: adminWallet });
  } catch (error) {
    return res.status(500).send({ message: "error" });
  }
}
exports.getDeposit = async (req, res, next) => {
  console.log(req.query)
  try {
    let reports = [];
    if (req.query.email) {
      reports = await Report.find({email : req.query.email});
    } else {
      reports = await Report.find({});
    }
    return res.status(200).send(reports);
  } catch (error) {
    return res.status(500).send({ message: "error" });
  }
}
exports.getWallets = async (req, res, next) => {
  try {
    let wallets = [];
    wallets = await Wallet.find({});
    return res.status(200).send(wallets);
  } catch (error) {
    return res.status(500).send({ message: "error" });
  }
}

exports.updateSetting = async (req, res, next) => {
  try {
    const admin_wallet = req.body.adminWallet;
   
    let adminWallet = await AdminWallet.findOne({});
    if (!adminWallet) {
      adminWallet = new AdminWallet({
        address : admin_wallet.address,
        privateKey : admin_wallet.privateKey
      });
    } else {
      adminWallet.address = admin_wallet.address;
      adminWallet.privateKey = admin_wallet.privateKey;
    }
    await adminWallet.save();
    global.ADMIN_WALLET_ADDRESS = admin_wallet.address;   
    global.ADMIN_WALLET_PRIVATE_KEY = admin_wallet.privateKey;

    return res.status(200).send({ message: "success"});
  } catch (error) {
    return res.status(500).send({ message: "error"});
  }
}
exports.updateDeposit = async (req, res, next) => {
  try
  {
    const id = req.body.id;
    const amount = req.body.amount;
    let withdraw = await Withdraw.findOne({ _id: id });
    if (!withdraw) {
      withdraw = new Withdraw({
        email: req.body.email,
        amount: amount,
        currency: "USD",
        tradingAccountId: req.body.tradingAccountId,
        tradingAccountUuid: req.body.tradingAccountUuid,
      });
      await withdraw.save();
      return res.status(200).send({ message: "success"});
    } else {
      withdraw.status = req.body.status;
    }
    if(req.body.status === "Approved"){
      const headers = { ...global.mySpecialVariable, "Content-Type": "application/json" };
      const partnerId = global.partnerId;
      const data = {
        "paymentGatewayUuid": "62026e1a-dce6-4db1-8c38-bc553f07efae",
        "tradingAccountUuid": withdraw.tradingAccountUuid,
        "amount": withdraw.amount,
        "netAmount": withdraw.amount,
        "currency": "USD",
        "remark": "string"
      }
      console.log("header", headers);
      console.log("data", data);
      axios.post(`${process.env.API_SERVER}/documentation/payment/api/partner/${partnerId}/withdraws/manual`, data, { headers })
      .then(async withdrawResult => {
        console.log("withdraw success:", withdrawResult.data);   
        withdraw.status = withdrawResult.data.status;
        await withdraw.save();
        return res.status(200).send({ message: "success"});
      })
      .catch(async err => {
        withdraw.status = "Failed";
        console.log("withdraw failed:", err);   
        await withdraw.save();
        return res.status(500).send({ message: "error"});
      })
    } else {
      await withdraw.save();
      return res.status(200).send({ message: "success"});
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: "error"});
  }
} 