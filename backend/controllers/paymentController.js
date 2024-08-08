import Stripe from "stripe";
import catchAsyncError from "../middlewares/catchAsyncError.js";
const stripe=Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeCheckoutSession=catchAsyncError(async(req,res,next)=>{


    const body=req?.body;

    const line_items=body?.orderItems?.map((item)=>{
        return{
            price_data:{
                currency:"usd",
                product_data:{
                    name:item?.name,
                    images:[item?.image],
                    metadata:{productId:item?.product},
                },
                unit_amount:item?.price*100
            },
            tax_rates:["txr_1PlUa407cG9q8vftjCxP2ZKn"],
            quantity:item?.quantity,
        }
    })

    const shippingInfo=body?.shippingInfo

    const shipping_rate=body?.itemsPrice>=200?"shr_1PlUIA07cG9q8vftGSopOrEj":"shr_1PlUJC07cG9q8vftWBP9m36J"

    const session=await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        success_url:`${process.env.FRONTEND_URL}/me/orders`,
        cancel_url:`${process.env.FRONTEND_URL}`,
        customer_email:req?.user?.email,
        client_reference_id:req?.user?._id?.toString(),
        mode:"payment",
        metadata:{
            ...shippingInfo,
            itemsPrice:body?.itemsPrice
        },
        shipping_options:[{
            shipping_rate
        }],
        line_items,
    });

    console.log(session)

    res.status(200).json({
        url:session?.url
    })
})