import React, { useContext, useState, useEffect } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rollNumber: "",
    year: "",
    department: "",
    section: "",
    phoneNumber: "",
  });

  const loadRazorpay = async (orderDetails) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderDetails.amount,
        currency: orderDetails.currency,
        name: "Your App",
        order_id: orderDetails.razorpayOrderId,
        handler: async function (response) {
          try {
            // Call the verify endpoint with tempOrderData
            await axios.post(`${url}/api/order/verify`, {
              razorpayOrderId: orderDetails.razorpayOrderId,
              success: "true",
              tempOrderData: orderDetails.tempOrderData
            }, {
              headers: { token }
            });

            navigate("/verify?success=true");
          } catch (err) {
            console.error("Verification failed", err);
            navigate("/verify?success=false");
          }
        },
        prefill: {
          name: data.firstName + " " + data.lastName,
          email: data.email,
          contact: data.phoneNumber,
        },
        theme: {
          color: "#528FF0",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    script.onerror = () => {
      alert("Razorpay SDK failed to load. Are you online?");
    };

    document.body.appendChild(script);
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("You need to be logged in to place an order.");
      navigate("/login");
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    const orderData = {
      items: orderItems,
      amount: getTotalCartAmount(),
      class: data,
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token },
      });

      if (response.data.success) {
        // Attach tempOrderData to be used in /verify
        response.data.tempOrderData = orderData;
        loadRazorpay(response.data);
      } else {
        console.error("Order creation failed", response.data);
        alert("Order creation failed");
      }
    } catch (error) {
      console.error("Place order error:", error.response?.data || error.message);
      alert("An error occurred while placing the order.");
    }
  };

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
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
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email' />
        <input required name='rollNumber' onChange={onChangeHandler} value={data.rollNumber} type="text" placeholder='Roll Number' />
        <div className="multi-fields">
          <input required name='year' onChange={onChangeHandler} value={data.year} type="text" placeholder='Year' />
          <input required name='department' onChange={onChangeHandler} value={data.department} type="text" placeholder='Department' />
        </div>
        <div className="multi-fields">
          <input required name='section' onChange={onChangeHandler} value={data.section} type="text" placeholder='Section' />
          <input required name='phoneNumber' onChange={onChangeHandler} value={data.phoneNumber} type="text" placeholder='Phone Number' />
        </div>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Sub Total</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Application Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 50}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 50}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAY</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
