import { Router } from "express";
import { registerUser, loginUser, logoutUser , refreshAccessToken, changeCurrentPassword, getCurrentUser,updateAccountDetails, 
 updateUserAvatar, updateUserCoverImage } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


router.route("/login").post(loginUser)

//secured route

router.route("/logout").post( verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post( verifyJWT,changeCurrentPassword)

router.route("/get-user-details").get(verifyJWT,getCurrentUser)

router.route("/update-details").post(verifyJWT,updateAccountDetails)

router.route("/update-avatar").post(
    upload.single("avatar"), // Correct way to specify a single file upload
    verifyJWT,
    updateUserAvatar
);


router.route("/update-coverImage").post(
    upload.single("coverImage"),
    verifyJWT,updateUserCoverImage)


export default router;
