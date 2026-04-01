import { Router } from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} from "../validators/payment.validators.js";

const router = Router();

router.use(authenticate);
router.post("/razorpay/order", validate(createRazorpayOrderSchema), asyncHandler(createRazorpayOrder));
router.post(
  "/razorpay/verify",
  validate(verifyRazorpayPaymentSchema),
  asyncHandler(verifyRazorpayPayment),
);

export default router;
