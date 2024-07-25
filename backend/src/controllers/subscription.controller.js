import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//✅
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }
    // const channel = await User.findById(channelId)
    // if(!channel){
    //     throw new ApiError(400 , "No channel found")
    // }

    // const subscriber = await User.findById(req.user)
    // if(!subscriber){
    //     throw new ApiError(400 , "No subscriber found")
    // }

    const query = {channel : channelId  , subscriber : req.user._id}
    const subscribed = await Subscription.findOneAndDelete(query)

    if(!subscribed){
        const subscription = await Subscription.create(
            {
                
                    subscriber : req.user._id,
                    channel : channelId
            
            }
        )

        return res
        .status(200)
        .json(new ApiResponse(200 , subscription , "Subscribed successfully"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , subscribed , "Unsubscribed successfully"))
    



   




})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400 , "No channel Id provided")
    }

    const userId = req.user._id

    if(!userId){
        throw new ApiError(400 , "No user Id found ")
    }
    
    const subscriberList = await Subscription.aggregate(
        [
            {$match : {channel: channelId}},
            {$project : {
                "subscriber" : 1
            }}
        ]
    )

    return res
    .status(200)
    .json(new ApiResponse(200 , subscriberList , "Subscribers fetched"))


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}