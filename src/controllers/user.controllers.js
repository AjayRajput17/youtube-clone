import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const generateAccesAndRefeshToken = async (userId) => 
{
    try {
         const user = await User.findById(userId);
         const accesstoken = user.generateAccesToken()
         const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshToken }
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser =  asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // }) 

    /* Steps:- 
       1. get the user details
       2. validation of details- not empty
       3. check if user already exist: username, email
       4. check the image , check for avtar 
       5. upload them into cloudnary, check avtar upload or not
       6.create user object - create entry in database
       7. remove password and refresh token fromn response
       8. check for user creation 
       9. return the response
    */

    // getting the fields from user
    const {fullName, email, username, password } = req.body
    // console.log("email: ", email);

    // fields validation 
    if (
        [fullName , email, username, password].some((field) => 
             field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required..")
    }
    // you can validate the email also 

    // check user alredy exist or not

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exist");
    }

    // check for avatar and image
    // console.log(req.files);


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) &&  req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }


    //upload them into cloudnary

   const avatar =  await  uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    //console.log(avatar);
   // check avatar uploaded or not
   if(!avatar){
    throw new ApiError(400, "Avatar is required not upload on cloudnary");
   }

   // CREATE USER OBJECT - CREATE A ENTRY IN DATABASE

   const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

   // check the user created or not
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createdUser){
    throw new ApiError(500, "something went wrong while registring a user")
   }

   // sent the response
   return res.status(201).json(
    new ApiResponse(200,createdUser, "user register succefully")
   )

    
})

const loginUser = asyncHandler(async (req,res) =>{

    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    //send cookie


    const { email, username, password } = req.body;
    console.log("Login Request Body: ", req.body);

    if (!username && !email) {
        throw new ApiError(400, "username or password required")
    }

   const user =  await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Password Creaditials")
    }

   const {accesstoken, refreshToken } =  await generateAccesAndRefeshToken(user._id);

   const loggedInUser = await User.findById(user._id).select(" -password -refreshToken");

   // send the token in cookie
   const options = {
    httpOnly: true,
    secure: true
   }

   return  res
   .status(200)
   .cookie("accessToken", accesstoken, options)
   .cookie("refreshToken",refreshToken, options)
   .json(
    new ApiResponse
      (
        200,
         {
             user: loggedInUser, accesstoken,
             refreshToken
         },
         "User Logged in successfully"
      )
   )


})

const logoutUser = asyncHandler(async(req,res) => {

    //find the user
    // clear the cookies 
    // clear the refreshToken
    console.log("Logout Request Body: ", req.body);

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },

        {
            new: true  // response me update value milati
        }
    )

    const options = {
        httpOnly: true,
        secure: true
       }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new ApiResponse(200, {}, "User Logged Out "))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    try {
        
        const inComingRefreshToken = req.cookies?.refreshToken || req.boby.refreshToken
        
        if (!inComingRefreshToken) {
            throw new ApiError(401, "unathorized request token not found in request")
        }

        const decodedToken = jwt.verify(
            inComingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if(inComingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accesstoken, newRefreshToken } = await generateAccesAndRefeshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accesstoken,options)
        .cookie("refreshToken", newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accesstoken, newRefreshToken},
                "Access token refreshed"
            )
        )
    } 
    catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }


})

const changeCurrentPassword = asyncHandler(async(req,res)=> {

    const {oldPassword, newPassword, confirmPassword} = req.body

    if (!(newPassword === confPassword)) {
        throw new ApiError(400,"new password and confirm password must be same")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false })

    return res
    .status(200)
    .json(new ApiResponse (200, {}, "Password changed Succefully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    user = req.user;
    return res 
    .status(200)
    .json(200, user, "current user fetched succefully")
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName,email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All filds are required")
    }

   const user =  User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName:fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details Updated Succefully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {

   const avatarLocalPath =  req.file?.path

   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
    throw new ApiError(400, "Error while upload avatar on cloudnary")
   }

   const user = await User.findByIdAndDelete(
    req.user?._id,
    {
        $set: {
            avatar: avatar.url
        }
    },
    {new: true}
   ).select("-password")

   return res
    .status(200)
    .json( new ApiResponse(200, user, "avatar updated succefully"))
})


const updateUserCoverImage = asyncHandler(async(req,res) => {

    const coverImageLocalPath =  req.file?.path
 
    if(!coverImageLocalPath){
     throw new ApiError(400, "coverImage file is required")
    }
 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
 
    if(!coverImage.url){
     throw new ApiError(400, "Error while upload coverImage on cloudnary")
    }
 
    const user = await User.findByIdAndDelete(
     req.user?._id,
     {
         $set: {
            coverImage: coverImage.url
         }
     },
     {new: true}
    ).select("-password")

    return res
    .status(200)
    .json( new ApiResponse(200, user, "coverImage updated succefully"))

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
    updateUserCoverImage
}