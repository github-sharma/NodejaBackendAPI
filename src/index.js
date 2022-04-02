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


  //text:"testing1"
  // const LicenseData1 = LicenseData(
  //   {
  //     License_key:'kriggykriggykriggykr',
  //     Allocated:true,
  //     Validity:180

  //   }
  
 // console.log(LicenseData1)

 

  //  LicenseData1.save().then(()=>{
  //    console.log("Congrats!Registration Successful.")}).catch((e)=>{
  //      console.log("Sorry,registration failed.Please try again.")})

//  LicenseData.findOne({License_key:'qwertyiopqwertyuiop'}).then((data)=>{
//    console.log(data)
//  }).catch((e)=>{
//    console.log(e)
//  })

//  const data =  LicenseData.findOne({License_key:'12345678901234567890'})
//  console.log(data.License_key)

const date1 = new Date()
 const date2 = new Date()

 //console.log(date1)
 //console.log(date2)
 //console.log(date1-date2)


 

// transporter.sendMail(options, (err,info)=>{

//   if(err)
//   {console.log(err)
//   return 
  
//   }
//   console.log(info.response)
// })

const router = new express.Router()

//console.log(new Date())

// const mongoose = require('mongoose')
// const { default: isEmail } = require('validator/lib/isEmail')

// const userData = mongoose.model('userDatas', {


//   name:{
//     type:String,
//     required:true,
//     trim: true
//   },
//   eMail:{
//     type:String,
//     required:true,
//     trim:true,
//     lowercase:true,
//     validate(value){
//       if (!isEmail(value))
//       { throw new error('email is inValid')}
//     }
//   },
//   DoL:{
//     type: Date,
//     required: true,
//     trim: true
//   },

//   unique_id:{
//       type:Number
//   }

// }) 


const app = express()

app.use(express.json())


// app.get('/getdata',async (req,res)=>{

//  await userData.findOne({License_key: req.body.License_key
//   }).then((user)=>{res.send(user)}).catch((e)=>{res.send("error")})
// }
//)

//cheking if username is available while user enters userName
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
   await LicenseData.findOneAndUpdate({License_key:req.body.Lecense_key},
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


app.post('/user_install1',  async (req,res)=>{

  if(req.body.License_key === undefined || req.body.License_key.length !== 20)
  {
    res.status(403).send("License Error!")
  }

  else if(req.body.userName === undefined || req.body.eMail === undefined || req.body.UUID === undefined || req.body.password === undefined )
  {
    res.status(403).send("Error!")
  }
else
{
  
 await LicenseData.findOne({License_key:req.body.License_key}).then(async (data)=>{
  
  if(data===null ){res.status(403).send("License Error.")}
  else if(!data.Allocated){res.status(403).send("License Error.")}
  else if(data.Inactive!= undefined && !data.Inactive){res.status(403).send("License Error.")}
  else if(data.Inactive && date.subtract(new Date(),data.dateInst).toDays()>data.Days){res.status(403).send("License Error.")}

  else if(data.Inactive === true ){

    await LicenseData.findOneAndUpdate(
    {License_key:req.body.License_key }, 
    {$set: 
    { 
       Inactive:false,
       dateLastUse:new Date()
    }
  },
  {new:true}

).then(async (data)=>{
  await userData.findOneAndUpdate(
    {userName:req.body.userName},
    { $set: 
      { 
         UUID:req.body.UUID,
         Inactive:false,
         dateInst:data.dateInst,
         dateLastUse:new Date(),
         License_key:data.Lecense_key,
         Validity:data.Validity



         
      }
    },
    {new:true}

    ).then((data2)=>{
      res.send({
        License_key:data2.Lecense_key,
        dateInst:data2.dateInst,
        Validity:data2.Validity,
        Inactive:false,
        userName:data2.userName,
        eMail:data2.eMail,
        UUID:data2.UUID,
        dateLastUse:data2.dateLastUse



      })

    }).catch((e)=>{



      res.status(503).send("Sorry,Server Unvailable.")



  })

}).catch((e)=>{res.status(503).send("Sorry,Server Unavailable")

})


    
}

  else
  {
    await LicenseData.findOneAndUpdate
    (
      { License_key:req.body.License_key }, 
      { $set: 
        { 
           Inactive:false,
           dateInst:new Date(),
           dateLastUse:new Date()
        }
      },
      {new:true}
   
    ).then(async (data)=>{
      await userData.findOneAndUpdate(
        {userName:req.body.userName},
        { $set: 
          { 
            License_key:data.Lecense_key,
            dateInst:data.dateInst,
            Validity:data.Validity,
            Inactive:false,
            userName:data2.userName,
            eMail:data2.eMail,
            UUID:data2.UUID,
            dateLastUse:data2.dateLastUse
          }
        },
        {new:true}

        ).then((data2)=>{
          res.send({
            License_key:data2.Lecense_key,
            dateInst:data2.dateInst,
            Validity:data2.Validity,
            Inactive:false,
            userName:data2.userName,
            eMail:data2.eMail,
            UUID:data2.UUID,
            dateLastUse:data2.dateLastUse



          })

        }).catch((e)=>{res.status(503).send("Sorry,Server Unvailable.")})

    }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable")

    })
   
    
  }  


  




}).catch((e)=>{
  res.status(503).send("Sorry.Server Unavailable.")
})

}



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
      
      // else if(data.Inactive=== true)
      //   {
      //     const uri = 'mongodb+srv://GigaYasa:GigaYasa@cluster0.07hd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

      //     const client = await new MongoClient.connect(uri)
        
        
      //   const session = client.startSession()
      //   const transactionOptions ={
      //     readPreference:'primary',
      //     readConcern:{level: 'local'},
      //     writeConcern:{w:'majority'}
      //   }
      
      // try{
      //   await session.withTransaction(async ()=>{
        
      //     await LicenseData.findOneAndUpdate(
      //       {License_key:req.body.License_key }, 
      //       {$set: 
      //       { 
      //          Inactive:false,
      //          dateLastUse:new Date()
      //       }
      //     },
      //     {new:true},
      //     { session }
        
      //   ).then(async (data)=>{
      //     await userData.findOneAndUpdate(
      //       {userName:req.body.userName},
      //       { $set: 
      //         { 
      //            UUID:req.body.UUID,
      //            Inactive:false,
      //            dateInst:data.dateInst,
      //            dateLastUse:new Date(),
      //            License_key:data.Lecense_key,
      //            Validity:data.Validity
        
        
        
                 
      //         }
      //       },
      //       {new:true},
      //       { session }
        
      //       ).then(async (data2)=>{
      //        await res.send({
      //           License_key:data2.Lecense_key,
      //           dateInst:data2.dateInst,
      //           Validity:data2.Validity,
      //           Inactive:false,
      //           userName:data2.userName,
      //           eMail:data2.eMail,
      //           UUID:data2.UUID,
      //           dateLastUse:data2.dateLastUse
        
        
        
      //         })
        
      //       }).catch(async (e)=>{
        
      //    await  res.status(503).send("Sorry,Server Unavailable.")
      //      await session.abortTransaction()
      //      return})
        
      //   }).catch((e)=>{
      //   res.status(503).send("Sorry,Server Unavailable.") })
      //   },transactionOptions)
      // }
      // finally{

      //   await session.endSession()
      // }  
        

      // } 
      
else if(data.Inactive=== true){
  const uri = 'mongodb+srv://GigaYasa:GigaYasa@cluster0.07hd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

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
  const uri = 'mongodb+srv://GigaYasa:GigaYasa@cluster0.07hd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

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
 

  

app.post('/userinstall2', async (req,res)=>{
 // console.log(req.body.userName)
  
  if(req.body.License_key === undefined || req.body.License_key.length !== 20)
  {
    res.status(403).send("License Error!")
  }
  else if(req.body.userName === undefined || req.body.eMail === undefined || req.body.UUID === undefined || req.body.password === undefined )
  {
    res.status(403).send("Error!")
  }
 else
  {
   userData1 = userData(req.body)
   userData1.dateInst= new Date()
   userData1.dateLastUse = new Date()
   userData1.password = await bcrypt.hash(userData1.password , 8)
   const user1 = await userData.findOne({ License_key:req.body.License_key })
   //const user2 = await userData.findOne({ userName:req.body.userName })
   if(user1 && user1.Inactive === false)
     { 
       res.status(400).send("License Error!")
     }
  
   else if(user1 && user1.Inactive === true)
    {

        const user10 =await userData.findOne({License_key:req.body.License_key})


       //  if(user2){
       //    res.status(400).send("userName is not available!")
       //  }
       //  else{
       //req.body.dateInst = user1.dateInst
       // userData1.dateInst = user1.dateInst
       // await userData.deleteOne({ License_key:req.body.License_key })
        // await userData1.save().then(()=>{
        //       res.send(userData1)}).catch((e)=>{
         //        res.status(400).send(e)})
      if(user10.userName !== req.body.userName)
      {
         const user6 = await userData.findOneAndDelete({userName:req.body.userName})
       if(user6)
       {
         const user5 = await userData.findOneAndUpdate
         (
           { License_key:req.body.License_key }, 
           { $set: 
             { 
     
               eMail:req.body.eMail,
                password:userData1.password,
                UUID:req.body.UUID,
                userName:req.body.userName,
                Inactive:false,
               License_key:user1.License_key,
                dateLastUse: new Date(),
                dateInst:user1.dateInst
             }
           },
           {new:true}
          )
   
         if(!user5)
           {
              res.status(503).send("Sorry,Please try again.")
           }
          else
           {
              res.status(200).send(user5)
           }
       }

       else 
       {
          (res.status(503).send("Sorry,Please try again."))
       }
      } 
      else
      {
        const user5 = await userData.findOneAndUpdate
         (
           { License_key:userData1.License_key }, 
           { $set: 
             { 
     
               eMail:req.body.eMail,
                password:userData1.password,
                UUID:req.body.UUID,
                Inactive:false,
                dateLastUse: new Date(),
                dateInst:user1.dateInst
             }
           },
           {new:true}
          )
          if(!user5)
          {
             res.status(503).send("Sorry,Please try again.")
          }
         else
          {
             res.status(200).send(user5)
          }
   

      }
    }
    
   else
     {
          //  if(user2){
          //   res.status(400).send("userName is not available!")
          // }
          // else{
          // await userData1.save().then(()=>{
          //   res.send(userData1)}).catch((e)=>{
         //     res.status(503).send("Sorry,installation failed.Please try again.")})
          const user =await userData.findOneAndUpdate
            (
               {userName:req.body.userName},
               {$set:
                  {
                    
     
                      eMail:req.body.eMail,
                       password:userData1.password,
                       UUID:req.body.UUID,
                       Inactive:false,
                      License_key:req.body.License_key,
                       dateLastUse: new Date(),
                       dateInst:new Date()
                    
                  }
               },  
               {new:true}
            )
           if(!user)
            {
                res.status(503).send("Sorry,Please Try Again.")
            }  
          else
            {
                res.status(200).send(user)
            }


      }
  }
 
  //res.send('testing')
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


          const uri = 'mongodb+srv://GigaYasa:GigaYasa@cluster0.07hd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

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

        //  userData.findOneAndUpdate(
        //    {userName:req.body.userName},
        //    {$set:
        //      {
        //        Inactive:true,
        //      }
        //    },
        //    {new:true}
        //    ).then((data)=>{
        //      LicenseData.findOneAndUpdate({License_key:data.License_key},
        //       {$set:
        //         {
        //           dateLastUse:new Date(),
        //           Inactive:true
        //         }
        //      }
        //       ).then((data)=>{res.send("Uninstalled Successfully.")}).catch((e)=>{res.status(503).send("Sorry,server Unavailable.")})
        //    }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})










        }

      }
    }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})

 
  }

   


})



app.post('/user_data/login' , async (req , res)=>{

  if(req.body.userName ===undefined || req.body.password ===undefined || req.body.UUID ===undefined )
  {res.status(403).send("Error!")}

//  console.log(req.body.eMail )
//  res.send(req.body.eMail)
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
           res.status(200).send(data)
         }
       }
     }
   }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})

 }

})

app.get('/user_forgotpass' ,async (req,res)=>{

  if(req.body.eMail === undefined ){res.status(403).send("Error!")}
  else{

//  //password = await bcrypt.hash(req.body.password, 8)
//  //console.log(password)
//  //password = req.body.password
//  //req.body.dateLastUse = await Date.now
//  //let { password, dateLastUse } = req.body
  await userData.findOne({ eMail:req.body.eMail }).then(async (data)=>{ 

  if(data===null){res.status(403).send("Invalid eMail.")}
  else
  {
    const options = {
      from:"bwsim5gt22@gigayasa.com",
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
  await userName.findOne({eMail:req.body.eMail}).then(async (data)=>{
    const isMatch = await bcrypt.compare(req.body.password , data.password)
   if(data===null){res.status(403).send("Invalid Credentials.")}
   else if(req.body.userName !=data.userName){res.status(403).send("Invalid Credentials.")}
   
  

   else if(!isMatch){res.status(403).send("Invalid OTP")}
   else{
     res.status(200).send("OTP matches")
   }

  }).catch((e)=>{res.status(503).send("Sorry,Server Unavailable.")})
}


})

// app.post('/userDatas',(req,res)=>
// {
  //  const userData1 = new userData({

  //   name:'Sachin',
  //   eMail:'sachin.k.sharma99@gmail.com',
  //   DoL:'23/02/2022',
  //   unique_id:'123456'
  //  })

//   userData.save().then(()=>{ res.send(userData)}).catch((e)=>{
//     res.status(400).send(e)
//   })
// }
// )
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


//sending results to users email


const uploads = multer({})
app.post('/send_results',uploads.single('Report'),async (req,res)=>{

  if(req.body.eMail === undefined || req.file === undefined ){res.status(403).send("Error!")}
  else{

  const options = {
    from:"bwsim5gt22@gigayasa.com",
    to:req.body.eMail,
    subject:"Your Simulation Results!",
    attachments:{
      filename:'Results.zip',
      content:req.file.buffer
    }
    
  }
  
 await transporter.sendMail(options, (err,info)=>{
  
    if(err){
   // console.log(err)
    res.status(503).send("Sorry,Service Unavailable at this moment.")
    console.log(err)
    return 
    
    }
    res.status(200).send("Successful! Check your eMail.")
  })
}
}
 


)




const port = process.env.PORT || 3000

 app.listen(port,()=>{console.log('server is up and running' + port)})
