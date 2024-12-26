import { Router } from "express";
import { registerUser, loginUser, logoutUser , refreshAccessToken, changeCurrentPassword, getCurrentUser,updateAccountDetails, 
 updateUserAvatar, updateUserCoverImage, getUserChannelProfile,getWatchHistory  } from "../controllers/user.controllers.js";
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

router.route("/update-details").patch(verifyJWT,updateAccountDetails)
// patch - bcoz only one or two fields are updated

router.route("/update-avatar").patch(
    verifyJWT,
    upload.single("avatar"), // Correct way to specify a single file upload
    updateUserAvatar
);


router.route("/update-coverImage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

// debug required - api not work now
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)


export default router;
