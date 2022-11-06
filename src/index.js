const express = require('express')
const {MongoClient} = require('mongodb')
const bcrypt = require('bcryptjs')
require('./db/mongoose.js')
const date = require('date-and-time')
const LicenseData = require('./models/License.js')
const userData = require('./models/users.js')
const transporter =require('./nodemailer.js')
const { findOne, findOneAndDelete } = require('./models/users.js')
//const { AggregationCursor } = require('mongodb')
const multer = require('multer')
const { default: mongoose } = require('mongoose')


const date1 = new Date()
const date2 = new Date()



const router = new express.Router()


const app = express()

app.use(express.json())


app.post('/CreateLicenseFile', async (req,res)=>{
 
 if(req.body.Allocated===undefined || req.body.Validity===undefined || req.body.License_key===undefined ){res.status(403).send("Insufficient Information.")}
 else if(req.body.License_key.length !=20){res.status(403).send("Invalid License_key")}
 else{ 
     LicenseData.findOne({License_key:req.body.License_key}).then(async (data)=>{
       if(data!=null){res.status(403).send("License file already present.")}
       else{
        const LicenseData1 = LicenseData(req.body)
        await LicenseData1.save().then((data)=>{res.send(data)}).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})
       }
     }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})
   }
})

app.post('/UpdateLicenseFile', async (req,res)=>{
  if(req.body.Allocated===undefined || req.body.Validity===undefined || req.body.License_key===undefined ){res.status(403).send("Error")}
  else if(req.body.License_key.length !=20){res.status(403).send("Invalid License_key")}
  else{
    await LicenseData.findOne({License_key:req.body.License_key}).then((data)=>{
      if(data===null){res.status(403).send("License Error!")}
    }).catch((e)=>{
      res.status(503).send("Sorry,Server Unavailable.")
    })
   await LicenseData.findOneAndUpdate({License_key:req.body.License_key},
      {$set:{
        Allocated:req.body.Allocated,
        Validity:req.body.Validity

      }
     
      }, {new:true}).then((data)=>{res.send(data)}).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})
  }
})



app.post('/userName_availabilitycheck' , async (req,res)=>{

  if(req.body.userName === undefined ){ res.status(403).send("Error!")}
  else{
    await userData.findOne({userName:req.body.userName}).then((data)=>{

      if(data===null){res.status(200).send("userName Available.")}
      else{
        res.status(403).send("userName Unavailable.")
      }
    }).catch(()=>{res.status(503).send("Sorry,Server Unavailable.")})
  }
})

//checking if Email id is not used already

app.post('/Email_availabilitycheck' , async (req,res)=>{

  if(req.body.eMail === undefined ){ res.status(403).send("Error!")}
  else{
    await userData.findOne({eMail:req.body.eMail}).then((data)=>{

      if(data===null){res.status(200).send("new user email")}
      else{
        res.status(403).send("eMail already exist!")
      }
    }).catch(()=>{res.status(503).send("Sorry,Server Unavailable")})
  }
})


//checking if user is registered while logging in

app.post('/login' , async (req,res)=>{
   
  if(req.body.userName === undefined || req.body.password === undefined ){res.status(403).send("Error!")}
  else
   {
     userData.findOne({userName:req.body.userName}).then(async (data)=>{

      if(data===null){res.status(403).send("Invalid Information.")}

      else{

        const isMatch = await bcrypt.compare(req.body.password , data.password)
        if(!isMatch){
        res.status(403).send("Invalid Information.")}
        else{
          if(data.Inactive===undefined || data.Inactive === true){res.send(data)}
          else{
            res.status(403).send(data)
          }
        }

      }
     }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})

   }

  })


//registering the new user
app.post('/register_user',async (req,res)=>{
  if(req.body.userName === undefined || req.body.password === undefined || req.body.eMail === undefined ){res.status(403).send("Error!")}
  else{
   await userData.findOne({userName:req.body.userName}).then(async (data)=>{
      if(data !=null){res.status(403).send("userName Unavailable.")}
      else{
        await userData.findOne({eMail:req.body.eMail}).then((data)=>{
          if(data!=null){res.status(403).send("Email already exist.")}
        }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable")})
      }
    }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})
 }
 const userData1 = userData(req.body)
 userData1.password = await bcrypt.hash(req.body.password , 8)

 await userData1.save().then((data)=>{res.status(200).send("Registration Successful!")}).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})

})



app.post('/user_install',async(req,res)=>{

  if(req.body.License_key === undefined || req.body.License_key.length !== 20)
  {
    res.status(403).send("License Error!")
  }

  else if(req.body.userName === undefined || req.body.eMail === undefined || req.body.UUID === undefined || req.body.password === undefined )
  {
    res.status(403).send("Error!")
  }

  else{
    await LicenseData.findOne({License_key:req.body.License_key}).then(async (data)=>{
  
      if(data===null ){res.status(403).send("License Error.")}
      else if(!data.Allocated){res.status(403).send("License Error.")}
      else if(data.Inactive!= undefined && !data.Inactive){res.status(403).send("License Error.")}
      else if(data.Inactive=== true && date.subtract(new Date(),data.dateInst).toDays()>data.Days){res.status(403).send("License Error.")}
      

      
else if(data.Inactive=== true){
  const uri = '#################################################################'
  const client = await MongoClient.connect(uri)
  const LicenseData1 = client.db("myFirstDatabase").collection("licensekeydatas")
  const userData1 = client.db("myFirstDatabase").collection("userdatas")
  
        



  const session = client.startSession()
  const transactionOptions ={
    readPreference:'primary',
    readConcern:{level: 'local'},
    writeConcern:{w:'majority'}
  }

try{
  await session.withTransaction(async ()=>{
  
    await LicenseData1.findOneAndUpdate(
      {License_key:req.body.License_key }, 
      {$set: 
      { 
         Inactive:false,
         dateLastUse:new Date(),
        
      }
    },
    
   
    {returnDocument:"after"},
    { session }
  
  ).then(async (data)=>{
    await userData1.findOneAndUpdate(
      {userName:req.body.userName},
      { $set: 
        { 
           UUID:req.body.UUID,
           Inactive:false,
           dateInst:data.value.dateInst,
           dateLastUse:new Date(),
           License_key:data.value.License_key,
           Validity:data.value.Validity
  
  
  
           
        }
      },
      { returnDocument:"after"},
      { session }
  
      ).then(async (data2)=>{
       await res.send({
          License_key:data2.value.License_key,
          dateInst:data2.value.dateInst,
          Validity:data2.value.Validity,
          Inactive:false,
          userName:data2.value.userName,
          eMail:data2.value.eMail,
          UUID:data2.value.UUID,
          dateLastUse:data2.value.dateLastUse
        })
  
      }).catch(async (e)=>{
  
     await res.status(503).send("Sorry,Server Unavailable1 .")
     await session.abortTransaction()
     return})
  
  
  
  
      




  }).catch(async (e)=>{
  await res.status(503).send("Sorry,Server Unavailable 2.")})
},transactionOptions)}

finally{

  await session.endSession()
}
}


else
{
  const uri = '#################################################################'
  const client = await MongoClient.connect(uri)
  const LicenseData1 = client.db("myFirstDatabase").collection("licensekeydatas")
  const userData1 = client.db("myFirstDatabase").collection("userdatas")
  
        



  const session = client.startSession()
  const transactionOptions ={
    readPreference:'primary',
    readConcern:{level: 'local'},
    writeConcern:{w:'majority'}
  }

try{
  await session.withTransaction(async ()=>{
  
    await LicenseData1.findOneAndUpdate(
      {License_key:req.body.License_key }, 
      {$set: 
      { 
         Inactive:false,
         dateLastUse:new Date(),
         dateInst:new Date()
      }
    },
    
   
    {returnDocument:"after"},
    { session }
  
  ).then(async (data)=>{
    await userData1.findOneAndUpdate(
      {userName:req.body.userName},
      { $set: 
        { 
           UUID:req.body.UUID,
           Inactive:false,
           dateInst:data.value.dateInst,
           dateLastUse:new Date(),
           License_key:data.value.License_key,
           Validity:data.value.Validity
  
  
  
           
        }
      },
      { returnDocument:"after"},
      { session }
  
      ).then(async (data2)=>{
       await res.send({
          License_key:data2.value.License_key,
          dateInst:data2.value.dateInst,
          Validity:data2.value.Validity,
          Inactive:false,
          userName:data2.value.userName,
          eMail:data2.value.eMail,
          UUID:data2.value.UUID,
          dateLastUse:data2.value.dateLastUse
        })
  
      }).catch(async (e)=>{
  
     await res.status(503).send("Sorry,Server Unavailable")
     await session.abortTransaction()
     return})


  }).catch(async (e)=>{
  await res.status(503).send("Sorry,Server Unavailable")})
},transactionOptions)}

finally{

  await session.endSession()
}
}
})
}
})
 



app.post('/user_uninstall' ,async (req,res)=>{

  if(req.body.userName===undefined || req.body.password === undefined ) {res.status(403).send("Error!")}
  else{
   await userData.findOne({userName:req.body.userName}).then(async (data)=>{
      if(data===null){res.status(403).send("userName or password invalid.")}
      else{
        const isMatch = await bcrypt.compare(req.body.password , data.password)
        if(!isMatch){res.status(403).send("userName or password invalid")}
        else{


          const uri = '#################################################################'

          const client = await MongoClient.connect(uri)
          const LicenseData1 = client.db("myFirstDatabase").collection("licensekeydatas")
          const userData1 = client.db("myFirstDatabase").collection("userdatas")
  
        



       const session = client.startSession()
       const transactionOptions ={
       readPreference:'primary',
       readConcern:{level: 'local'},
       writeConcern:{w:'majority'}
      }

try{
  await session.withTransaction(async ()=>{
  
    await userData1.findOneAndUpdate(
      {userName:req.body.userName}, 
      {$set: 
      { 
         Inactive:true,
         dateLastUse:new Date(),
        
      }
    },
    
   
    {returnDocument:"after"},
    { session }
  
  ).then(async (data)=>{
    await LicenseData1.findOneAndUpdate(
      {License_key:data.value.License_key},
      { $set: 
        { 
         
           Inactive:true,
           dateLastUse:new Date(),
          
                   
        }
      },
      { returnDocument:"after"},
      { session }
  
      ).then(async (data2)=>{
       await res.status(200).send(data.value)
  
      }).catch(async (e)=>{
  
     await res.status(503).send("Sorry,Server Unavailable")
     await session.abortTransaction()
     return})


  }).catch(async (e)=>{
  await res.status(503).send("Sorry,Server Unavailable")})
},transactionOptions)}

finally{

  await session.endSession()
}



     }

     }
    }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})

 
  }

})



app.post('/user_data/login' , async (req , res)=>{

  if(req.body.userName ===undefined || req.body.password ===undefined || req.body.UUID ===undefined )
  {res.status(403).send("Error!")}

 else{
  await userData.findOne({userName:req.body.userName}).then((data)=>{
     if(data===null)res.status(403).send("userName or password incorrect.")
     else{
       const isMatch = bcrypt.compare(req.body.password,data.password)
       if(!isMatch){res.status(403).send("userName or password incorrect.")}
       else if(data.Inactive===true){res.status(403).send("Please Install Again.")}
       else{
         if(req.body.UUID!=data.UUID){res.status(403).send("Invalid Credentials.")}
         else{
           res.status(200).send(
           {
            License_key:data.License_key,
            dateInst:data.dateInst,
            Validity:data.Validity,
            Inactive:false,
            userName:data.userName,
            eMail:data.eMail,
            UUID:data.UUID,
            dateLastUse:new Date()
           }
           )
         }
       }
     }
   }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})

 }

})

app.get('/user_forgotpass' ,async (req,res)=>{

  if(req.body.eMail === undefined ){res.status(403).send("Error!")}
  else{

  await userData.findOne({ eMail:req.body.eMail }).then(async (data)=>{ 

  if(data===null){res.status(403).send("Invalid eMail.")}
  else
  {
    const options = {
      from:"#######################################",
      to:req.body.eMail,
      subject:"OTP to reset your BWSIM password",
      text: "Use this OTP and reset your password.  OTP:  "+ data.password+ " Your userName is "+data.userName
    }
    
   await transporter.sendMail(options, (err,info)=>{
    
      if(err){

      res.status(503).send("Sorry,Service Unavailable at this moment.")
      return 
      }
      else{
      res.status(200).send("Successful! Check your eMail")}
    })

  }
 }).catch((e)=>{res.status(503).send("Sorry, Server Unavailable")})

 

  }

})


app.post('/confirm_otp',async (req,res)=>{

if(req.body.userName === undefined || req.body.eMail === undefined || req.body.OTP === undefined ){res.status(403).send("Error.")}
else {
  await userData.findOne({eMail:req.body.eMail}).then(async (data)=>{
    
    if(data===null){res.status(403).send("Invalid Credentials.")}
   
   
   else if(req.body.userName !=data.userName){res.status(403).send("Invalid Credentials.")}
  
   else if(!(req.body.OTP===data.password)){res.status(403).send("Invalid OTP.")}
   
  

  
   else{
     res.status(200).send("OTP matches")
   }

  }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})
}


})


app.patch('/user_updatepass' , async (req,res)=>
{
  if(req.body.userName === undefined || req.body.password ===undefined)
  {res.status(403).send("Error!")}
  else{
   const password1 = await bcrypt.hash(req.body.password , 8)
   await userData.findOneAndUpdate({userName:req.body.userName},
      {$set:
        {
          password:password1

        }
      },
      {new:true}
      ).then((data)=>{res.status(200).send("Password updated successfully.")}).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})
  }
})





const uploads = multer({})

app.post('/send_results',uploads.single('Report'),async (req,res)=>{

  if(req.body.eMail === undefined || req.file === undefined || req.body.message === undefined ){res.status(403).send("Error!")}
  else{
  
  
  const options = {
    from:"############################################",

  
    to:req.body.eMail,
    subject:"Your Simulation Results",
    html:"Greetings," + "<br>"+req.body.message,   
    attachments:{
    filename: "Report.zip",
    content:req.file.buffer
  }
  }
  await transporter.sendMail(options, (err,info)=>{
  if(err){
    res.status(503).send("Sorry,Service Unavailable at this moment.")
    console.log(err)
    return 
    }
    res.status(200).send("Successful! Check your eMail.")
  })
}}
)

const uploadss = multer({})

app.post('/send_issue_pic',uploadss.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 3 }]),async (req,res)=>{

  if(req.body.email === undefined || req.body.username === undefined || req.body.type === undefined || req.body.description === undefined || req.body.subject === undefined || req.files['gallery'] === undefined )
  {res.status(403).send("Error!")}
  else{
  
  var options = {}
  if(req.files['gallery'].length === 1){
  options = {
    from:"#################################",


    to:"################################",
    subject:req.body.subject,
    html:"<b>username    :</b>"+ req.body.username +"<br><b>Email       :</b>"+req.body.email + "<br><b>DateOfReport:</b>"+new Date()+ "<br><b>Type         :</b>"+req.body.type+"<br><b>Description :</b>"+req.body.description+"",

    attachments:[{
    // filename:"att.jpg",
    content:req.files['gallery'][0].buffer
  }]
}
}

if(req.files['gallery'].length === 2){
options = {
  from:"#####################################",

  // to:req.body.eMail1 + ","+req.body.eMail2,


  to:"#####################################",
  subject:req.body.subject,
  html:"<b>username    :</b>"+ req.body.username +"<br><b>Email       :</b>"+req.body.email + "<br><b>DateOfReport:</b>"+new Date()+ "<br><b>Type         :</b>"+req.body.type+"<br><b>Description :</b>"+req.body.description+"",
 
  attachments:[{
  // filename:"att.jpg",
  content:req.files['gallery'][0].buffer
},
{
  content:req.files['gallery'][1].buffer
}]
}
}


if(req.files['gallery'].length === 3){
options = {
  from:"######################################",

  // to:req.body.eMail1 + ","+req.body.eMail2,


  to:"########################################",
  subject:req.body.subject,
  html:"<b>username    :</b>"+ req.body.username +"<br><b>Email       :</b>"+req.body.email + "<br><b>DateOfReport:</b>"+new Date()+ "<br><b>Type         :</b>"+req.body.type+"<br><b>Description :</b>"+req.body.description+"",

  attachments:[{
  // filename:"att.jpg",
  content:req.files['gallery'][0].buffer
},
{
  content:req.files['gallery'][1].buffer
},

{
  content:req.files['gallery'][2].buffer
}]
}
}



  await transporter.sendMail(options, (err,info)=>{
  if(err){
    res.status(503).send("Sorry,Service Unavailable at this moment.")
    console.log(err)
    return 
    }
    res.status(200).send("Successful! Check your eMail.")
  })
}}
)


app.post('/send_issue',async (req,res)=>{

  if(req.body.email === undefined || req.body.username === undefined || req.body.type === undefined || req.body.description === undefined || req.body.subject === undefined ){res.status(403).send("Error!")}
  else{
  const options = {
    from:"##############################",
    to:"#########################################",
    subject:req.body.subject,
  
    // 
    html:"<b>username    :</b>"+ req.body.username +"<br><b>Email       :</b>"+req.body.email + "<br><b>DateOfReport:</b>"+new Date()+ "<br><b>Type         :</b>"+req.body.type+"<br><b>Description :</b>"+req.body.descrition+""
    }
   await transporter.sendMail(options, (err,info)=>{
    if(err){
    res.status(503).send("Sorry,Service Unavailable at this moment.")
    console.log(err)
    return 
    }
    res.status(200).send("Successful! Check your eMail.")
  })
}}
)




const port = process.env.PORT || 3000

app.listen(port,()=>{console.log('server is up and running' + port)})
