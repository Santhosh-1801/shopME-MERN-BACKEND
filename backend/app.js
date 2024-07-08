import express from "express"

const app=express()
import dotenv from "dotenv"
import productRoutes from "./routes/productRoute.js"
import authRoutes from "./routes/auth.js"
import orderRoutes from "./routes/order.js"
import cookieParser from "cookie-parser"
import { connectDatabase } from "./config/dbConfig.js"
import errorMiddleware from "../backend/middlewares/error.js"


process.on('uncaughtException',(err)=>{
    console.log(`ERROR: ${err}`);
    console.log("Shutting down due to uncaught exception");
    process.exit(1)
})

dotenv.config({path:"backend/config/config.env"})

connectDatabase();
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1",productRoutes)
app.use("/api/v1",authRoutes) 
app.use("/api/v1",orderRoutes)
app.use(errorMiddleware)

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server started on port:${process.env.PORT} in ${process.env.NODE_ENV} mode`)
})
process.on('unhandledRejection',(err)=>{
    console.log(`ERROR:${err}`)
    console.log('Shutting down due to Unhandled Promise Rejection')
    server.close(()=>{
        process.exit(1)
    })
})