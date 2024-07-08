import catchAsyncError from "../middlewares/catchAsyncError.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";


export const newOrder=catchAsyncError(async(req,res,next)=>{

    const {orderItems,shippingInfo,itemsPrice,taxAmount,shippingAmount,totalAmount,paymentMethod,paymentInfo}=req.body

    const order=await Order.create({
        orderItems,shippingInfo,itemsPrice,taxAmount,shippingAmount,totalAmount,paymentMethod,paymentInfo,user:req.user._id
    })

    res.status(200).json({
        order
    })



})

export const getOrderDetails=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.findById(req.params.id).populate("user","name email");

    if(!orders){
        return next(new ErrorHandler("No order found for this id",404))
    }
    res.status(200).json({
        orders
    })
})
export const myOrderDetails=catchAsyncError(async(req,res,next)=>{
    const myOrder=await Order.find({
        user:req.user._id
    });
    res.status(200).json({
        myOrder
    })
})


export const allOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find()

    res.status(200).json({
        orders
    })
})


export const updateOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.findById(req.params.id);

    if(!orders){
        return next(new ErrorHandler("No order found for this id",404))
    }  
    if(orders?.orderStatus === "Delivered"){
        return next(new ErrorHandler("Your order is already delivered",400))
    }

    orders?.orderItems?.forEach(async(item)=>{
        const product=await Product.findById(item?.product?.toString())
        if(!product){
            return next(new ErrorHandler("No product found for this id",404))
        } 
        product.stock=product.stock-item.quantity;
        await product.save({
            validateBeforeSave:false
        })
    });

    orders.orderStatus=req.body.status
    orders.deliveredAt=Date.now()


    await orders.save();

    res.status(200).json({
        success:true
    })
})

export const deleteOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("No order found for this id",404))
    }
    await order.deleteOne()
    res.status(200).json({
        success:true
    })
})