import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()


//middleware to allow only the provided url to connect with frontend
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

//Accepting json also with size limit
app.use(express.json({limit:"16kb"}))
 
//  used to accept url's and encode them , like we need to tell express that space " " is converted into %20 ,
//  similarly it will help in encoding it.
app.use(express.urlencoded({extended:true , limit:"16kb"}))

//to keep assets or images , see you have made a public folder 
app.use(express.static("public")) 
app.use(cookieParser())

export {app}