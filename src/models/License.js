const mongoose = require('mongoose')


const userSchema2 = new mongoose.Schema({

  
 License_key:{
   type:String,
    
     },
  Allocated:{
    type:Boolean
  },

  dateInst:{
    type:Date
  },
  dateLastUse:{
    type:Date
    
  },
  Validity:{
    type:Number
  },
  Inactive:{

    type:Boolean 
  }
 
//   Allocated:{
//     type:Boolean,
//     default:false
//   }

   }) 



const LicenseData = mongoose.model('LicenseKeyData',userSchema2)

module.exports = LicenseData