
import  { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
    console.log("email: ", email);

    // fields validation 
    if (
        [fullName , email, username, password].some((field) => 
             field.trim() === "")
    ){
        throw new ApiError(400, "All fields are required..")
    }
    // you can validate the email also 

    // check user alredy exist or not

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exist");
    }

    // check for avatar and image

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }


    //upload them into cloudnary

   const avatar =  await  uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   // check avatar uploaded or not
   if(!avatar){
    throw new ApiError(400, "Avatar is required");
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







export {registerUser}