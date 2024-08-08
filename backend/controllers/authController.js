import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/user.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
import { getResetPasswordTemplate } from "../utils/emailTemplate.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendMail.js";
import sendToken from "../utils/sendToken.js";
import crypto from "crypto"

export const registerUser=catchAsyncError(async(req,res,next)=>{
    const {name,email,password}=req.body;

    const user=await User.create({
        name,email,password
    })

    sendToken(user,201,res)
});

export const loginUser=catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please enter email && password",400))
    }

    const user=await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401))
    }

    const isPasswordMatched=await user.comparePassword(password)

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401))
    }

    sendToken(user,200,res)
});

export const logout=catchAsyncError(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        message:"Logged Out"
    })
})

export const forgotPassword=catchAsyncError(async(req,res,next)=>{
    
    const user=await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User not found with this email",404))
    }

    const resetToken=user.getResetPasswordToken()

    await user.save();


    const resetUrl=`${process.env.FRONTEND_URL}/password/reset/${resetToken}`


    const message=getResetPasswordTemplate(user?.name,resetUrl);


    try {
        await sendEmail({
            email:user.email,
            subject:"ShopMe Password Recovery",
            message
        });
        res.status(200).json({
            message:`Email sent to: ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined

        await user.save()
        return next(new ErrorHandler(error?.message,500))

    }

});

export const resetPassword=catchAsyncError(async(req,res,next)=>{
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest('hex')

    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now()
        }
    })
    if(!user){
        return next(new ErrorHandler("Password reset token is invalid or has been expired",400))
    }
    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400))
    }
    user.password=req.body.password;

    user.resetPasswordToken=undefined
    user.resetPasswordExpire=undefined

    await user.save()


    sendToken(user,200,res)
})


export const getUserProfile=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req?.user?._id);

    res.status(200).json({
        user
    })
})
export const updatePassword=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req?.user?._id).select("+password");


    const isPasswordMatched=await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect",400))
    }

    user.password=req.body.password;
    user.save()


    res.status(200).json({
        success:true
    })
})

export const updateProfile=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }
    const user=await User.findByIdAndUpdate(req.user._id,newUserData,{
        new:true
    })
    res.status(200).json({
        user
    })
})

export const allUsers=catchAsyncError(async(req,res,next)=>{
    
    const users=await User.find();


    res.status(200).json({
        users
    })
})

export const getUserDetails=catchAsyncError(async(req,res,next)=>{
    
    const user=await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`,404))
    }


    res.status(200).json({
        user
    })
})

export const updateUser=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true
    })
    res.status(200).json({
        user
    })
})

export const deleteUser=catchAsyncError(async(req,res,next)=>{
    
    const user=await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`,404))
    }

    await user.deleteOne()


    res.status(200).json({
        success:true
    })
})

export const uploadAvatar=catchAsyncError(async(req,res,next)=>{
    
    const avatarResponse=await upload_file(req.body.avatar,"ShopME/avatar")

    if(req?.user?.avatar?.url){
        await delete_file(req?.user?.avatar?.public_id)
    }

    const user=await User.findByIdAndUpdate(req?.user?._id,{
        avatar:avatarResponse
    })

    res.status(200).json({
        user
    })
})

