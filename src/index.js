
// require('dotenv').config({path: './env'})

import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import express from 'express';

dotenv.config({
    path: './env'
})
const app = express();


connectDB()
.then(() => {

    app.on("error", (error) => {
        console.log("ERRR: ",error);
        throw error
    })

    app.listen(process.env.PORT || 3000, () => {
        console.log(` Server is Running at Port : ${process.env.PORT}`);
    })
    
})
.catch((err) => {
    console.log("Mongo db connection failed!! at index page",err);
})
































/*
import express from "express";
const app = express();

;( async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error)=> {
        console.log("ERROR: ", error);
        throw error
       })

       app.listen(process.env.PORT, () => {
        console.log(`APP is Listening on port ${process.env.PORT}`);
       })

    } catch(error) {
        console.error("ERROR ",error)
        throw error
    }
})()
*/