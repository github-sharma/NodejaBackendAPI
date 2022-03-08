const { ObjectID } = require('bson')
const { MongoClient }= require('mongodb')
const mongoose = require('mongoose')


//const connectionURL = 'mongodb://127.0.0.1:27017'
const connectionURL = 'mongodb+srv://GigaYasa:GigaYasa@cluster0.07hd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const databaseName = 'API'

mongoose.connect(connectionURL)



//code to insert jsObject into database
// MongoClient.connect(connectionURL, (error,client)=>{

//   if(error)
//   {  return console.log('unable to connect to database')}

//   const db =  client.db(databaseName)
//   const user2 = db.collection('user2')
//   user2.insertOne({
//     name:'jatin',
//     age: 23
    
//   }).then((res)=>{console.log('success', res.acknowledged )}).catch((error)=>{console.log('error' , error)})
// })





//code to search fetch jsObject from database using id
// MongoClient.connect(connectionURL, (error,client)=>{

//   if(error)
//   {  return console.log('unable to connect to database')}

//   const db =  client.db(databaseName)
//   db.collection('user2').findOne({_id:new ObjectID("620f5a78e46c056d064f6794")}).then((res)=>{console.log('Here are your details', res )}).catch((error)=>{console.log('error' , error)})
// })


  
//mongoose code 


