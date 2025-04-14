import userModel from "../models/userModel.js";

// add items to user cart
const addToCart = async (req, res) => {
    try {
      const userData = await userModel.findById(req.user.userId);  // Use req.user.userId
      if (!userData) {
        return res.json({ success: false, message: "User not found" });
      }
  
      let cartData = userData.cartData || {};  // Ensure cartData is always an object
      if (!cartData[req.body.itemId]) {
        cartData[req.body.itemId] = 1;
      } else {
        cartData[req.body.itemId] += 1;
      }
  
      await userModel.findByIdAndUpdate(req.user.userId, { cartData });  // Update cart data
  
      res.json({ success: true, message: "Added to Cart" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" });
    }
  };
  

// remove from cart
const removeFromCart = async (req, res) => {
    try {
      // Retrieve the user based on the decoded user ID from the token
      const userData = await userModel.findById(req.user.userId);
  
      // Check if user data exists
      if (!userData) {
        return res.json({ success: false, message: "User not found" });
      }
  
      // If user has cartData, proceed
      let cartData = userData.cartData || {}; // Ensure cartData is an object
  
      // Check if the item exists in the cart
      if (cartData[req.body.itemId] > 1) {
        cartData[req.body.itemId] -= 1;  // Decrease item quantity
      } else {
        delete cartData[req.body.itemId];  // Remove the item if quantity is 1
      }
  
      // Update the user's cartData in the database
      await userModel.findByIdAndUpdate(req.user.userId, { cartData });
  
      res.json({ success: true, message: "Removed from Cart" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error occurred" });
    }
  };
  

// fetch user cart data
const getCart = async (req, res) => {
    try {
      // Now using req.user.userId instead of req.body.userId
      const userId = req.user.userId;
  
      let userData = await userModel.findById(userId);
      if (!userData) {
        return res.json({ success: false, message: "User not found" });
      }
  
      let cartData = userData.cartData;
      res.json({ success: true, cartData });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" });
    }
  };
  
  
  

export { addToCart, removeFromCart, getCart };