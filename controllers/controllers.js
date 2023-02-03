
const axios = require('axios');
const puppeteer = require('puppeteer');
const { generateAccount } = require('tron-create-address')
const ethWallet = require('ethereumjs-wallet').default;
var bcrypt = require("bcryptjs");
const Wallet = require('../models/wallet.js');
const Report = require('../models/report.js');
const CancelToken = axios.CancelToken;
const fs = require("fs");
const Web3 = require("web3");
const ethers = require("ethers");
const nodemailer = require("nodemailer");

const BUSDT_ABI = require("../abi/busdt_abi.json");
const USDT_ABI = require("../abi/usdt_abi.json");
const BNB_ABI = require("../abi/bnb_abi.json");
// =========================================Buy USDT===============================================
exports.buy = async (req, res, next) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });

  }
  let wallet = await Wallet.findOne({ tradingAccountId: req.body.receive_address});
  const reqBody = {
    receive_address : wallet?.ethAddress,
    receive_amount : req.body.receive_amount,
    user_info : wallet?.email || "email",
  }; 
  console.log("reqBody", reqBody); 
  if (!wallet || !wallet.ethAddress){
    return res.status(400).send({ message: "We can't find your trading account!"})
  }
  try {
    const browser = await puppeteer.launch({headless:true, args: ['--no-sandbox'] });
    console.log("puppeteer launch")
    try {
      const page = await browser.newPage();
      await page.goto('https://stacoinex.vn/transaction/buy', {waitUntil: 'networkidle2'});
      await page.waitForSelector('input[name=receive_amount]');
      await page.type('input[name=receive_amount]', reqBody.receive_amount);
      await page.waitForSelector('#buy_info_address');
      await page.type('#buy_info_address',reqBody.receive_address);
      await page.waitForSelector('#buy_info_contact');
      await page.type('#buy_info_contact',reqBody.user_info);
      const selector = "form .btn-order";
      await page.waitForSelector(selector);
      const button = await page.$(selector);
      await button.evaluate(b => b.click());
      await page.waitForNavigation();
      let temp  = page.url().split("/");
      let result_url = `https://stacoinex.vn/ajax/order/${temp[temp.length-1]}`;
      let res_page = await axios.get(result_url);
      await browser.close();
      let csv = `\r\n${res_page.data.data.order.amount.toLocaleString(undefined, {maximumFractionDigits:3})}, ${res_page.data.data.order.receive_address}, ${res_page.data.data.order.code}, ${res_page.data.data.order.created_at}`;
      fs.appendFileSync("public/result.csv", csv);
      let report = new Report({
        clientUuid: wallet.clientUuid,
        email: wallet.email,
        tradingAccountUuid: wallet.tradingAccountUuid,
        tradingAccountId: wallet.tradingAccountId,
        amount: req.body.receive_amount,
        code: res_page.data?.data?.order?.code,
        transfer_code: res_page.data?.data?.order?.bankTransfer?.transfer_code,
        transfer_amount: res_page.data?.data?.order?.amount,
        createdAt: res_page.data?.data?.order?.created_at,
        ethAddress: wallet.ethAddress,
        status: res_page.data?.data?.order?.status,
      })
      await report.save();
      return res.status(200).send(res_page.data);
    } catch (error) {
      console.log(error)
      console.log("browser", browser)
      await browser.close(); 
      return res.status(500).send({message : error });
    }
  } catch (error) {
      console.log("puppeteer error:", error)
      return res.status(500).send({message :  error});
  }
};
/*Here we are configuring our SMTP Server details.
STMP is mail server which is responsible for sending and recieving email.
*/
let smtpTransport = nodemailer.createTransport({
service: "Gmail",
auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
}
});
let rand,mailOptions,host,link;
/*------------------SMTP Over-----------------------------*/

// Listening Wallet address 
async function getBUsdtTransfer(email, wallet_address){
  const Common = require('ethereumjs-common');
  const Tx = require('ethereumjs-tx')
  // const web3 = (new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")))
  const web3 = new Web3(new Web3.providers.HttpProvider("https://necessary-snowy-road.bsc.discover.quiknode.pro/917afe17cb7449f1b033b31c03417aad8df285c4/"))
  // let wallet_addresses = ["0x5fF3A508d28A3c237656Ba23A042863aa47FC098"];
  const busdt = "0x55d398326f99059fF775485246999027B3197955"; ///BUSDT Contract
  const provider = new ethers.providers.WebSocketProvider(
      `wss://necessary-snowy-road.bsc.discover.quiknode.pro/917afe17cb7449f1b033b31c03417aad8df285c4/`
  ); 
  // List all token transfers  *to*  myAddress:
  // const filter = {
  //     address: busdt,
  //     topics: [
  //         ethers.utils.id("Transfer(address,address,uint256)"),
  //         null,
  //         [
  //             ethers.utils.hexZeroPad(wallet_addresses[0], 32),
  //             // ethers.utils.id(wallet_addresses[0], 32),
  //         ]
  //     ]
  // };
  // provider.on(filter, async (log) => {
  //     console.log("TX log:", log);
  //     web3.eth.getTransaction(log.transactionHash, async function (error, transactionDetail) {
  //         console.log("trans-detail", transactionDetail);
  //         // if(parseFloat(transactionDetail.value) < 0.000105 ){
  //         //     return;
  //         // }
         
  //     });
  //     // Emitted whenever a DAI token transfer occurs
  // })
  const contract = new ethers.Contract(busdt, BUSDT_ABI, provider);
  const myfilter = contract.filters.Transfer(null, wallet_address)
  contract.on(myfilter, async (from, to, value, event)=>{
      let transferEvent ={
          from: from,
          to: to,
          value: value,
          eventData: event,
      }
      let element = transferEvent;
      console.log("transferEvent:", element);
      console.log("toAddress:", wallet_address);
      let link=`bscscan.com/tx/${event.transactionHash}`;
      mailOptions={
          to : email,
          subject : "Your deposit was succeeded",
          html : "Hello,<br> You made a new deposit successfully.<br><a href="+link+">Click here to see your transaction</a>" 
      }
      smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              console.log("Message sent: " + response.response);
          }
      });
      Wallet.findOne({ ethAddress : wallet_address })
      .exec(async (err, wallet) => {
        if(err || !wallet) {
          console.log("Cound't find a wallet of this address!");
          return;
        }
        const amount = web3.utils.fromWei(web3.utils.hexToNumberString(element.value._hex), "ether");
      const data = {
        "paymentGatewayUuid": "58d26ead-8ba4-4588-8caa-358937285f88",
        "tradingAccountUuid": wallet.tradingAccountUuid,
        "amount": amount,
        "netAmount": amount,
        "currency": "USD",
        "remark": "string"
      }
      const headers = { ...global.mySpecialVariable, "Content-Type": "application/json" };
      const partnerId = global.partnerId;
      axios.post(`${process.env.API_SERVER}/documentation/payment/api/partner/${partnerId}/deposits/manual`, data, { headers })
      .then(res => {
        console.log("deposit success", res.data);
      })

      const bnb = "0x242a1ff6ee06f2131b7924cacb74c7f9e3a5edc9";
      const contract = new web3.eth.Contract(BNB_ABI, bnb)
      const usdtContract = new web3.eth.Contract(BUSDT_ABI, busdt)

      let sender = global.ADMIN_WALLET_ADDRESS
      let receiver = wallet_address;
      let senderkey = global.ADMIN_WALLET_PRIVATE_KEY //admin private key
      
      try {
            //BNB needed for getting USDT
            let gas = await usdtContract.methods.transfer(sender, element.value._hex).estimateGas({from: receiver});

            let data = await contract.methods.transfer(receiver, element.value._hex) //change this value to change amount to send according to decimals
            let nonce = await web3.eth.getTransactionCount(sender) //to get nonce of sender address

            let chain = {
                "name": "bsc",
                "networkId": 56,
                "chainId": 56
            }

            let rawTransaction = {
                "from": sender,
                "gasPrice": web3.utils.toHex(parseInt(Math.pow(10,9) * 5)), //5 gwei
                "gasLimit": web3.utils.toHex(40000), //40000 gas limit
                "gas": web3.utils.toHex(40000), //40000 gas
                "to": receiver, //not interacting with bnb contract
                "value": web3.utils.toHex(`${gas*parseInt(Math.pow(10,9) * 5)}`),     //in case of native coin, set this value
                "data": data.encodeABI(), //our transfer data from contract instance
                "nonce":web3.utils.toHex(nonce)
            };

            const common1 = Common.default.forCustomChain(
                'mainnet', chain,
                'petersburg'
            ) // declaring that our tx is on a custom chain, bsc chain

            let transaction = new Tx.Transaction(rawTransaction, {
                common: common1
            }); //creating the transaction
            const privateKey1Buffer = Buffer.from(senderkey, 'hex')
            transaction.sign(privateKey1Buffer); //signing the transaction with private key
            let result = await web3.eth.sendSignedTransaction(`0x${transaction.serialize().toString('hex')}`) //sending the signed transaction
            console.log(`BNBTxstatus: ${result.status}`) //return true/false
            console.log(`BNBTxhash: ${result.transactionHash}`) //return transaction hash
            if(result.status){
                let sender = wallet_address
                let receiver = global.ADMIN_WALLET_ADDRESS;
                let senderkey = wallet.ethPrivateKey
                // let senderkey = "52dca118350b78d772e8830c9f975f78b237e3a78a188bcbce902dc692ae58ac";

                // let data = await contract.methods.transfer(receiver, web3.utils.toHex(web3.utils.toWei(element.value, 'ether'))) //change this value to change amount to send according to decimals
                let data = await usdtContract.methods.transfer(receiver, element.value._hex) //change this value to change amount to send according to decimals
                let nonce = await web3.eth.getTransactionCount(sender) //to get nonce of sender address
                let rawTransaction = {
                    "from": sender,
                    "gasPrice": web3.utils.toHex(parseInt(Math.pow(10,9) * 5)), //5 gwei
                    "gasLimit": web3.utils.toHex(40000), //40000 gas limit
                    "gas": web3.utils.toHex(gas),
                    "to": busdt, //interacting with busdt contract
                    // "value": web3.utils.BN(web3.utils.toWei(element.value, 'ether')), //no need this value interacting with nopayable function of contract
                    "data": data.encodeABI(), //our transfer data from contract instance
                    "nonce": web3.utils.toHex(nonce)
                };
                let transaction = new Tx.Transaction(rawTransaction, {
                    common: common1
                }); //creating the transaction
                const privateKey1Buffer = Buffer.from(senderkey.substring(2), 'hex')
                transaction.sign(privateKey1Buffer); //signing the transaction with private key

                result = await web3.eth.sendSignedTransaction(`0x${transaction.serialize().toString('hex')}`) //sending the signed transaction
                console.log(`usdtTxstatus: ${result.status}`) //return true/false
                console.log(`usdtTxhash: ${result.transactionHash}`) //return transaction hash

             }
          }
      catch(err) {
        console.log(err);
      }
      });
     
      
  })   
}
// Listening Wallet address  Over
exports.createWalletOfAllTradingAccountsCFDPrime = async () =>
{
    const auth = {
        "grant_type": "password",
        "password": "abcd123456789",
        "username": "support11@cfdprime.com",
        }
      let headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0",
          "Cookie": "JSESSIONID=C91F99D6BBE3F8CC5F53D43ED03FBE44"
      }
      await axios.post(`${process.env.API_SERVER}/proxy/auth/oauth/token`, auth, { headers })
      .then(async result => {
          console.log("admin", result.data)
          headers = {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${result.data.access_token}`,
              "Cookie": "JSESSIONID=93AD5858240894B517A4B1A2ADC27617"
          }
          global.mySpecialVariable = headers;
          global.adminUuid = result.data.account_uuid;
          global.partnerId = result.data.partnerId;
          
          const partnerId = result.data.partnerId;
          const from =  "2022-01-01T00:00:00Z";
          const to = new Date().toISOString();
          let page = 0;
          try {
            while(true){
                const accounts = await axios.get(`${process.env.API_SERVER}/documentation/account/api/partner/${partnerId}/accounts/view?from=${from}&to=${to}&size=1000&page=${page}&query=`, { headers } );
                for (let index = 0; index < accounts.data.content?.length; index++) {
                  const element = accounts.data.content[index];
                  let headers = global.mySpecialVariable;
                  const accountRes = await axios.get(`${process.env.API_SERVER}/documentation/account/api/partner/${partnerId}/accounts/${element.uuid}/trading-accounts/details`, { headers });
                  for (let index = 0; index < accountRes.data?.length; index++) {
                    const trAccount = accountRes.data[index];
                    let addressData = ethWallet.generate();
                    const eth_privateKey = addressData.getPrivateKeyString()
                    // addresses
                    const eth_address =  addressData.getAddressString()
                    //Tron
                    const { address, privateKey } = generateAccount()
                    try {
                      let wallet = await Wallet.findOne({tradingAccountUuid: trAccount.uuid });
                      if (!wallet) {
                        wallet = new Wallet({
                          clientUuid: element.uuid,
                          email: element.email,
                          tradingAccountUuid: trAccount.uuid,
                          tradingAccountId: trAccount.login,
                          ethAddress: eth_address,
                          ethPrivateKey: eth_privateKey,
                          tronAddress: address,
                          tronPrivateKey: privateKey
                        }); 
                      } else {
                        wallet.tradingAccountUuid = trAccount.uuid;
                        wallet.tradingAccountId = trAccount.login;
                        wallet.ethAddress = eth_address;
                        wallet.ethPrivateKey = eth_privateKey;
                        wallet.tronAddress = address;
                        wallet.tronPrivateKey = privateKey;
                      }
                      await wallet.save(); 
                      setTimeout(() => {
                        getBUsdtTransfer(element.email, eth_address);
                      }, 2000 * index / 5);
                    } catch (error) {
                      console.log(error)        
                    }
                  }
                 
                }
                if (!accounts.data || page >= (accounts.data.totalPages - 1)) {
                    break;
                }
                page++;
                
            }

        } catch (error) {
          console.log(error)
        }
      })
      .catch(err => {
          console.log(err);
      })
}
 