import { Router } from "express";
import {
  createReview,
  deleteReview,
  getProductReviews,
  getReviewsForModeration,
  moderateReview,
  updateReview,
} from "../controllers/review.controller.js";
import { authenticateOptional } from "../middleware/authenticate-optional.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createReviewSchema,
  moderateReviewSchema,
  moderationListSchema,
  productReviewsSchema,
  reviewIdSchema,
  updateReviewSchema,
} from "../validators/review.validators.js";

const router = Router();

router.get(
  "/product/:productId",
  authenticateOptional,
  validate(productReviewsSchema),
  asyncHandler(getProductReviews),
);
router.post("/", authenticate, validate(createReviewSchema), asyncHandler(createReview));
router.put("/:id", authenticate, validate(updateReviewSchema), asyncHandler(updateReview));
router.delete("/:id", authenticate, validate(reviewIdSchema), asyncHandler(deleteReview));
router.get(
  "/admin/moderation",
  authenticate,
  requireAdmin,
  validate(moderationListSchema),
  asyncHandler(getReviewsForModeration),
);
router.patch(
  "/:id/moderate",
  authenticate,
  requireAdmin,
  validate(moderateReviewSchema),
  asyncHandler(moderateReview),
);

export default router;
