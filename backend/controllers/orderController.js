import Razorpay from "razorpay";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Step 1: Place Order (Initiate Razorpay Order only)
const placeOrder = async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });



  const frontend_url = "http://localhost:5173";

  try {
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ success: false, message: "User not authenticated" });
    }

    // Calculate total amount (add ₹50 fee) and convert to paise
    const totalAmount = (req.body.amount + 50) * 100;

    const options = {
      amount: totalAmount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
      tempOrderData: {
        items: req.body.items,
        amount: req.body.amount,
        class: req.body.class,
      },
      frontendRedirectUrl: `${frontend_url}/verify?razorpayOrderId=${razorpayOrder.id}`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while placing order",
    });
  }
};

// Step 2: Verify Razorpay order and ONLY THEN save order to DB
const verifyOrder = async (req, res) => {
  const { razorpayOrderId, success, tempOrderData } = req.body;

  try {
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ success: false, message: "User not authenticated" });
    }

    if (success === "true") {
      // Create and save order in DB
      const newOrder = new orderModel({
        userId: req.user.userId,
        items: tempOrderData.items,
        amount: tempOrderData.amount,
        class: tempOrderData.class,
        payment: true,
      });

      await newOrder.save();

      // Clear user's cart
      await userModel.findByIdAndUpdate(req.user.userId, { cartData: {} });

      res.json({ success: true, message: "Payment Successful", orderId: newOrder._id });
    } else {
      // No order is saved
      res.json({ success: false, message: "Payment Failed. Order not created." });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

// Step 3: Fetch orders for the authenticated user
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// Step 4: Admin - list all orders
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Step 5: Admin - update order status
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
