require('dotenv').config()
const express = require('express')
const Razorpay = require('razorpay')
const router  = express.Router()
const userModel = require('../models/users')
const auth = require('../passport-auth')

const razorpayInstance = new Razorpay({
  key_id:process.env.RAZORPAY_ID_KEY,
  key_secret:process.env.RAZORPAY_SECRET_KEY
})

router.post('/createOrder', auth ,async (req,res)=> {
  try {
    const username = req.user.username
    const userDets = await userModel.findOne({username})
    const amount = req.body.amount*100; 

    const options = {
      amount:amount,
      currency: 'INR',
      receipt:`receipt_order_${Date.now()}`
    }
    razorpayInstance.orders.create(options, function(err, order){
      if(!err){
        res.status(200).send({
          success:true,
          msg:'Order Created',
          order_id:order.id,
          amount:amount,
          key_id:process.env.RAZORPAY_ID_KEY,
          product_name:req.body.name,
          description:req.body.description,
          contact:`${userDets.phone}`,
          name:`${userDets.fullName}`,
          email:`${userDets.email}`
        });
      }else{
        res.status(400).send({success:false, msg:'Something went wrong'})
      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({success:false, msg:'Server Error'})
  }
})

module.exports = router
