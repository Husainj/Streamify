import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
       throw new ApiError(400 , "No content entered")
    }
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400 , "User not found")
    }

    const tweet = await Tweet.create({
        content,
        owner : user
    })

    return res
    .status(200)
    .json(new ApiResponse(200 , tweet , "New tweet created"))


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    
    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(400 , "User not found")
    }

    const tweets = await Tweet.aggregate(
    [
        {
            $match:{
                "owner" : user
            }
        }
    ]
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}