import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import Order from "../models/order.model.js";
import createError from "../utils/createError.js";

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.isAdmin) {
            return next(createError(403, "Admin access required!"));
        }
        next();
    } catch (err) {
        next(err);
    }
};

// Get all pending expert verifications
export const getPendingExperts = async (req, res, next) => {
    try {
        const pendingExperts = await User.find({
            isExpert: true,
            isVerified: false
        }).select('-password');

        res.status(200).json(pendingExperts);
    } catch (err) {
        next(err);
    }
};

// Get all verified experts
export const getVerifiedExperts = async (req, res, next) => {
    try {
        const verifiedExperts = await User.find({
            isExpert: true,
            isVerified: true
        }).select('-password');

        res.status(200).json(verifiedExperts);
    } catch (err) {
        next(err);
    }
};

// Verify an expert
export const verifyExpert = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, "User not found!"));
        }

        if (!user.isExpert) {
            return next(createError(400, "User is not an expert!"));
        }

        user.isVerified = true;
        user.verifiedAt = new Date();
        await user.save();

        res.status(200).json({
            message: "Expert verified successfully!",
            user: { ...user._doc, password: undefined }
        });
    } catch (err) {
        next(err);
    }
};

// Revoke expert verification
export const revokeVerification = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, "User not found!"));
        }

        user.isVerified = false;
        user.verifiedAt = null;
        await user.save();

        res.status(200).json({
            message: "Expert verification revoked!",
            user: { ...user._doc, password: undefined }
        });
    } catch (err) {
        next(err);
    }
};

// Get platform stats
export const getPlatformStats = async (req, res, next) => {
    try {
        const totalExperts = await User.countDocuments({ isExpert: true });
        const verifiedExperts = await User.countDocuments({ isExpert: true, isVerified: true });
        const totalClients = await User.countDocuments({ isClient: true, isExpert: false });
        const totalServices = await Service.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ isCompleted: true });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { isCompleted: true } },
            { $group: { _id: null, total: { $sum: "$platformFee" } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        res.status(200).json({
            totalExperts,
            verifiedExperts,
            pendingExperts: totalExperts - verifiedExperts,
            totalClients,
            totalServices,
            totalOrders,
            completedOrders,
            totalRevenue,
        });
    } catch (err) {
        next(err);
    }
};

// Get all users (paginated)
export const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.status(200).json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        });
    } catch (err) {
        next(err);
    }
};

// Toggle admin status
export const toggleAdmin = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Prevent self-demotion
        if (userId === req.userId) {
            return next(createError(400, "Cannot modify your own admin status!"));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, "User not found!"));
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.status(200).json({
            message: `Admin status ${user.isAdmin ? 'granted' : 'revoked'}!`,
            user: { ...user._doc, password: undefined }
        });
    } catch (err) {
        next(err);
    }
};
