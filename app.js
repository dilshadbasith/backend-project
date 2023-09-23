const express= require('express');
const  mongoose = require('mongoose');
const app= express()
const port = 3000;
const adminRoute=require('./routes/adminRoutes')
const userRoute=require('./routes/userRoutes')
require("dotenv").config()
mongoose.connect("mongodb://0.0.0.0:27017/backend-project");

app.use(express.json())
app.use('/api/user',userRoute)
app.use('/api/admin',adminRoute)

app.listen(port,(err)=>{
    if(err){
        console.log(err)
    }
    console.log(`server is running on port ${port}`)
})