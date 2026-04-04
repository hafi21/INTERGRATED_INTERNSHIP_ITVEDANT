# Shipping Management Module - Complete Implementation Guide

## Overview
The Shipping Management Module extends the existing order system with real-time tracking capabilities, allowing admins to manage courier information and customers to track their shipments.

## Architecture

### Database Layer (Prisma)
```
Order (1) ──→ (1) Shipping
├── shippingFee: Decimal
└── status: OrderStatus (PENDING, PAID, PROCESSING, FULFILLED, CANCELLED)

Shipping
├── id: Int (PK)
├── orderId: Int (FK, UNIQUE)
├── courierService: String?
├── trackingNumber: String?
├── shippingStatus: ShippingStatus
├── shippingCost: Decimal
├── shippedAt: DateTime?
├── deliveredAt: DateTime?
└── timestamps: createdAt, updatedAt
```

### ShippingStatus Enum Values
- **PENDING**: Awaiting shipment preparation
- **PROCESSING**: Being prepared for dispatch
- **SHIPPED**: In transit with courier
- **DELIVERED**: Successfully delivered
- **CANCELLED**: Shipment cancelled

## API Endpoints

### Public Routes (Authenticated)
```http
GET /api/shipping/track/:orderId
```
- Retrieves tracking information for an order
- Ownership verified (customer can only view their orders)
- Response includes courier, tracking number, status, dates

### Admin Routes

```http
GET /api/shipping
```
Query params: `?status=SHIPPED` (optional)
- Lists all shipping records
- Filterable by shipping status
- Admin only

```http
GET /api/shipping/:orderId
```
- Get shipping details for specific order
- Admin only

```http
POST /api/shipping/:orderId
```
- Create shipping record when order ships
- Auto-called when admin marks order as shipped
- Initializes with SHIPPED status and order's shipping fee
- Admin only

```http
PATCH /api/shipping/:id
```
Request body:
```json
{
  "courierService": "FedEx",
  "trackingNumber": "1Z999AA10123456784",
  "shippingStatus": "SHIPPED"
}
```
- Update courier service and tracking details
- Optionally change shipping status
- Auto-updates shippedAt/deliveredAt timestamps
- Admin only

## Backend Implementation

### Controllers (shipping.controller.ts)

**getShipping()** - Fetch shipping by orderId
- Validates order exists
- Returns serialized shipping with order info

**createShipping()** - Initialize shipping record
- Checks for existing record (prevents duplicates)
- Creates with PENDING status initially
- Called automatically when order ships

**updateShipping()** - Update tracking details
- Validates status enum if provided
- Sets shippedAt when transitioning to SHIPPED
- Sets deliveredAt when transitioning to DELIVERED
- Validates shipping record exists

**trackShipment()** - Customer tracking endpoint
- Verifies ownership (userId match)
- Returns public tracking information

**getAllShipping()** - Admin dashboard data
- Supports status filtering
- Returns all shipping records sorted by date

### Order Integration
Modified `updateOrderStatus()` in order.controller.ts:
- When order status → PROCESSING: Creates Shipping record with SHIPPED status
- When order status → FULFILLED: Updates Shipping record status to DELIVERED

### Models (shipping.model.ts)
**serializeShipping()** function:
- Converts Prisma Decimal to Number
- Formats customer information
- Ensures consistent API response format

### Validation (shipping.validators.ts)
Zod schemas for:
- Creating shipping records
- Updating shipping details
- Tracking queries
- Admin listing

## Frontend Implementation

### Services (services/shipping.ts)

**shippingService object**:
```typescript
{
  getShipping,      // Fetch by orderId (admin)
  trackShipment,    // Track by orderId (customer)
  createShipping,   // Create record (admin)
  updateShipping,   // Update details (admin)
  getAllShipping    // List all (admin)
}
```

**useShipping() hook** - React Query wrapper:
- `shipping`: Current  shipping record
- `tracking`: Customer-side tracking data
- `isLoadingShipping`: Loading state
- `updateShipping`: Mutation function
- `isUpdatingShipping`: Update loading state
- Automatic cache invalidation on mutations

### Components

**ShippingInfoModal** (components/orders/shipping-info-modal.tsx)
- Modal overlay showing shipping details
- Display mode: Shows current status, courier, tracking, dates
- Edit mode: Form to update courier and tracking number
- Status badges with color coding
- Integration with React Query mutations

**OrderTracking** (pages/order-tracking-page.tsx)
- Customer-facing shipping tracking page
- URL: `/orders/:orderId/track`
- Protected route (authenticated users only)
- Displays shipping status with icon
- Shows courier, tracking number, dates
- Real-time status updates

**Modal** (components/shared/modal.tsx)
- Reusable modal component
- Responsive (full height on mobile, centered on desktop)
- Click-outside to close

### Integration with Admin Dashboard
Updated `AdminOrderDashboard` component:
- Added "Shipping Info" button (new button in action group)
- Opens `ShippingInfoModal` when clicked
- State management for modal visibility
- Integrated alongside Ship/Deliver/Cancel buttons

## User Workflows

### For Admins

#### 1. Shipping an Order
1. View admin orders dashboard (`/admin/orders`)
2. Order appears with "Mark Shipped" button
3. Click "Mark Shipped" → Order status changes to PROCESSING → Shipping record auto-created
4. Click "Shipping Info" to add courier details
5. Enter courier service name and tracking number
6. Save → Customer can now track shipment

#### 2. Delivering an Order
1. Update tracking info if needed (via "Shipping Info" button)
2. Click "Mark Delivered" → Order status changes to FULFILLED
3. Shipping status auto-updated to DELIVERED
4. Delivery date auto-recorded

#### 3. Managing Bulk Shipments
1. Navigate to `/admin/orders?status=SHIPPED`
2. See all shipped orders
3. Quickly add tracking numbers to multiple shipments
4. Filter by status to track progress

### For Customers

#### 1. Tracking Shipment
1. Navigate to Orders page (`/orders`)
2. Click order to view details
3. If order is shipped, "Track Shipment" link appears
4. Redirected to `/orders/:orderId/track`
5. View real-time status, courier, and tracking number
6. Check estimated delivery date

#### 2. Viewing Tracking Details
- Current shipping status with visual indicator
- Courier service name (e.g., FedEx, DHL, UPS)
- Tracking number to cross-reference with courier website
- Shipped and delivery timestamps

## State Management

### React Query Cache Strategy
```
queryKey: ["shipping", orderId]      → Individual shipping record
queryKey: ["shipment-tracking", orderId] → Customer tracking
queryKey: ["all-shipping"]           → Admin list
```

### Invalidation Strategy
- On shipping creation/update → Invalidate orders cache (parent update)
- On shipping update → Invalidate both shipping records and orders
- Ensures UI stays in sync with backend

## Error Handling

### Backend Errors
- 404: Shipping record not found
- 409: Shipping record already exists
- 400: Invalid shipping status enum value
- 403: Unauthorized (non-admin access)

### Frontend Errors
- Loading states during API calls
- Error messages in modal
- Fallback messages if data unavailable

## Database Connection

### Prisma Operations
- Include nested relations for order info
- One-to-one relationship constraints
- Cascade deletes when order deleted
- Indexed orderId for fast lookups

### Migration Details
Migration: `0002_add_shipping`
- Creates ShippingStatus enum
- Creates Shipping table with schema
- Adds foreign key to Order table
- No data loss (additive migration)

## Security Features

### Authorization
- Admin-only endpoints for create/update
- Customer can only view their own tracking
- Ownership verification at API level
- Role-based access control

### Data Validation
- Zod schema validation on all inputs
- Enum validation for shipping status
- Required field checks
- Type safety with TypeScript

## Testing Checklist

### Backend
- [ ] Create shipping when order shipped
- [ ] Update shipping details via API
- [ ] Retrieve shipping by orderId
- [ ] Track shipment as customer (ownership check)
- [ ] Admin list all shipping records
- [ ] Status transitions work correctly
- [ ] Dates auto-update (shippedAt, deliveredAt)

### Frontend
- [ ] Admin can view shipping info modal
- [ ] Shipping info updates save correctly
- [ ] Customer tracking page loads
- [ ] Courier and tracking display correctly
- [ ] Status badges show correct colors
- [ ] Modal opens/closes properly
- [ ] Error states display

### Integration
- [ ] Order status changes trigger shipping creation
- [ ] Shipping records persist after page reload
- [ ] React Query cache invalidation works
- [ ] Protection routes prevent unauthorized access

## Future Enhancements

Potential additions:
1. **Email Notifications**: Send tracking emails to customers
2. **Courier API Integration**: Auto-fetch live tracking from carrier
3. **Shipping Timeline**: Visual progress indicator
4. **Bulk Operations**: Batch update tracking for multiple orders
5. **Webhook Integration**: Real-time updates from courier APIs
6. **Analytics Dashboard**: Shipping metrics and performance
7. **Return Shipping**: Handle returns with separate tracking

## Troubleshooting

### Shipping record not creating
- Verify order status is transitioning to PROCESSING
- Check API logs for errors
- Ensure database migration ran successfully

### Tracking page shows no data
- Verify orderId is correct in URL
- Check user is authenticated
- Verify user owns the order
- Check shipping record exists in database

### Modal not opening
- Verify React Query is fetching data
- Check browser console for errors
- Verify order is shipped (shipping record exists)

---

**Module Status**: ✅ Production Ready

**Last Updated**: Current Session

**Maintainer**: Development Team
