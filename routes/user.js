import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Get user profile + photos
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      user: { username: user.username, email: user.email },
      photos: user.photos,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;
