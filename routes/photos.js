import express from "express";
import multer from "multer";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* -------------------- Configure Multer for Cloudinary -------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gallery_photos",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage });

/* -------------------- Upload Photo -------------------- */
router.post("/upload", auth, upload.single("photo"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const photo = { url: req.file.path };
    user.photos.push(photo);
    await user.save();

    res.json({ msg: "Photo uploaded", photo });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* -------------------- Upload Avatar -------------------- */
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Delete old avatar from Cloudinary if exists
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`gallery_photos/${publicId}`);
    }

    user.avatar = req.file.path;
    await user.save();

    res.json({ msg: "Avatar uploaded successfully", avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* -------------------- Get My Photos -------------------- */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username avatar photos");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* -------------------- Delete Photo -------------------- */
// Delete photo by ID
router.delete("/:photoId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const photo = user.photos.id(req.params.photoId);
    if (!photo) return res.status(404).json({ msg: "Photo not found" });

    // ✅ Extract the full public_id including folder name
    const parts = photo.url.split("/");
    const folderName = parts[parts.length - 2]; // e.g. "gallery_photos"
    const fileName = parts[parts.length - 1].split(".")[0]; // e.g. "abc123xyz"
    const publicId = `${folderName}/${fileName}`;

    // ✅ Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // ✅ Remove from MongoDB
    photo.deleteOne();
    await user.save();

    res.json({ msg: "Photo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

export default router;
