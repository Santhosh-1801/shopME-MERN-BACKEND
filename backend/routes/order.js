import express from "express"
const router=express.Router()

import {authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { allOrders, deleteOrder, getOrderDetails, myOrderDetails, newOrder, updateOrders } from "../controllers/orderController.js";

router.route("/orders/new").post(isAuthenticatedUser,newOrder);
router.route("/orders/:id").get(isAuthenticatedUser,getOrderDetails);
router.route("/me/orders").get(isAuthenticatedUser,myOrderDetails);
router.route("/admin/orders").get(isAuthenticatedUser,authorizeRoles("admin"),allOrders);
router.route("/admin/orders/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateOrders).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder);

export default router;