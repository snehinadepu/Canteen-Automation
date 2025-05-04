import React, { useContext, useState, useEffect } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", rollNumber: "", year: "",
    department: "", section: "", phoneNumber: "",
  });

  // Load Razorpay script and initialize payment
  const loadRazorpay = async (orderDetails) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Razorpay key ID
        amount: orderDetails.amount, // Order amount
        currency: orderDetails.currency, // Currency (INR)
        name: "Your App",
        order_id: orderDetails.razorpayOrderId,
        handler: async function (response) {
          const tempOrderData = orderDetails.tempOrderData;

          try {
            // Verify payment with Razorpay
            const verifyRes = await axios.post(
              `${url}/api/order/verify`,
              {
                success: "true",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                tempOrderData, // Pass the complete order data to the backend
              },
              {
                headers: { token },
              }
            );

            if (verifyRes.data.success) {
              alert("Payment successful! Order placed.");
              localStorage.removeItem("tempOrderData");
              navigate("/myorders"); // Redirect to orders page
            } else {
              alert("Payment verified but order not saved.");
            }
          } catch (error) {
            console.error("Verify error:", error);
            alert("Error verifying payment and saving order.");
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phoneNumber,
        },
        theme: {
          color: "#528FF0",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open(); // Open Razorpay payment modal
    };

    script.onerror = () => {
      alert("Razorpay SDK failed to load. Are you online?");
    };

    document.body.appendChild(script); // Append the script to the DOM
  };

  // Place order function
  const placeOrder = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    const orderData = {
      items: orderItems,
      amount: getTotalCartAmount(),
      class: data, // User's details
    };

    try {
      const res = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token },
      });

      if (res.data.success) {
        res.data.tempOrderData = orderData; // Pass the order data to Razorpay
        loadRazorpay(res.data); // Load Razorpay with the order details
      } else {
        alert("Order creation failed");
      }
    } catch (err) {
      console.error("Place order error:", err);
      alert("Error placing order");
    }
  };

  // Handle input changes for user's data
  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className='title'>Order Info</p>
        <div className="multi-fields">
          <input required name='firstName' value={data.firstName} onChange={onChangeHandler} placeholder='First Name' />
          <input required name='lastName' value={data.lastName} onChange={onChangeHandler} placeholder='Last Name' />
        </div>
        <input required name='email' value={data.email} onChange={onChangeHandler} type='email' placeholder='Email' />
        <input required name='rollNumber' value={data.rollNumber} onChange={onChangeHandler} placeholder='Roll Number' />
        <div className="multi-fields">
          <input required name='year' value={data.year} onChange={onChangeHandler} placeholder='Year' />
          <input required name='department' value={data.department} onChange={onChangeHandler} placeholder='Department' />
        </div>
        <div className="multi-fields">
          <input required name='section' value={data.section} onChange={onChangeHandler} placeholder='Section' />
          <input required name='phoneNumber' value={data.phoneNumber} onChange={onChangeHandler} placeholder='Phone Number' />
        </div>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div className="cart-total-details"><p>Sub Total</p><p>₹{getTotalCartAmount()}</p></div>
          <hr />
          <div className="cart-total-details"><p>Application Fee</p><p>₹{getTotalCartAmount() === 0 ? 0 : 50}</p></div>
          <hr />
          <div className="cart-total-details"><b>Total</b><b>₹{getTotalCartAmount() + 50}</b></div>
          <button type='submit'>PROCEED TO PAY</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
