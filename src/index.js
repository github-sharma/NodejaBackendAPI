const express = require('express')
const bcrypt = require('bcryptjs')
require('./db/mongoose.js')
//const date = require('date-and-time')
const userData = require('./models/users.js')
const router = new express.Router()

console.log(new Date())

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

 app.post('/users', async (req,res)=>{

  

   userData1 = userData(req.body)
  // userData1.password = await bcrypt.hash(userData1.password , 8)
   userData1.save().then(()=>{
    res.send(userData1)}).catch((e)=>{
      res.status(400).send(e)})
    
  //res.send('testing')
})

app.get('/users/:id' , (req , res)=> {
   
  const _id = req.params.id   //access the id provided
  userData.findById(_id).then((user)=>{
    if(!user){
      return res.status(404).send()
    }
    res.send(user)
  }).catch((e)=>{
    res.status(500).send()
  })

})

app.post('/users/login' , async (req , res)=>{

//  console.log(req.body.eMail )
//  res.send(req.body.eMail)

  try {
  const user = await userData.findByCredentials(req.body.eMail , req.body.password)

  
  res.send(user)
  } catch (e) {
    res.status(400).send(e)
  }
  // const user1 = await userData.findOne({ eMail: req.body.eMail })

  // res.send(user1)

  // console.log(user1)


})

app.patch('/users/:id' ,async (req,res)=>{

 req.body.password = await bcrypt.hash(req.body.password, 8)
 //req.body.dateLastUse = await Date.now
 let { password, dateLastUse } = req.body
 dateLastUse = await new Date()
   
   //console.log(password)
  try{
    const user = await userData.findByIdAndUpdate(req.params.id, {password,dateLastUse} , { new: true, runValidators: true})

    if(!user){
      return res.status(404).send()
    }
    res.send(user)

  }catch(e){
   res.status(400).send()

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


const port = process.env.PORT || 3000

app.listen(port,()=>{console.log('server is up and running' + port)})
