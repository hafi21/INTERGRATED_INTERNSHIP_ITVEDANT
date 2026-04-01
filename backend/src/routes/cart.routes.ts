import { Router } from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { addCartItemSchema, cartItemIdSchema } from "../validators/cart.validators.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(getCart));
router.post("/", validate(addCartItemSchema), asyncHandler(addToCart));
router.patch("/:id", validate(cartItemIdSchema), asyncHandler(updateCartItem));
router.delete("/:id", validate(cartItemIdSchema), asyncHandler(removeCartItem));
router.delete("/", asyncHandler(clearCart));

export default router;

