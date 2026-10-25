import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    loginEmailSent: {
    type: Boolean,
    default: false
},
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "admin"
    }
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;