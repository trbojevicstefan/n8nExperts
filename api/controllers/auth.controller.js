import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SESSION_COOKIE_NAME = "__session";

const toPublicUser = (userDoc) => {
  const { password, ...safe } = userDoc._doc;
  const role = safe.role || (safe.isExpert || safe.isSeller ? "expert" : "client");
  safe.role = role;
  safe.isExpert = role === "expert";
  safe.isSeller = role === "expert";
  safe.isClient = role === "client";
  return safe;
};

const resolveRole = ({ role, isExpert, isSeller }) => {
  if (role === "expert" || role === "client") {
    return role;
  }
  if (isExpert || isSeller) {
    return "expert";
  }
  return "client";
};

const signSessionToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      isExpert: user.isExpert,
      isClient: user.isClient,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    process.env.JWT_KEY
  );

const authCookieBaseOptions = () => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  secure: process.env.NODE_ENV === "production",
});

const authCookieOptions = () => ({
  ...authCookieBaseOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// REGISTER CONTROLLER
export const register = async (req, res, next) => {
  try {
    const { username, email, password, country } = req.body;
    const normalizedRole = resolveRole(req.body);

    if (!username || !email || !password) {
      return next(createError(400, "username, email and password are required."));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return next(createError(400, "User with this email or username already exists!"));
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hash,
      country: country || "",
      role: normalizedRole,
      isExpert: normalizedRole === "expert",
      isClient: normalizedRole === "client",
      isSeller: normalizedRole === "expert", // Legacy compatibility
    });

    await newUser.save();

    const token = signSessionToken(newUser);

    res
      .cookie(SESSION_COOKIE_NAME, token, authCookieOptions())
      .status(201)
      .json({ message: "User has been created.", user: toPublicUser(newUser) });
  } catch (err) {
    next(err);
  }
};

// LOGIN CONTROLLER
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    });

    if (!user) return next(createError(404, "User not found!"));

    if (!user.password) {
      return next(createError(400, "Please sign in with Google for this account."));
    }

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = signSessionToken(user);

    res
      .cookie(SESSION_COOKIE_NAME, token, authCookieOptions())
      .status(200)
      .json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
};

// GOOGLE OAUTH CALLBACK
export const googleCallback = async (req, res, next) => {
  try {
    const { googleId, email, name, picture } = req.user;

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (!user) {
      // Create new user from Google profile
      user = new User({
        googleId,
        email,
        username: email.split('@')[0] + '_' + Date.now().toString(36),
        img: picture,
        role: "client",
        isClient: true,
      });
      await user.save();
    } else if (!user.googleId) {
      // Link existing email account to Google
      user.googleId = googleId;
      if (!user.img) user.img = picture;
      await user.save();
    }

    const token = signSessionToken(user);

    res
      .cookie(SESSION_COOKIE_NAME, token, authCookieOptions());

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  } catch (err) {
    next(err);
  }
};

// GET CURRENT USER
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return next(createError(404, "User not found!"));

    res.status(200).json(toPublicUser(user));
  } catch (err) {
    next(err);
  }
};

// LOGOUT CONTROLLER
export const logout = async (req, res) => {
  res
    .clearCookie(SESSION_COOKIE_NAME, authCookieBaseOptions())
    // Clear the legacy cookie too so existing sessions are fully logged out.
    .clearCookie("accessToken", authCookieBaseOptions())
    .status(200)
    .json({ message: "User has been logged out." });
};
