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
  
  if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarFile = req.files.avatar[0];
  const avatarBuffer = avatarFile.buffer;
  const avatarFileName = avatarFile.originalname;


  // Validate the avatar file presence
  if (!avatarBuffer) {
    throw new ApiError(430, "Avatar file is required, Buffer is missing");
  }

  // Handle cover image file if provided
  let coverImageBuffer, coverImageFileName;
  if (
    req.files &&
    req.files.coverImage &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageBuffer = req.files.coverImage[0].buffer;
    coverImageFileName = req.files.coverImage[0].originalname;
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarBuffer, avatarFileName);
  const coverImage = coverImageBuffer
    ? await uploadOnCloudinary(coverImageBuffer, coverImageFileName)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar to Cloudinary");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const verificationToken = user.generateVerificationToken();
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  const verificationUrl = `${process.env.CORS_ORIGIN}/verify-email/${verificationToken}`;
  await transporter.sendMail({
      to: user.email,
      subject: "Verify Your Email",
      html: `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Verify Your Email</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h1 style="color: #e50914; text-align: center; margin-bottom: 20px;">Streamify</h1>
                              <div style="background-color: #ffffff; border-radius: 5px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                  <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
                                  <p style="margin-bottom: 20px;">Thank you for signing up with Streamify! To complete your registration and start enjoying our services, please verify your email address by clicking the button below:</p>
                                  <div style="text-align: center; margin-bottom: 20px;">
                                      <a href="${verificationUrl}" style="background-color: #e50914; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
                                  </div>
                                  <p style="margin-bottom: 20px;">If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
                                  <p style="margin-bottom: 20px; word-break: break-all;"><a href="${verificationUrl}" style="color: #0066cc;">${verificationUrl}</a></p>
                                  <p style="margin-bottom: 20px;">If you didn't create an account with Streamify, please disregard this email.</p>
                              </div>
                              <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">© 2024 Streamify. All rights reserved.</p>
                          </td>
                      </tr>
                  </table>
              </body>
              </html>`
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
    sameSite: 'None'
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
  const verificationUrl = `${process.env.CORS_ORIGIN}/verify-email/${verificationToken}`;
  
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
   sameSite: 'None'
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
      sameSite: 'None'
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

  if (!(req.file && req.file.fieldname === 'avatar')) {
    throw new ApiError(400 , "File not found")
  }
    const avatarFile = req.file;
    const avatarBuffer = avatarFile.buffer;
    const avatarFileName = avatarFile.originalname;

    if (!avatarBuffer) {
        throw new ApiError(400, "Avatar file is required, Buffer is missing");
    }

    // Upload thumbnail to Cloudinary
    const avatar = await uploadOnCloudinary(avatarBuffer, avatarFileName);

    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }


 const user =  await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
             avatar: avatar.url,
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
  if (!(req.file && req.file.fieldname === 'coverImage')) {
    throw new ApiError(400 , "File not found")
  }
    const coverImageFile = req.file;
    const coverImageBuffer = coverImageFile.buffer;
    const coverImageFileName = coverImageFile.originalname;

    if (!coverImageBuffer) {
        throw new ApiError(400, "coverImage file is required, Buffer is missing");
    }

    // Upload thumbnail to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageBuffer, coverImageFileName);

    if (!coverImage) {
        throw new ApiError(400, "coverImage file upload failed");
    }


 const user =  await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
          coverImage: coverImage.url,
        }
    },
    {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(
       new ApiResponse(200 , user , "coverImage updated succesfully")
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
