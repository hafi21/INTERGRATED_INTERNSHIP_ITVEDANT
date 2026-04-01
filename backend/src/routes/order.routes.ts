import { Router } from "express";
import { createOrder, getOrders } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createOrderSchema } from "../validators/order.validators.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(getOrders));
router.post("/", validate(createOrderSchema), asyncHandler(createOrder));

export default router;

