import React, { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + '/api/order/list');
      if (response.data.success) {
        setOrders(response.data.data); // use `.data` not `.orders`
        console.log(response.data.data);
      } else {
        toast.error('Error fetching orders');
      }
    } catch (error) {
      toast.error('Error connecting to server');
      console.error(error);
    }
  };

  const statusHandler = async(e,orderId) => {
    const response = await axios.post(url+'/api.order/status',{
      orderId,
      status:e.target.value
    })
    if(response.data.success){
      await fetchAllOrders();
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items
                  .map((item) => `${item.name} x ${item.quantity}`)
                  .join(', ')}
              </p>
              <p className="order-item-name">{order.address.firstName+" "+order.address.lastName}</p>
              <div className="order-item-address">
                <p>{order.address.department+','}</p>
                <p>{order.address.section+','+order.address.rollNumber+','+order.address.year}</p>
              </div>
              <p className='order-item-phone'>{order.address.phoneNumber}</p>
            </div>
            <p>Items : {order.items.length}</p>
            <p>₹{order.amount}</p>
            <select onChange={(e)=>statusHandler(e,order._id)} value={order.status}>
              <option value="Food Processig">Food Processig</option>
              <option value="Food Given">Food Given</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
