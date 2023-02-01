const mongoose = require("mongoose");

const Report = mongoose.model(
  "Report",
  new mongoose.Schema({
    clientUuid: String,
    email: String,
    tradingAccountUuid: String,
    tradingAccountId: String,
    amount: String,
    transfer_code: String,
    transfer_amount: String,
    createdAt: String,
    ethAddress: String,
  
  })
);

module.exports = Report;