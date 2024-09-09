import express from "express"
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { stripeCheckoutSession, stripeWebHook } from "../controllers/paymentController.js";
const router=express.Router();

router.route("/payment/checkout_session").post(isAuthenticatedUser,stripeCheckoutSession)
router.route("/payment/webhook").post(stripeWebHook)

export default router;
