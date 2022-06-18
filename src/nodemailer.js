const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport( {
   
  host: "smtp-mail.outlook.com",
  port:587,
  auth:{
    user:"bwsim5gt22@gigayasa.com",
    pass:"bwsimgiga@2021"

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