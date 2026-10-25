
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
     type: {
    type: String,
    enum: [
        "learning",
        "assessment",
        "career",
        "progress",
        "job",
        "system"
    ],
    default: "system"
},
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Notification", notificationSchema);
