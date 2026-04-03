import { Router } from "express";
import { cancelOrder, createOrder, getOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  cancelOrderSchema,
  createOrderSchema,
  orderListSchema,
  updateOrderStatusSchema,
} from "../validators/order.validators.js";

const router = Router();

router.use(authenticate);
router.get("/", validate(orderListSchema), asyncHandler(getOrders));
router.post("/", validate(createOrderSchema), asyncHandler(createOrder));
router.patch("/:id/cancel", validate(cancelOrderSchema), asyncHandler(cancelOrder));
router.patch(
  "/:id/status",
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler(updateOrderStatus),
);

export default router;
