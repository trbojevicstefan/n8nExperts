import Service from "../models/service.model.js";
import createError from "../utils/createError.js";

// Create a new service (experts only)
export const createService = async (req, res, next) => {
    if (!req.isSeller && !req.isExpert) {
        return next(createError(403, "Only n8n Experts can create services!"));
    }

    const required = ["title", "desc", "price", "cover", "shortTitle", "shortDesc", "deliveryTime", "serviceType"];
    const missing = required.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === "");
    if (missing.length > 0) {
        return next(createError(400, `Missing required fields: ${missing.join(", ")}`));
    }

    const newService = new Service({
        userId: req.userId,
        ...req.body,
        category: "n8n Automation", // Always hardcoded
    });

    try {
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (err) {
        next(err);
    }
};

// Delete a service
export const deleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return next(createError(404, "Service not found!"));
        }
        if (service.userId.toString() !== req.userId) {
            return next(createError(403, "You can only delete your own services!"));
        }

        await Service.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Service has been deleted!" });
    } catch (err) {
        next(err);
    }
};

// Get single service
export const getService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return next(createError(404, "Service not found!"));
        }
        res.status(200).json(service);
    } catch (err) {
        next(err);
    }
};

// Get all services with filters
export const getServices = async (req, res, next) => {
    const q = req.query;

    const filters = {
        isActive: true,
        // Category is always n8n Automation, no filter needed
        ...(q.userId && { userId: q.userId }),
        ...(q.serviceType && { serviceType: q.serviceType }),
        ...(q.complexity && { workflowComplexity: q.complexity }),
        ...((q.min || q.max) && {
            price: {
                ...(q.min && { $gte: parseInt(q.min) }),
                ...(q.max && { $lte: parseInt(q.max) }),
            },
        }),
        ...(q.search && {
            $or: [
                { title: { $regex: q.search, $options: "i" } },
                { shortTitle: { $regex: q.search, $options: "i" } },
                { desc: { $regex: q.search, $options: "i" } },
                { tags: { $in: [new RegExp(q.search, 'i')] } },
            ]
        }),
    };

    try {
        const page = parseInt(q.page) || 1;
        const limit = parseInt(q.limit) || 12;
        const skip = (page - 1) * limit;

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            popular: { sales: -1 },
            priceAsc: { price: 1 },
            priceDesc: { price: -1 },
            rating: { totalStars: -1 },
        };

        const sort = sortOptions[q.sort] || sortOptions.newest;

        const services = await Service.find(filters)
            .skip(skip)
            .limit(limit)
            .sort(sort);

        const total = await Service.countDocuments(filters);

        res.status(200).json({
            services,
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

// Update a service
export const updateService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return next(createError(404, "Service not found!"));
        }
        if (service.userId.toString() !== req.userId) {
            return next(createError(403, "You can only update your own services!"));
        }

        // Prevent changing category
        delete req.body.category;

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.status(200).json(updatedService);
    } catch (err) {
        next(err);
    }
};

// Get featured services for homepage
export const getFeaturedServices = async (req, res, next) => {
    try {
        const services = await Service.find({ isActive: true })
            .sort({ sales: -1, totalStars: -1 })
            .limit(8);

        res.status(200).json(services);
    } catch (err) {
        next(err);
    }
};

// Get services by expert
export const getExpertServices = async (req, res, next) => {
    try {
        const services = await Service.find({
            userId: req.params.userId,
            isActive: true
        }).sort({ createdAt: -1 });

        res.status(200).json(services);
    } catch (err) {
        next(err);
    }
};
