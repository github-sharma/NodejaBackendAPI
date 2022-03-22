const express = require('express')
const bcrypt = require('bcryptjs')
require('./db/mongoose.js')
const date = require('date-and-time')
const userData = require('./models/users.js')
const transporter =require('./nodemailer.js')
const { findOne, findOneAndDelete } = require('./models/users.js')
//const { AggregationCursor } = require('mongodb')
const multer = require('multer')


//   text:"testing1" 
// }

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

//cheking if username is available while user enters userName

app.post('/userName_availabilitycheck' , async (req,res)=>{

  if(req.body.userName === undefined ){ res.status(403).send("Error!")}
  else{
  const user =await  userData.findOne({userName:req.body.userName})
  if(user)
  {res.send("userName unavailable.")}
  else
  {
    res.status(200).send("userName available!")
  }}
})


//checking if user is registered while logging in

app.post('/login' , async (req,res)=>{
   if(req.body.userName === undefined){res.status(403).send("Error!")}
  else
 { const user =await userData.findOne({userName:req.body.userName})

  if(!user)
  {
    res.status(403).send("user is not registered.")
  }
  else
  {
    res.status(200).send("Logged in successfully!")
  }}
})


//registering the new user
app.post('/register_user',async (req,res)=>{
  if(req.body.userName === undefined){res.status(403).send("Error!")}
  else{
  const user =await userData.findOne({userName:req.body.userName})
  const userData1 = userData(req.body)

  if(user)
  {
    res.status(403).send("userName unavailable.")
  }
  else
  {
    await userData1.save().then(()=>{
      res.send("Congrats!Registration Successful.")}).catch((e)=>{
        res.status(503).send("Sorry,registration failed.Please try again.")})
  }}

})

app.post('/user_install', async (req,res)=>{
  
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




app.post('/user_uninstall' , (req,res)=>{

  if(req.body.License_key === undefined) {res.status(403).send("Error!")}
  else{
  const date = new Date()
  userData.findOneAndUpdate({License_key:req.body.License_key}, { $set: { Inactive: true, dateLastUse:date }},{new:true} , (error,data)=>
  {
   if(error)
   {res.status(503).send(error)} 
   else 
   {res.status(200).send(data)}
  }
  )
}
   


})



app.post('/user_data/login' , async (req , res)=>{

  if(req.body.userName ===undefined || req.body.password ===undefined || req.body.UUID ===undefined )
  {res.status(403).send("Error!")}

//  console.log(req.body.eMail )
//  res.send(req.body.eMail)
else{

  try {
  const user = await userData.findByCredentials(req.body.userName , req.body.password)

  if(req.body.UUID === user.UUID){
  user.dateLastUse=new Date()
  res.send(user)}
  else{res.status(400).send("INVALID CREDENTIALS!")}
  } catch (e) {
    res.status(400).send("userName or password is INVALID!")
  }
  // const user1 = await userData.findOne({ eMail: req.body.eMail })

  // res.send(user1)

  // console.log(user1)
}

})

app.get('/user_forgotpass' ,async (req,res)=>{

  if(req.body.userName === undefined ){res.status(403).send("Error!")}
  else{

//  //password = await bcrypt.hash(req.body.password, 8)
//  //console.log(password)
//  //password = req.body.password
//  //req.body.dateLastUse = await Date.now
//  //let { password, dateLastUse } = req.body
 const user1 = await userData.findOne({ userName:req.body.userName })

 if(user1)
 {
  const options = {
    from:"bwsim5gt22@gigayasa.com",
    to:user1.eMail,
    subject:"OTP to reset your BWSIM password",
    text: "Use this OTP and reset your password.  OTP:  "+ user1.password
  }
  
 await transporter.sendMail(options, (err,info)=>{
  
    if(err){
   // console.log(err)
    res.status(503).send("Sorry,Service Unavailable at this moment."+err)
    console.log(err)
    return 
    
    }
    res.status(200).send("Successful! Check your eMail")
  })
}
else{
  res.status(403).send("Invalid userName!")

}

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
  if(req.body.userName === undefined || req.body.OTP === undefined || req.body.password ===undefined)
  {res.status(403).send("Error!")}
  else{
    
  user = await userData.findOne({userName:req.body.userName})
  if(!user)
  {
    res.status(403).send("Invalid userName .")
  }

  else if(user.password === req.body.OTP)
  {
    const password1 = await bcrypt.hash(req.body.password , 8)
    const date = new Date()

    userData.findOneAndUpdate({userName:req.body.userName}, { $set: { password:password1 ,dateLastUse: date }} , (error,data)=>
    {
     if(error)
     {res.status(503).send("Sorry,service unavailable at this moment")} 
     else 
     {res.send("Password updated successfully!")}
    })
  }
  else
  { res.status(403).send("Invalid OTP.")}
}
}
)


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
