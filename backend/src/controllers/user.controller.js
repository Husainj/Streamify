import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs"
import mongoose from "mongoose";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({

  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
  }
});

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  // console.log("email : " , email)

  //WE CAN USE IF ELSE TO CHECK EVERY FIELD BUT WE WILL USE AN ADVANCE METHOD HERE
  // if(fullname === ""){
  //     throw new ApiError(400, "Full name is required")
  // }

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  //multer giving file path
  
  const avatarLocalPath = req.files?.avatar[0]?.path;

  //we cant check for coverimage like this because this code means that we are expecting to get an array from req.files
  //coverimage , but when nothing is present then undefined error will come.
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(430, "Avatar file is required , Local path is missing");
  }

  let coverImageLocalPath
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

 
  //we are using our function which we created before to upload the avatar on the cloudinary from local
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const verificationToken = user.generateVerificationToken();
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  const verificationUrl = `http://localhost:5173/verify-email/${verificationToken}`;
  await transporter.sendMail({
      to: user.email,
      subject: "Verify Your Email",
      html: `Please click this link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -verificationToken -verificationTokenExpires"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered succefully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
   throw new ApiError(400 , "Invalid or Expired Token")
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
     throw new ApiError(404, "User does not exist");
    
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }

  if (!user.isVerified) {
    throw new ApiError(410, "Please verify your email before logging in");
}

  

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    path:'/',
    domain: process.env.COOKIE_DOMAIN
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  let { email, username } = req.body;

  // Check if email is provided; if not, find the user by username
  let user;
  if (email) {
    user = await User.findOne({ email });
  } else if (username) {
    user = await User.findOne({ username });
    if (user) {
      email = user.email;  // Extract the email from the found user
    }
  }

  // If no user is found, return an error
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If the user's email is already verified, return an error
  if (user.isVerified) {
    throw new ApiError(400, "Email already verified");
  }

  // Generate a new verification token and save it to the user
  const verificationToken = user.generateVerificationToken();
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Construct the verification URL
  const verificationUrl = `http://localhost:5173/verify-email/${verificationToken}`;
  
  // Send the verification email
  await transporter.sendMail({
    to: user.email,
    subject: "Verify Your Email",
    html: `Please click this link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`
  });

  // Respond with success
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email resent successfully"));
});


const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    path:'/',
    domain: process.env.COOKIE_DOMAIN
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token ");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      path:'/',
      domain: process.env.COOKIE_DOMAIN
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, " Current user fetched successfully "));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
      throw new ApiError(400, "All fields are required");
  }

  // Build the update object dynamically based on whether email is being changed
  const updateFields = { fullname }; // Always update fullname

  // If the email is changed, update it and set isVerified to false
  if (email !== req.user.email) {
      updateFields.email = email;
      updateFields.isVerified = false; // Set isVerified to false if email is changed
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updateFields },
      { new: true }
  ).select("-password");

  return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"));
});


const updateUserAvatar = asyncHandler(async(req, res)=>{
   const avatarLocalPath = req.file?.path

   if (!avatarLocalPath) {
    throw new ApiError(400 , "Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if (!avatar.url) {
    throw new ApiError(400 , "Error while uploading on avatar")
   }

   


 const user =  await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar: avatar.url
        }
    },
    {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(
       new ApiResponse(200 , user , "avatar updated succesfully")
   )
})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPathNew = req.file?.path
 
    if (!coverImageLocalPathNew) {
     throw new ApiError(400 , "coverImage file is missing")
    }
 
    const coverImage = await uploadOnCloudinary(coverImageLocalPathNew)
 
    if (!coverImage.url) {
     throw new ApiError(400 , "Error while uploading on coverImage")
    }
 
 

 const user =   await User.findByIdAndUpdate(
     req.user?._id,
     {
         $set:{
            coverImage: coverImage.url
         }
     },
     {new: true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200 , user , "Cover image updated succesfully")
    )
 })

const getUserChannelProfile = asyncHandler(async(req,res)=>{
 
 

  const {username} = req.params

  console.log("Request.params : " , req.params)


  if(!username?.trim()){
    throw new ApiError(400 , "username is missing" )
  }


const channel= await User.aggregate([
  {
    $match:{
      username : username?.toLowerCase()
    }
  },
  {
    $lookup:{
      from:"subscriptions",
      localField: "_id",
      foreignField:"channel",
      as: "subscribers"
    }
  },
  {
    $lookup:{
      from:"subscriptions",
      localField: "_id",
      foreignField:"subscriber",
      as: "subscribedTo"
    }
  },
  {
    $addFields:{
      subscribersCount:{
        $size:"$subscribers"
      },
      channelSubscribedToCount:{
        $size: "$subscribedTo"
      },
      isSubscribed:{
        $cond:{
          if:{ $in: [req.user?._id , "$subscribers.subscriber"]},
          then: true,
          else: false
        }
      }
    }
  },
  {
    $project:{
      fullname:1 , 
      username :1,
      subscribersCount:1,
      channelSubscribedToCount:1,
      isSubscribed:1,
      avatar:1,
      coverImage:1,
      email:1
    }
  }
])

console.log("channel details: " , channel);

if(!channel?.length){
  throw new ApiError( 404 , "channel does not exist" );
}

return res
.status(200)
.json(
  new ApiResponse(200, channel[0] , "User channel fetched successfully")
)

})

const getUserChannelProfileUnauth = asyncHandler(async(req,res)=>{
 
 

  const {username} = req.params

  console.log("Request.params : " , req.params)


  if(!username?.trim()){
    throw new ApiError(400 , "username is missing" )
  }


const channel= await User.aggregate([
  {
    $match:{
      username : username?.toLowerCase()
    }
  },
  {
    $lookup:{
      from:"subscriptions",
      localField: "_id",
      foreignField:"channel",
      as: "subscribers"
    }
  },
  {
    $lookup:{
      from:"subscriptions",
      localField: "_id",
      foreignField:"subscriber",
      as: "subscribedTo"
    }
  },
  {
    $addFields:{
      subscribersCount:{
        $size:"$subscribers"
      },
      channelSubscribedToCount:{
        $size: "$subscribedTo"
      },
      isSubscribed:{
        $cond:{
          if:{ $in: [req.user?._id , "$subscribers.subscriber"]},
          then: true,
          else: false
        }
      }
    }
  },
  {
    $project:{
      fullname:1 , 
      username :1,
      subscribersCount:1,
      channelSubscribedToCount:1,
      isSubscribed:1,
      avatar:1,
      coverImage:1,
      email:1
    }
  }
])

console.log("channel details: " , channel);

if(!channel?.length){
  throw new ApiError( 404 , "channel does not exist" );
}

return res
.status(200)
.json(
  new ApiResponse(200, channel[0] , "User channel fetched successfully")
)

})
const getWatchHistory = asyncHandler(async(req , res)=>{
     const user = await User.aggregate([
      {
        $match:{
          _id : new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $lookup:{
          from: "videos",
          localField: "watchHistory" ,
          foreignField: "_id",
          as: "watchHistory",
          pipeline:[
            {
              $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner" ,
                pipeline:[
                  {
                    $project:{
                      fullname:1,
                      username:1,
                      avatar:1
                    }
                  }
                ]
              }
            },
            {
              $addFields:{
                owner:{
                  $first: "$owner"
                }
              }
            }
          ]
        }
      }
    ])

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched succesfully"
      )
    )
})



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getUserChannelProfileUnauth,
  verifyEmail,
  resendVerificationEmail
};
