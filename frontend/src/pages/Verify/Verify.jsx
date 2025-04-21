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
          navigate("/myorders");
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Error verifying payment", err);
        navigate("/");
      }
    };

    if (success === "true") {
      verifyPayment();
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div className='verify'>
      <div className="spinner">Verifying payment...</div>
    </div>
  );
};

export default Verify;
