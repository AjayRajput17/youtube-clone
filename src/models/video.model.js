
import mongoose ,{Schema} from "mongoose";

const videoSchema = new Schema(
{
    videioFile: {
        type: String,  // clodnary url
        required: true,

    },

    thumbnail: {
        type: String, 
        required: true
    },

    title: {
        type: String, 
        required: true
    },

    discription: {
        type: String, 
        required: true
    },

    duration: {
        type: Number,   // clodnary url
        required: true
    },

    views: {
        type: Number,
        default: 0,
    },

    isPublist: {
        type: Boolean,
        default:true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},
{timestamps:true}
)

export const Video = mongoose.model("Video", videoSchema);