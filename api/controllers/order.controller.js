import createError from "../utils/createError.js";
import Order from "../models/order.model.js";
import Service from "../models/service.model.js";
import User from "../models/user.model.js";
import Stripe from "stripe";

// Create payment intent and order
export const createPaymentIntent = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(createError(404, "Service not found!"));
    }

    const expert = await User.findById(service.userId);
    if (!expert) {
      return next(createError(404, "Expert not found!"));
    }

    // Calculate platform fee (15%)
    const amount = service.price * 100; // Convert to cents
    const platformFeeAmount = Math.round(amount * 0.15);
    const expertPayoutAmount = amount - platformFeeAmount;

    let paymentIntentData = {
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        serviceId: service._id.toString(),
        clientId: req.userId,
        expertId: service.userId,
      },
    };

    // If expert has Stripe Connect, set up split payment
    if (expert.stripeConnectAccountId && expert.stripeConnectOnboarded) {
      paymentIntentData.transfer_data = {
        destination: expert.stripeConnectAccountId,
        amount: expertPayoutAmount,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    // Create order record
    const newOrder = new Order({
      serviceId: service._id,
      img: service.cover,
      title: service.title,
      clientId: req.userId,
      expertId: service.userId,
      price: service.price,
      payment_intent: paymentIntent.id,
      platformFee: service.price * 0.15,
      expertPayout: service.price * 0.85,
      serviceType: service.serviceType,
      ...(req.body.requirements && { requirements: req.body.requirements }),
      ...(req.body.consultationDate && { consultationDate: new Date(req.body.consultationDate) }),
      ...(service.consultationDuration && { consultationDuration: service.consultationDuration }),
    });

    await newOrder.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      orderId: newOrder._id,
    });
  } catch (err) {
    next(err);
  }
};

// Confirm order after successful payment
export const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { payment_intent: req.body.payment_intent },
      {
        $set: {
          status: 'accepted',
        },
      },
      { new: true }
    );

    if (!order) {
      return next(createError(404, "Order not found!"));
    }

    // Increment service sales
    await Service.findByIdAndUpdate(order.serviceId, {
      $inc: { sales: 1 },
    });

    res.status(200).json({ message: "Order confirmed!", order });
  } catch (err) {
    next(err);
  }
};

// Get orders for current user
export const getOrders = async (req, res, next) => {
  try {
    const query = req.isExpert || req.isSeller
      ? { expertId: req.userId }
      : { clientId: req.userId };

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// Get single order
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(createError(404, "Order not found!"));
    }

    // Verify user is part of this order
    if (order.clientId !== req.userId && order.expertId !== req.userId) {
      return next(createError(403, "Not authorized to view this order!"));
    }

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(createError(404, "Order not found!"));
    }

    // Only expert can update to in_progress or delivered
    if (['in_progress', 'delivered'].includes(req.body.status)) {
      if (order.expertId !== req.userId) {
        return next(createError(403, "Only the expert can update to this status!"));
      }
    }

    // Only client can mark as completed
    if (req.body.status === 'completed') {
      if (order.clientId !== req.userId) {
        return next(createError(403, "Only the client can mark as completed!"));
      }
      order.isCompleted = true;
      order.completedAt = new Date();

      // Update expert stats
      await User.findByIdAndUpdate(order.expertId, {
        $inc: {
          completedProjects: 1,
          totalEarnings: order.expertPayout,
        },
      });
    }

    order.status = req.body.status;
    if (req.body.status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({ message: "Order status updated!", order });
  } catch (err) {
    next(err);
  }
};

// Add deliverables to order
export const addDeliverables = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(createError(404, "Order not found!"));
    }

    if (order.expertId !== req.userId) {
      return next(createError(403, "Only the expert can add deliverables!"));
    }

    if (req.body.deliverables) {
      order.deliverables = [...(order.deliverables || []), ...req.body.deliverables];
    }
    if (req.body.workflowJson) {
      order.workflowJsonDelivered = req.body.workflowJson;
    }
    if (req.body.notes) {
      order.notes = req.body.notes;
    }

    await order.save();

    res.status(200).json({ message: "Deliverables added!", order });
  } catch (err) {
    next(err);
  }
};

// Stripe Connect onboarding URL
export const createConnectAccount = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    let accountId = user.stripeConnectAccountId;

    if (!accountId) {
      // Create new Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });
      accountId = account.id;
      user.stripeConnectAccountId = accountId;
      await user.save();
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/dashboard/connect?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/dashboard/connect?success=true`,
      type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });
  } catch (err) {
    next(err);
  }
};

// Check Connect account status
export const getConnectStatus = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const user = await User.findById(req.userId);
    if (!user || !user.stripeConnectAccountId) {
      return res.status(200).json({ connected: false });
    }

    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);

    const isOnboarded = account.charges_enabled && account.payouts_enabled;

    if (isOnboarded && !user.stripeConnectOnboarded) {
      user.stripeConnectOnboarded = true;
      await user.save();
    }

    res.status(200).json({
      connected: true,
      onboarded: isOnboarded,
      accountId: user.stripeConnectAccountId,
    });
  } catch (err) {
    next(err);
  }
};
