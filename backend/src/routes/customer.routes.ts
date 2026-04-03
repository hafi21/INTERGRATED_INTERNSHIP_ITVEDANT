import { Router } from "express";
import {
  createCustomer,
  deactivateCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  customerCreateSchema,
  customerIdSchema,
  customerListSchema,
  customerUpdateSchema,
} from "../validators/customer.validators.js";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/", validate(customerListSchema), asyncHandler(getCustomers));
router.post("/", validate(customerCreateSchema), asyncHandler(createCustomer));
router.put("/:id", validate(customerUpdateSchema), asyncHandler(updateCustomer));
router.delete("/:id", validate(customerIdSchema), asyncHandler(deactivateCustomer));

export default router;
