import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  productCreateSchema,
  productIdSchema,
  productListSchema,
  productUpdateSchema,
} from "../validators/product.validators.js";

const router = Router();

router.get("/", validate(productListSchema), asyncHandler(getProducts));
router.get("/:id", validate(productIdSchema), asyncHandler(getProductById));
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(productCreateSchema),
  asyncHandler(createProduct),
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(productUpdateSchema),
  asyncHandler(updateProduct),
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate(productIdSchema),
  asyncHandler(deleteProduct),
);

export default router;

