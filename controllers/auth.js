const config = require("../config/auth");
const Admin = require("../models/admin");
const axios = require("axios"); 
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/


exports.adminSignup = (req, res) => {
  try {
    console.log("req.body", req.body)
    let admin = new Admin({
      fullname: req.body.fullname,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });
  
    admin.save((err, admin) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send("Admin was registered successfully.");
    });
  } catch (error) {
    res.status(500).send("Admin register failed.");
    
  }

};
exports.adminSignin = (req, res) => {
 
  Admin.findOne({
    email: req.body.email
  })
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ email: req.body.email }, config.secret, {
        expiresIn: 3599 // 1 hours
      });
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
      let email =req.body.email;
      axios.post(`${process.env.API_SERVER}/proxy/auth/oauth/token`, auth, { headers })
      .then(result => {
        console.log("admin", result.data)
          headers = {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": `Bearer ${result.data.access_token}`,
              "Cookie": "JSESSIONID=93AD5858240894B517A4B1A2ADC27617"
          }
          global.mySpecialVariable = headers;
          global.adminUuid = result.data.account_uuid;
          global.partnerId = result.data.partnerId;
          res.status(200).send({
            ...user._doc,
            accessToken: token,
          });
      })
      .catch(e => {
        console.log(e);
        res.status(500).send({
          message: "Admin signin error"
        });
      })

    });
};
