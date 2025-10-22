import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },   // 👈 add this line
  photos: [
    {
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});


export default mongoose.model("User", UserSchema);
