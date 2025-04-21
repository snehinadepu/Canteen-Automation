import React, { useEffect } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (success === "true") {
        navigate("/myorders");
      } else {
        navigate("/");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='verify'>
      <div className="spinner">Verifying payment...</div>
    </div>
  );
};

export default Verify;