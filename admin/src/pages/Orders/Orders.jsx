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
        // Sort orders by creation time (descending order)
        const sortedOrders = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders); // Use the sorted order list
        console.log(sortedOrders); // Debugging log
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
                {order.items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}
              </p>
              <p className="order-item-name">
                {order.class?.firstName + " " + order.class?.lastName || "N/A"}
              </p>
              <div className="order-item-address">
                <p>{order.class?.department + ',' || 'N/A'}</p>
                <p>
                  {order.class?.section + ', ' + order.class?.rollNumber + ', ' + order.class?.year || 'N/A'}
                </p>
              </div>
              <p className="order-item-phone">{order.class?.phoneNumber || 'N/A'}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>₹{order.amount+50}</p>
            <select
              onChange={(e) => statusHandler(e, order._id)}
              value={order.status}
            >
              <option value="Order Received">Order Received</option>
              <option value="Food Processing">Food Processing</option>
              <option value="Food Given">Food Given</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
