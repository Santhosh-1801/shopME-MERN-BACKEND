import mongoose from "mongoose";

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter the product name"],
        maxLength:[200,"Product name cannot exceed more than 200 characters"],
    },
    price:{
        type:Number,
        required:[true,"Please enter the product price"],
        maxLength:[5,"Product price cannot exceed more than 5 digits"],
    },
    description:{
        type:String,
        required:[true,"Please enter the product description"],
    },
    ratings:{
        type:Number,
        default:0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    category:{
        type:String,
        required:[true,"Please enter the product category"],
        enum:{
            values: [
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                "Books",
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
             message:"Please select the product category"
        }
    },
    seller: {
        type: String,
        required: [true, "Please enter product seller"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxLength: [5, "Product name cannot exceed 5 characters"],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
 },
 {
    timestamps:true
 }
)

export default mongoose.model("Product",productSchema)