const mongoose = require('mongoose')
const { default: isEmail } = require('validator/lib/isEmail')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({

  
  userName:{
    type:String,
    index:true
    
     
  },
  eMail:{
    type:String,
    trim:true,
    lowercase:true,
    validate(value){
      if (!isEmail(value))
      { throw new error('email is inValid')}
    }
  },

  License_key:{
    type:String,
   max :20
   // match:'/^.{0,20}$/'

 
  },
 

  UUID:{
      type:String
  },
  dateInst:{
    type: Date
    
    //update:false

  },
  Inactive:{

    type:Boolean,
  
  },
  
  password:{
       type:String,
      

  },
  Validity:{
    type:Number,
    
  }

})



//this code is preveting the password of the user from sending back as response
userSchema.methods.toJSON = function(){
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject._id
  delete userObject.__v
  return userObject
}




 userSchema.statics.findByCredentials = async (userName , password)=> {
   const user1 = await userData.findOne({ userName })

   if (!user1){
     throw new Error('Unable to login')
  }1

  const isMatch = await bcrypt.compare(password , user1.password)

  if(!isMatch){
    throw new Error('unable to login')
  }
  
  return user1

 }
 


const  userData = mongoose.model('userData',userSchema) 


module.exports = userData


