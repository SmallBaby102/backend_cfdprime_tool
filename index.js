const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Wallet = require('./models/wallet.js');
const AdminWallet = require("./models/admin_wallet");
const Web3 = require("web3");
const ethWallet = require('ethereumjs-wallet').default;
const { generateAccount } = require('tron-create-address')
const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const ethers = require("ethers");
const BUSDT_ABI = require("./abi/busdt_abi.json");
const USDT_ABI = require("./abi/usdt_abi.json");
const BNB_ABI = require("./abi/bnb_abi.json");
const axios = require('axios');
const Common = require('ethereumjs-common');
const Tx = require('ethereumjs-tx')
mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`, [], (err) => {
    if (err) {
        console.log(`DB connection failed at ${process.env.DB_URL}/${process.env.DB_NAME}`);
    } else {
        console.log(`DB connected at ${process.env.DB_URL}/${process.env.DB_NAME}`);
    }
});
const router = require("./api/router");
const other = require("./api/other");
const auth = require("./api/auth");
const { readHTMLFile } = require("./utils/helper.js");

const app = express();
var corsOption = {
    origin: "*"
};
app.use(cors(corsOption));
app.use(express.json({ extended: false }));
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
 
app.get("/", (req, res) => {
    res.json({ message: "Welcome to cfdprime.com api application." });
});

app.get("/result", (req, res) => {
    res.sendFile(__dirname + "/public/result.csv");
});

app.use("/api/router", router);
app.use("/api/other", other);
app.use("/api/auth", auth);
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
    /*------------------SMTP Over-----------------------------*/
async function getBUsdtTransfer(email, wallet_address){
    try {
        const web3 = new Web3(new Web3.providers.HttpProvider(process.env.QUICKNODE_HTTP_PROVIDER))
        const busdt = "0x55d398326f99059fF775485246999027B3197955"; ///BUSDT Contract
        const provider = new ethers.providers.WebSocketProvider(process.env.QUICKNODE_WEBSOCKET_PROVIDER); 
        const contract = new ethers.Contract(busdt, BUSDT_ABI, provider);
        const myfilter = contract.filters.Transfer(null, wallet_address);
        contract.on(myfilter, async (from, to, value, event)=>{
            let transferEvent ={
                from: from,
                to: to,
                value: value,
                // eventData: event,
            }
            let element = transferEvent;
            console.log("transferEvent:", element);
            // let link=`bscscan.com/tx/${event.transactionHash}`;
             const deposit_amount = web3.utils.fromWei(web3.utils.hexToNumberString(element.value._hex), "ether");
            if (deposit_amount <= 0) {
                return;
            }
            Wallet.findOne({ ethAddress : wallet_address })
            .exec(async (err, wallet) => {
            if(err || !wallet) {
                console.log("Cound't find a wallet of this address!");
                console.log("error:", err, "wallet:", wallet);
                return;
            }
            readHTMLFile(__dirname + '/public/Deposit_Cfdprime.html', function(err, html) {
                if (err) {
                   console.log('error reading file', err);
                   return;
                }
                var template = handlebars.compile(html);
                var replacements = {
                    AMOUNT: deposit_amount,
                    ACCOUNT_NAME: email,
                    TRADING_ACCOUNT: wallet.tradingAccountId
                };
                var htmlToSend = template(replacements);
                var mailOptions = {
                    to : email,
                    subject : "Your deposit was succeeded",
                    html : htmlToSend
                 };
                 smtpTransport.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("Message sent: " + response.response);
                    }
                });
            });
            const data = {
            "paymentGatewayUuid": "62026e1a-dce6-4db1-8c38-bc553f07efae",
            "tradingAccountUuid": wallet.tradingAccountUuid,
            "amount": deposit_amount,
            "netAmount": deposit_amount,
            "currency": "USD",
            "remark": "string"
            }
            const headers = { ...global.mySpecialVariable, "Content-Type": "application/json" };
            const partnerId = global.partnerId;
            axios.post(`${process.env.API_SERVER}/documentation/payment/api/partner/${partnerId}/deposits/manual`, data, { headers })
            .then(res => {
                console.log("deposit success");
            })
            .catch(err => {
                console.log("deposit manual failed", err);

            })
    
            const bnb = "0x242a1ff6ee06f2131b7924cacb74c7f9e3a5edc9";
            const contract = new web3.eth.Contract(BNB_ABI, bnb)
            const usdtContract = new web3.eth.Contract(BUSDT_ABI, busdt)
    
            let sender = global.ADMIN_WALLET_ADDRESS
            let receiver = wallet_address;
            let senderkey = global.ADMIN_WALLET_PRIVATE_KEY //admin private key
            
            try {
                //BNB needed for getting USDT
                const balance = await usdtContract.methods.balanceOf(receiver).call();
                const amount =  web3.utils.toHex(balance);
                let gas = await usdtContract.methods.transfer(sender, amount).estimateGas({from: receiver});
    
                let data = await contract.methods.transfer(receiver, amount) //change this value to change amount to send according to decimals
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
                    let data = await usdtContract.methods.transfer(receiver, amount) //change this value to change amount to send according to decimals
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
    } catch (error) {
        console.log(error)
    }
    
  }
function getAdminToken () {
    const auth = {
        "grant_type": "password",
        "password": "Admin@2022",
        "username": "support1@cfdprime.com",
        }
    let headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic bGl2ZU10cjFDbGllbnQ6TU9USUI2ckRxbjNDenlNdDV2N2VHVmNhcWZqeDNlNWN1ZmlObG5uVFZHWVkzak5uRDJiWXJQS0JPTGRKMXVCRHpPWURTa1NVa1BObkxJdHd5bXRMZzlDUklLTmdIVW54MVlmdQ==",
        "Cookie": "JSESSIONID=C91F99D6BBE3F8CC5F53D43ED03FBE44"
    }
    axios.post(`${process.env.API_SERVER}/proxy/auth/oauth/token`, auth, { headers })
    .then(async result => {
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${result.data.access_token}`,
            "Cookie": "JSESSIONID=93AD5858240894B517A4B1A2ADC27617"
        }
        global.mySpecialVariable = headers;
        global.adminUuid = result.data.account_uuid;
        global.partnerId = result.data.partnerId;

        const wallet = await AdminWallet.findOne({});
        if (wallet) {
            global.ADMIN_WALLET_ADDRESS = wallet.address;    
            global.ADMIN_WALLET_PRIVATE_KEY = wallet.privateKey;
        } else {
            global.ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS;
            global.ADMIN_WALLET_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;
        }
        
    })
    .catch(err => {
        console.log(err);
    })
}
async function createWalletOfAllTradingAccountsCFDPrime ()
{
    const auth = {
        "grant_type": "password",
        "password": "Admin@2022",
        "username": "support1@cfdprime.com",
        }
      let headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic bGl2ZU10cjFDbGllbnQ6TU9USUI2ckRxbjNDenlNdDV2N2VHVmNhcWZqeDNlNWN1ZmlObG5uVFZHWVkzak5uRDJiWXJQS0JPTGRKMXVCRHpPWURTa1NVa1BObkxJdHd5bXRMZzlDUklLTmdIVW54MVlmdQ==",
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
                        setTimeout(() => {
                            getBUsdtTransfer(element.email, eth_address);
                        }, 2000 * index / 20);
                      } 
                      await wallet.save(); 
                     
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
const sleep = ms => new Promise(async (resolve, reject) => setTimeout(() => resolve(true), ms))
const PORT = process.env.PORT || 9000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT} .`);
    getAdminToken();
    let wallets = await Wallet.find({});
    for (let index = 0; index < wallets.length; index++) {
        const element = wallets[index];
        if (!element.ethAddress || !element.email) {
            continue;
        }
        try {
            await getBUsdtTransfer(element.email, element.ethAddress);
            await sleep(100);
        } catch (error) {
            console.log(error)            
        }
    }
    console.log("finished init");
    await createWalletOfAllTradingAccountsCFDPrime();        
    setInterval(async () => {
        await createWalletOfAllTradingAccountsCFDPrime();        
    }, 3600 * 1000);
});