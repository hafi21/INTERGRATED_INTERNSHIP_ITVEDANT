import { Router } from "express";
import {
  applyCoupon,
  createCoupon,
  deactivateCoupon,
  getAvailableCoupons,
  getCoupons,
  updateCoupon,
} from "../controllers/coupon.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  applyCouponSchema,
  availableCouponSchema,
  couponCreateSchema,
  couponIdSchema,
  couponListSchema,
  couponUpdateSchema,
} from "../validators/coupon.validators.js";

const router = Router();

router.use(authenticate);
router.get("/available", validate(availableCouponSchema), asyncHandler(getAvailableCoupons));
router.post("/apply", validate(applyCouponSchema), asyncHandler(applyCoupon));
router.get("/", requireAdmin, validate(couponListSchema), asyncHandler(getCoupons));
router.post("/", requireAdmin, validate(couponCreateSchema), asyncHandler(createCoupon));
router.put("/:id", requireAdmin, validate(couponUpdateSchema), asyncHandler(updateCoupon));
router.delete("/:id", requireAdmin, validate(couponIdSchema), asyncHandler(deactivateCoupon));

export default router;
