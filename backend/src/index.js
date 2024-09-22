import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.on("error" , (error)=>{
        console.log("Error : " , error)
        throw error 
    })

    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Port is open at : ${process.env.PORT}`)
    })

    app.get("/" , (req , res)=>{
        res.json("Hello");
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed : " , err)
})

















//First approcah to connect Database
// import express from "express";
// const app = express()

// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error" , (error) =>{
//             console.log("ERROR : " , error)
//             throw error
//         })

//         app.listen(process.env.PORT , ()=>{
//             console.log("App is listening at port " , `${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("Error : " , error);
//         throw error
//     }
// })();