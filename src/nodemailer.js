const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport( {
   
  host: "smtp-mail.outlook.com",
  port:587,
  auth:{
    user:"##################",
    pass:"###################"

  },
  tls:{
    rejectUnauthorized:false
  }

})


module.exports = transporter