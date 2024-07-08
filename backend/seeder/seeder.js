import Product from "../models/product.js"
import products from "../seeder/data.js"
import mongoose from "mongoose";

const seedProducts=async()=>{
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/shopme");
        await Product.deleteMany();

        console.log("Products are deleted");

        await Product.insertMany(products);
        console.log("Products are inserted");

        process.exit();

    } catch (error) {
        console.log(error);
        process.exit();
    }
}
seedProducts()