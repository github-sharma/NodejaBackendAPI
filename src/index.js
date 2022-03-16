const express = require('express')
const bcrypt = require('bcryptjs')
require('./db/mongoose.js')
const date = require('date-and-time')
const userData = require('./models/users.js')
const transporter =require('./nodemailer.js')
const { findOne } = require('./models/users.js')
const { AggregationCursor } = require('mongodb')

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

app.post('/user_install', async (req,res)=>{

  

   userData1 = userData(req.body)
   userData1.dateInst= new Date()
   userData1.dateLastUse = new Date()
   userData1.password = await bcrypt.hash(userData1.password , 8)
  const user1 = await userData.findOne({ License_key:req.body.License_key })
  const user2 = await userData.findOne({ userName:req.body.userName })
  if(user1 && user1.Inactive === false)
  { res.status(400).send("License Error!")}
  
  else if(user1 && user1.Inactive === true){

   if(user2){
     res.status(400).send("userName is not available!")
   }
   else{
     //req.body.dateInst = user1.dateInst
    // userData1.dateInst = user1.dateInst
    // await userData.deleteOne({ License_key:req.body.License_key })
    // await userData1.save().then(()=>{
    //       res.send(userData1)}).catch((e)=>{
    //        res.status(400).send(e)})
    userData.findOneAndUpdate({ License_key:userData1.License_key }, { $set: { 
      Name: req.body.Name, 
      eMail:req.body.eMail,
      password:userData1.password,
      UUID:req.body.UUID,
      userName:req.body.userName,
      Inactive:false,
      License_key:user1.License_key,
      dateLastUse: new Date(),
      dateInst:user1.dateInst
     }
    }, (error,data)=>{
      if(error)
      {
        res.status(503).send("Sorry,installation failed.Please try again.") 
      
      }
      else
      res.status(200).send(data)

    })




  }}
  else{
    if(user2){
      res.status(400).send("userName is not available!")
    }
    else{
    await userData1.save().then(()=>{
      res.send(userData1)}).catch((e)=>{
        res.status(503).send("Sorry,installation failed.Please try again.")})

  }}
  //res.send('testing')
})

app.post('/user_uninstall' , (req,res)=>{

  userData.findOneAndUpdate({License_key:req.body.License_key}, { $set: { Inactive: true }} , (error,data)=>
  {
   if(error)
   {res.status(503).send(error)} 
   else 
   {res.send("Uninstallation Successful!")}
  }
  )
   


})



app.post('/user_data/login' , async (req , res)=>{

//  console.log(req.body.eMail )
//  res.send(req.body.eMail)

  try {
  const user = await userData.findByCredentials(req.body.userName , req.body.password)

  if(req.body.UUID === user.UUID){
  res.send(user)}
  else{res.status(400).send("INVALID CREDENTIALS!")}
  } catch (e) {
    res.status(400).send("userName or password is INVALID!")
  }
  // const user1 = await userData.findOne({ eMail: req.body.eMail })

  // res.send(user1)

  // console.log(user1)


})

app.get('/user_forgotpass' ,async (req,res)=>{

//  //password = await bcrypt.hash(req.body.password, 8)
//  //console.log(password)
//  //password = req.body.password
//  //req.body.dateLastUse = await Date.now
//  //let { password, dateLastUse } = req.body
 const user1 = await userData.findOne({ userName:req.body.userName })

 if(user1)
 {
  const options = {
    from:"sks7065@outlook.com",
    to:user1.eMail,
    subject:"OTP to reset your BWSIM password",
    text: "Use this OTP and reset your password.  OTP:  "+ user1.password
  }
  
 await transporter.sendMail(options, (err,info)=>{
  
    if(err){
   // console.log(err)
    res.status(503).send("Sorry,Service Unavailable at this moment.")
    return 
    
    }
    res.status(200).send("Successful! Check your eMail")
  })
}
else{
  res.status(403).send("Invalid userName!")

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
    
  user = await userData.findOne({userName:req.body.userName})
  if(!user)
  {
    res.status(403).send("Invalid userName .")
  }

  else if(user.password === req.body.OTP)
  {
    const password1 = await bcrypt.hash(req.body.password , 8)
    const date = new Date()

    userData.findOneAndUpdate({userName:req.body.userName}, { $set: { password:password1 ,dateInst: date }} , (error,data)=>
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
)


const port = process.env.PORT || 3000

app.listen(port,()=>{console.log('server is up and running' + port)})
