const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport( {
   
  host: "smtp-mail.outlook.com",
  port:587,
  auth:{
    user:"sks7065@outlook.com",
    pass:"sks@2018"

  },
  tls:{
    rejectUnauthorized:false
  }

})

// const options = {
//   from:"sks7065@outlook.com",
//   to:"sabarinathan@gigayasa.com",
//   subject:"Testing",
//   text:"testing"
// }

// transporter.sendMail(options, (err,info)=>{

//   if(err)
//   {console.log(err)
//   return 
  
//   }
//   console.log(info.response)
// })

module.exports = transporter