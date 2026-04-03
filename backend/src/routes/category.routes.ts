import { Router } from "express";
import {
  createCategory,
  getCategories,
  softDeleteCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authenticateOptional } from "../middleware/authenticate-optional.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  categoryCreateSchema,
  categoryDeleteSchema,
  categoryUpdateSchema,
} from "../validators/category.validators.js";

const router = Router();

router.get("/", authenticateOptional, asyncHandler(getCategories));
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(categoryCreateSchema),
  asyncHandler(createCategory),
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(categoryUpdateSchema),
  asyncHandler(updateCategory),
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate(categoryDeleteSchema),
  asyncHandler(softDeleteCategory),
);

export default router;
