# Module 3: Cart, Orders, and Mock Payment

## Objective
Implement the conversion flow from cart to order to payment simulation.

## End-user Steps
1. Add products to cart from the catalog.
2. Open `/cart` and adjust quantities.
3. Enter the shipping address and select a mock payment provider.
4. Place the order.
5. Open `/orders`.
6. Trigger the mock payment button to mark the order as paid.

## Notes
- Inventory is decremented when an order is created.
- Payments are simulated and linked 1:1 to orders.
- Order history is scoped to the logged-in user, except for admin access.
- Data is stored through Prisma on top of MySQL.

## Screenshot Checklist
- `docs/screenshots/module-3-cart.png`
- `docs/screenshots/module-3-orders.png`
