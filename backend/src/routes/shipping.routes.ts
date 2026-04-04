import { Router } from "express";
import {
  createShipping,
  getAllShipping,
  getShipping,
  trackShipment,
  trackByTrackingNumber,
  updateShipping,
} from "../controllers/shipping.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createShippingSchema,
  getShippingSchema,
  trackShipmentSchema,
  trackByTrackingNumberSchema,
  updateShippingSchema,
} from "../validators/shipping.validators.js";

const router = Router();

// Public routes (authenticated users only)
router.get("/track/:orderId", authenticate, validate(trackShipmentSchema), asyncHandler(trackShipment));
router.post("/search-by-tracking", validate(trackByTrackingNumberSchema), asyncHandler(trackByTrackingNumber));

// Admin routes
router.use(authenticate, requireAdmin);
router.get("/", asyncHandler(getAllShipping));
router.get("/:orderId", validate(getShippingSchema), asyncHandler(getShipping));
router.post("/:orderId", validate(createShippingSchema), asyncHandler(createShipping));
router.patch("/:id", validate(updateShippingSchema), asyncHandler(updateShipping));

export default router;
