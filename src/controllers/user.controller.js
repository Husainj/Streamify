import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res)=>{
    const {fullname , email ,username , password} =req.body
    // console.log("email : " , email)
   

    //WE CAN USE IF ELSE TO CHECK EVERY FIELD BUT WE WILL USE AN ADVANCE METHOD HERE
    // if(fullname === ""){
    //     throw new ApiError(400, "Full name is required")
    // }

    if(
        [fullname , email , username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409 , "User already exist")
    }

    //multer giving file path
    const avatarLocalPath = req.files?.avatar[0]?.path;

    //we cant check for coverimage like this because this code means that we are expecting to get an array from req.files 
    //coverimage , but when nothing is present then undefined error will come. 
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required , Local path is missing")
    }

    //we are using our function which we created before to upload the avatar on the cloudinary from local
    const avatar =  await uploadOnCloudinary(avatarLocalPath)  
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  
    if(!avatar){
        throw new ApiError(400 , "Avatar file is required");
    }


  const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage : coverImage?.url || "" ,
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering the user")
    }

return res.status(201).json(
    new ApiResponse(200 , createdUser , "User registered succefully")
)

})

export {registerUser}

//error was coming in postman left video at 11:00