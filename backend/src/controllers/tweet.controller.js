import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//✅
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
       throw new ApiError(400 , "No content entered")
    }

    const tweet = await Tweet.create({
        owner: new mongoose.Types.ObjectId(req.user._id),
        content
    })

    return res
    .status(200)
    .json(new ApiResponse(200 , tweet , "New tweet created"))


})

//✅
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
                "owner": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project:{
                content:1
            }
        }
    ]
    )



    return res
    .status(200)
    .json(new ApiResponse(200 , tweets , "All tweets of the user fetched successfully"))

})

//✅
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(400 , " No content found to update ")
    }
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400 , "No tweet Id added")
    }


    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },{new:true}
    )


    return res
    .status(200)
    .json(new ApiResponse(200 , tweet , "Tweet updated succesfully"))
})

//✅
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400 , "No tweet Id was found")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(400 , "Tweet not deleted")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , tweet , "Tweet deleted"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}