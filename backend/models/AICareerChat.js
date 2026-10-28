import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "model"],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        attachment: {
    name: {
        type: String
    },
    size: {
        type: Number
    },
    type: {
        type: String
    }
}
    },
    {
        _id: false
    }
);

const aiCareerChatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },
        title: {
            type: String,
            default: "New Chat",
            trim: true,
            maxlength: 100
        },
        messages: {
            type: [messageSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

aiCareerChatSchema.index({
    userId: 1,
    updatedAt: -1
});

const AICareerChat = mongoose.model(
    "AICareerChat",
    aiCareerChatSchema
);

export default AICareerChat;