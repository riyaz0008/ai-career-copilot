import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        learningReminders: {
            type: Boolean,
            default: true
        },
        assessmentUpdates: {
            type: Boolean,
            default: true
        },
        jobAlerts: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model(
    "NotificationPreference",
    notificationPreferenceSchema
);