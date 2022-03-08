const mongoose = require('mongoose')
const { default: isEmail } = require('validator/lib/isEmail')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({

  userName:{
    type:String,
    trim: true
  },
  eMail:{
    type:String,
    required:true,
    trim:true,
    lowercase:true,
    validate(value){
      if (!isEmail(value))
      { throw new error('email is inValid')}
    }
  },

  License_key:{
    type:Number,
    unique:true
  },
 

  UUID:{
      type:String
  },
  dateInst:{
    type: Date,
    default:Date.now
    
    //update:false

  },
  dateLastUse:{
    type:Date,
    default:Date.now
    
  },
  password:{
       type:String,
       required : true


  }

})





//this code is preveting the password of the user from sending back as response
userSchema.methods.toJSON = function(){
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  return userObject
}




 userSchema.pre('save',async function(next)
{                     
    const user = this                                                                                                                                         
    user.password = await bcrypt.hash(user.password , 8)

   next()
 }
 )

//  userSchema.pre('findByIdAndUpdate',async function(next)
// {                     
//     const user = this                                                                                                                                         
//     user.password = await bcrypt.hash(user.password , 8)

//    next()
//  }
// )


 userSchema.statics.findByCredentials = async (eMail , password)=> {
   const user1 = await userData.findOne({ eMail })

   if (!user1){
     throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password , user1.password)

  if(!isMatch){
    throw new Error('unable to login')
  }
  
  return user1

 }
 


const userData = mongoose.model('userData',userSchema) 

module.exports = userData

