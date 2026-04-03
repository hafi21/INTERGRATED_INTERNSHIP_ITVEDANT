import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  moveToCart,
} from "../controllers/wishlist.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { addToWishlistSchema, wishlistItemIdSchema } from "../validators/wishlist.validators.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(getWishlist));
router.post("/", validate(addToWishlistSchema), asyncHandler(addToWishlist));
router.delete("/:id", validate(wishlistItemIdSchema), asyncHandler(removeFromWishlist));
router.patch("/:id/move-to-cart", validate(wishlistItemIdSchema), asyncHandler(moveToCart));

export default router;
