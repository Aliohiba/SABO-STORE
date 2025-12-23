# Online Store - Project TODO

## Database & Schema
- [x] Create products table with categories, images, descriptions, pricing
- [x] Create categories table for product organization
- [x] Create cart items table for shopping cart functionality
- [x] Create orders table with order status tracking
- [x] Create order items table for order line items
- [x] Create admin users table with password management
- [x] Create product inventory/stock management fields
- [x] Create order status history/timeline table

## Backend API - Products
- [x] Create procedure to list all products with pagination
- [x] Create procedure to get product details by ID
- [x] Create procedure to search products by name/keyword
- [x] Create procedure to filter products by category
- [ ] Create procedure to filter products by price range
- [ ] Create procedure to get featured/popular products
- [x] Create admin procedure to add new product
- [x] Create admin procedure to edit product details
- [x] Create admin procedure to delete product
- [x] Create admin procedure to update product inventory

## Backend API - Cart
- [x] Create procedure to add item to cart
- [x] Create procedure to remove item from cart
- [x] Create procedure to update item quantity
- [x] Create procedure to get cart contents
- [x] Create procedure to clear cart

## Backend API - Orders
- [x] Create procedure to create new order from cart
- [x] Create procedure to get order details by ID
- [x] Create procedure to get user's order history
- [x] Create procedure to get all orders (admin)
- [x] Create admin procedure to update order status
- [x] Create procedure to track order status

## Backend API - Admin Authentication
- [x] Create admin login procedure with password verification
- [x] Create admin logout procedure
- [x] Create admin password change procedure
- [x] Create initial admin user with password 'admin123'
- [x] Implement admin session/token management

## Frontend - Navigation & Layout
- [ ] Create main navigation bar with logo, search, cart, account links
- [ ] Create footer with company info and features
- [ ] Design responsive layout for mobile and desktop
- [ ] Implement theme colors (blue, green, white) from reference design

## Frontend - Product Catalog
- [ ] Create product grid display with 4-column layout
- [ ] Create product card component with image, name, price, availability
- [ ] Implement product search functionality
- [ ] Implement category filter
- [ ] Implement price range filter
- [ ] Create product detail page
- [ ] Display product reviews/ratings (if applicable)

## Frontend - Shopping Cart
- [ ] Create shopping cart page
- [ ] Implement add to cart functionality
- [ ] Implement remove from cart functionality
- [ ] Implement quantity adjustment
- [ ] Display cart totals and subtotals
- [ ] Implement cart persistence (localStorage/session)

## Frontend - Checkout
- [ ] Create checkout page with order summary
- [ ] Create customer information form (name, email, phone, address)
- [ ] Implement cash on delivery payment method
- [ ] Create order confirmation page
- [ ] Send order confirmation to customer

## Frontend - Customer Account
- [ ] Create login/register page for customers
- [ ] Create account dashboard
- [ ] Display order history
- [ ] Create order tracking/detail page
- [ ] Implement user profile management

## Frontend - Admin Dashboard
- [ ] Create admin login page
- [ ] Create admin dashboard home
- [ ] Create products management page (list, add, edit, delete)
- [ ] Create inventory management page
- [ ] Create orders management page with status updates
- [ ] Create admin settings page for password change
- [ ] Implement admin authentication check on protected routes

## Design & Styling
- [ ] Apply elegant design inspired by Belhaj Store
- [ ] Implement blue button styling for CTAs
- [ ] Implement green accents for borders/highlights
- [ ] Create responsive design for all screen sizes
- [ ] Add hover effects and micro-interactions
- [ ] Implement loading states and error messages
- [ ] Create empty state designs

## Testing & Deployment
- [ ] Write vitest tests for backend procedures
- [ ] Test product CRUD operations
- [ ] Test cart functionality
- [ ] Test order creation and tracking
- [ ] Test admin authentication
- [ ] Test search and filtering
- [ ] Manual testing of all user flows
- [ ] Create checkpoint for deployment

## Bug Fixes
- [x] Fix Vite WebSocket HMR connection issue

## Additional Features
- [ ] Product image upload functionality
- [ ] Inventory alerts when stock is low
- [ ] Order status notifications
- [ ] Product recommendations
- [ ] Wishlist functionality (optional)
- [ ] Multiple payment gateway support (extensible for Stripe)
