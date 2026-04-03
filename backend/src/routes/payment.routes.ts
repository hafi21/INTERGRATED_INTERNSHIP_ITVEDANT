import { Router } from "express";
import {
  createRazorpayOrder,
  getPayments,
  refundPayment,
  verifyRazorpayPayment,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createRazorpayOrderSchema,
  paymentListSchema,
  refundPaymentSchema,
  verifyRazorpayPaymentSchema,
} from "../validators/payment.validators.js";

const router = Router();

router.use(authenticate);
router.get("/", requireAdmin, validate(paymentListSchema), asyncHandler(getPayments));
router.post("/razorpay/order", validate(createRazorpayOrderSchema), asyncHandler(createRazorpayOrder));
router.post(
  "/razorpay/verify",
  validate(verifyRazorpayPaymentSchema),
  asyncHandler(verifyRazorpayPayment),
);
router.patch("/:id/refund", requireAdmin, validate(refundPaymentSchema), asyncHandler(refundPayment));

export default router;
