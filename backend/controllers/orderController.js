import Razorpay from "razorpay";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Place user order from frontend
const placeOrder = async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const frontend_url = "http://localhost:5173"; // URL for frontend

  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ success: false, message: "User not authenticated" });
    }

    // Create a new order document in your MongoDB
    const newOrder = new orderModel({
      userId: req.user.userId, // Use user._id from authenticated user
      items: req.body.items,
      amount: req.body.amount,
      class: req.body.class,
    });
    await newOrder.save();

    // Clear the user's cart data after placing the order
    await userModel.findByIdAndUpdate(req.user.userId, { cartData: {} });

    // Calculate total amount (Razorpay accepts the amount in paise)
    const totalAmount = (req.body.amount + 50) * 100; // Adding application charges (₹50) and converting to paise

    // Prepare Razorpay order options
    const options = {
      amount: totalAmount, // The total amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `${newOrder._id}`,
    };

    // Create the order on Razorpay
    const razorpayOrder = await razorpay.orders.create(options);

    // Send the order details and redirect URL to the frontend
    res.json({
      success: true,
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
      frontendRedirectUrl: `${frontend_url}/verify?orderId=${newOrder._id}&razorpayOrderId=${razorpayOrder.id}`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while placing order",
    });
  }
};

// Verify Razorpay order and update order status
const verifyOrder = async (req, res) => {
  const { orderId, razorpayOrderId, success } = req.body;
  try {
    if (success === "true") {
      // Mark order as paid
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      // Delete the order if payment failed
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

// Fetch orders of the user for the frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// Admin: List all orders
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Admin: Update order status
const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated", data: updatedOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
