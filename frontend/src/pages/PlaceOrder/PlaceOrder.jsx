import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {

  const navigate= useNavigate();


  const { getTotalCartAmount , token , food_list , cartItems , url } = useContext(StoreContext)

  const [data,setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    rollNumber:"",
    year:"",
    department:"",
    section:"",
    phoneNumber:""
  })

  const placeOrder = async (e) => {
    e.preventDefault()
    let orderItems = []
    food_list.map((item)=>{
      if(cartItems[item._id]>0){
        let itemInfo = item
        itemInfo["quantity"] = cartItems[item._id]
        orderItems.push(itemInfo)
      }
    })
    let orderData = {
      address:data,
      items:orderItems,
      amount:getTotalCartAmount()+50
    }
    let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}})
    if(response.data.success){
      const {session_url} = response.data
      window.location.replace(session_url)
    }
    else{
      alert("Error")
    }
  }

  const onChangeHandler = (e) => {
    const name = e.target.name
    const value = e.target.value
    setData(data=>({...data,[name]:value}))
  }

  useEffect(()=>{
    if(!token){
      navigate('/cart')
    }else if(getTotalCartAmount===0){
      navigate('/cart')
    }
  },[token])

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
  )
}

export default PlaceOrder
