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
    const order=await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHandler("No order found for this id",404))
    }
    res.status(200).json({
        order
    })
})
export const myOrderDetails=catchAsyncError(async(req,res,next)=>{
    const myOrders=await Order.find({
        user:req.user._id
    });
    res.status(200).json({
        myOrders
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
    let productNotFound=false

    for(const item of orders.orderItems){
        const product=await Product.findById(item?.product?.toString())
        if(!product){
            productNotFound=true
            break;
        } 
        product.stock=product.stock-item.quantity;
        await product.save({
            validateBeforeSave:false
        })
    };

    if(productNotFound){
        return next(new ErrorHandler("No product found with one or more IDs.",404))
    }

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

async function getSalesData(startDate,endDate){
    const salesData=await Order.aggregate([
        {
            $match:{
                createdAt:{
                    $gte:new Date(startDate),
                    $lte:new Date(endDate)
                }
            }
        },
        {
            $group:{
                _id:{
                    date:{
                        $dateToString:{
                            format:"%Y-%m-%d",
                            date:"$createdAt"
                        }
                    }
                },
                totalSales:{
                    $sum:'$totalAmount'
                },
                numOrders:{
                    $sum:1
                }
            }
        }
    ])

    const salesMap=new Map()
    let totalSales=0;
    let totalNumOrders=0;

    console.log(salesData)

    salesData.forEach((entry)=>{
        const date=entry?._id.date;
        const sales=entry?.totalSales;
        const numOrders=entry?.numOrders;

        salesMap.set(date,{sales,numOrders})
        totalSales+=sales
        totalNumOrders+=numOrders
    });

    const datesBetween=getDatesBetween(startDate,endDate);

    const finalSalesData=datesBetween.map((date)=>({
        date,
        sales:(salesMap.get(date)|| {sales:0}).sales,
        numOrders:(salesMap.get(date)||{numOrders:0}).numOrders,
    }));

    return {salesData:finalSalesData,totalSales,totalNumOrders}
}

function getDatesBetween(startDate,endDate){
    const dates=[]
    let currentDate=new Date(startDate)

    while(currentDate<=new Date(endDate)){
        const formattedDate=currentDate.toISOString().split("T")[0];
        dates.push(formattedDate)
        currentDate.setDate(currentDate.getDate()+1)
    }
    return dates;
}

export const getSales=catchAsyncError(async(req,res,next)=>{
    const startDate=new Date(req.query.startDate);
    const endDate=new Date(req.query.endDate);


    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(23,59,59,999);

    const {salesData,totalSales,totalNumOrders}=await getSalesData(startDate,endDate)

    res.status(200).json({
        sales:salesData,totalSales,totalNumOrders
    })

})