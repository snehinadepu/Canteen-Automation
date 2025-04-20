import React, { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Orders = ({ url, adminToken }) => {
  const [orders, setOrders] = useState([]);

  // Fetch all orders
  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + '/api/order/list', {
        headers: {
          Authorization: `Bearer ${adminToken}`, // Pass the admin token for authorization
        }
      });
      if (response.data.success) {
        setOrders(response.data.data); // Use `.data` not `.orders`
        console.log(response.data.data);
      } else {
        toast.error('Error fetching orders');
      }
    } catch (error) {
      toast.error('Error connecting to server');
      console.error(error);
    }
  };

  // Update order status
  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;

    try {
      const response = await axios.post(
        url + '/api/order/status',
        {
          orderId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`, // Pass admin token for authentication
          }
        }
      );

      if (response.data.success) {
        toast.success('Order status updated');
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )); // Update the status locally
      } else {
        toast.error('Error updating order status');
      }
    } catch (error) {
      toast.error('Error updating order status');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []); // Fetch orders on component mount

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="Order" />
            <div>
              <p className="order-item-food">
                {order.items
                  .map((item) => `${item.name} x ${item.quantity}`)
                  .join(', ')}
              </p>
              <p className="order-item-name">
                {order.address?.firstName + " " + order.address?.lastName || "N/A"} {/* Handle undefined address */}
              </p>
              <div className="order-item-address">
                <p>{order.address?.department + ',' || 'N/A'}</p>
                <p>
                  {order.address?.section + ',' + order.address?.rollNumber + ',' + order.address?.year || 'N/A'}
                </p>
              </div>
              <p className="order-item-phone">{order.address?.phoneNumber || 'N/A'}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>₹{order.amount}</p>
            <select
              onChange={(e) => statusHandler(e, order._id)} // Pass the new status to the backend
              value={order.status}
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Food Given">Food Given</option>
              {/* Add other status options as needed */}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
