//web need to connect with database at different times , so we create a wrapper and use it everywhere
const asyncHandler = (requestHandler)=>{
    (req, res, next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=> next(err))
    }

}

export {asyncHandler}




//Implemented using try catch block , this can also be used.
// const asyncHandler=(fn)=> async(req , res, next)=>{
//     try{
//         await fn(req ,res, next)
//     }catch(err){
//         res.status(err.code || 500).json({
//             success: false,
//             message:err.message
//         })
//     }
// }