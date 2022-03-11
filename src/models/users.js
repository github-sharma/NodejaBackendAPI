const mongoose = require('mongoose')
const { default: isEmail } = require('validator/lib/isEmail')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({

  Name:{
    type:String
  },
  userName:{
    type:String,
    index:true
    
     
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
    type:Number
  },
 

  UUID:{
      type:String
  },
  dateInst:{
    type: Date
    
    //update:false

  },
  dateLastUse:{
    type:Date
    
  },
  password:{
       type:String,
       required : true


  },
  Inactive:{
    type:Boolean,
    default:false
  }

})





//this code is preveting the password of the user from sending back as response
userSchema.methods.toJSON = function(){
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.Inactive
  return userObject
}




//  userSchema.pre('save',async function(next)
// {                     
//     const user = this 
                                                                                                                                       
//     user.password = await bcrypt.hash(user.password , 8)

//    next()
//  }
//  )

//  userSchema.pre('findByIdAndUpdate',async function(next)
// {                     
//     const user = this                                                                                                                                         
//     user.password = await bcrypt.hash(user.password , 8)

//    next()
//  }
// )


 userSchema.statics.findByCredentials = async (userName , password)=> {
   const user1 = await userData.findOne({ userName })

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

