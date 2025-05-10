import React, { useEffect } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const razorpay_order_id = searchParams.get("razorpayOrderId");
  const razorpay_payment_id = searchParams.get("razorpayPaymentId");
  const razorpay_signature = searchParams.get("razorpaySignature");
  const success = searchParams.get("success");

  const tempOrderData = JSON.parse(localStorage.getItem("tempOrderData"));

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await axios.post("/api/orders/verify", {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          tempOrderData,
        });

        if (res.data.success) {
          localStorage.removeItem("tempOrderData");
          // Navigate to the "my orders" page after successful payment
          navigate("/myorders");
        } else {
          // If payment verification fails, navigate back to the homepage
          navigate("/");
        }
      } catch (err) {
        console.error("Error verifying payment", err);
        // In case of an error, navigate to homepage or show error message
        navigate("/");
      }
    };

    // Only try verifying the payment if success is true
    if (success === "true") {
      verifyPayment();
    } else {
      navigate("/"); // If success is false or undefined, navigate to homepage
    }
  }, [razorpay_order_id, razorpay_payment_id, razorpay_signature, success, navigate, tempOrderData]);

  return (
    <div className='verify'>
      <div className="spinner">Verifying payment...</div>
    </div>
  );
};

export default Verify;
