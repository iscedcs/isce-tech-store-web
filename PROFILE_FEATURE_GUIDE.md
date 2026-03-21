# Profile Management System

A comprehensive account management system for the ISCE Store e-commerce platform.

## Features Implemented

### 1. **Profile Dashboard** (`/profile`)

- Welcome message with personalized greeting
- Quick stats showing:
  - Total orders count
  - Delivered orders count
  - Active orders count
- Recent orders display (up to 5 most recent)
- Quick links to view all orders

### 2. **Orders Management** (`/profile/orders`)

- View all customer orders organized by status:
  - Active Orders (PENDING, CONFIRMED, PROCESSING, SHIPPED)
  - Delivered Orders
  - Cancelled Orders
- Order summary with:
  - Order ID
  - Order date
  - Current status (color-coded badges)
  - Total amount
  - Item count

### 3. **Order Tracking** (`/profile/orders/[id]`)

- Detailed order view with:
  - Visual order progress timeline showing status progression
  - Order items with:
    - Product name
    - Quantity
    - Unit price
    - Total price
    - Customization details (color, design URLs)
  - Order summary:
    - Subtotal
    - VAT amount
    - Delivery fee
    - Total amount
  - Delivery address information:
    - Recipient name
    - Full address
    - Phone number
    - Email

### 4. **Address Management** (`/profile/addresses`)

- Save multiple delivery addresses with labels (Home, Office, Mom's place, etc.)
- Quick add/edit address functionality
- Set default address for faster checkout
- Manage saved addresses with:
  - Edit functionality
  - Delete with confirmation
  - Set as default option
- Address form includes:
  - Address label
  - First & last name
  - Phone number
  - Street address
  - City
  - State (36 Nigerian states dropdown)
  - Default address toggle

### 5. **Account Settings** (`/profile/settings`)

- Update profile information:
  - First name
  - Last name
  - Email address
- Change password with validation:
  - Current password verification
  - New password confirmation
  - Minimum 8 character requirement
- Success/error notifications

### 6. **Profile Sidebar Navigation**

- User info card displaying:
  - User avatar (initial letter)
  - Full name
  - Email address
- Navigation menu:
  - Dashboard
  - My Orders
  - Addresses
  - Account Settings
- Logout button with one-click sign out

### 7. **Navbar Profile Dropdown**

- Profile icon that shows user initial when logged in
- Dropdown menu with options:
  - My Profile
  - My Orders
  - Addresses
  - Settings
  - Logout
- Login/Sign Up links when not authenticated

## File Structure

```
app/
├── profile/
│   ├── layout.tsx                 # Profile layout with sidebar
│   ├── page.tsx                   # Dashboard
│   ├── orders/
│   │   ├── page.tsx              # Orders list
│   │   └── [id]/
│   │       └── page.tsx          # Order detail & tracking
│   ├── addresses/
│   │   └── page.tsx              # Address management
│   └── settings/
│       └── page.tsx              # Account settings
└── api/
    └── user/
        ├── orders/
        │   ├── route.ts          # GET all orders
        │   └── [id]/route.ts     # GET single order
        ├── addresses/
        │   ├── route.ts          # GET/POST addresses
        │   └── [id]/route.ts     # GET/PUT/PATCH/DELETE address
        ├── profile/
        │   └── route.ts          # PUT profile info
        └── password/
            └── route.ts          # PUT change password

components/
├── profile/
│   ├── profile-sidebar.tsx       # Sidebar navigation
│   └── address-form.tsx          # Address form component
└── layout/
    └── navbar.tsx                # Updated with profile dropdown
```

## API Routes

### Orders

- `GET /api/user/orders` - Fetch all user orders with items and shipping info
- `GET /api/user/orders/[id]` - Fetch specific order details

### Addresses

- `GET /api/user/addresses` - Fetch all saved addresses
- `POST /api/user/addresses` - Create new address
- `GET /api/user/addresses/[id]` - Fetch specific address
- `PUT /api/user/addresses/[id]` - Update address
- `PATCH /api/user/addresses/[id]` - Partially update address
- `DELETE /api/user/addresses/[id]` - Delete address

### Account

- `PUT /api/user/profile` - Update profile information
- `PUT /api/user/password` - Change password

## Status Badges & Colors

Orders display colored status badges:

- **PENDING** - Yellow background
- **CONFIRMED** - Blue background
- **PROCESSING** - Purple background
- **SHIPPED** - Indigo background
- **DELIVERED** - Green background
- **CANCELLED** - Red background

## Protected Routes

All profile routes are protected with `auth()` middleware:

- Unauthenticated users are redirected to `/login`
- All API routes check for valid session
- User can only access their own data (userId verification)

## Security Features

1. **Authentication Check**: All pages and API routes verify valid session
2. **Authorization Check**: API routes verify userId matches requesting user
3. **Password Validation**:
   - Minimum 8 characters
   - Requires current password for changes
4. **Address Management**: Only users can access/modify their own addresses

## How to Use

### For Customers

1. **Navigate to Profile**
   - Click profile icon in navbar
   - Click "My Profile" in dropdown or go to `/profile`

2. **View Orders**
   - Click "My Orders" in sidebar or dropdown
   - View order summary with status
   - Click any order to see detailed tracking

3. **Manage Addresses**
   - Click "Addresses" in sidebar
   - Add new address with label
   - Edit existing address
   - Set default address
   - Delete addresses

4. **Account Settings**
   - Click "Settings" in sidebar
   - Update profile info (name, email)
   - Change password with current password verification
   - See success/error notifications

5. **Logout**
   - Click "Logout" button in sidebar or dropdown
   - Will redirect to home page

## Database Requirements

The system uses these database models:

- `Order` - Order information with status tracking
- `OrderItem` - Individual items in orders
- `ShippingInfo` - Delivery address for orders
- `SavedAddress` - Customer's saved delivery addresses
- `User` - Customer account information (from NextAuth)

## Frontend Dependencies

- `next-auth` - Authentication
- `lucide-react` - Icons
- `ui/badge`, `ui/button`, `ui/input` - UI components

## Implementation Notes

### TODO: Backend Integration

The following API endpoints have placeholder implementations:

- `PUT /api/user/profile` - Connect to user update service
- `PUT /api/user/password` - Connect to password change service

These should be connected to your actual authentication backend service.

### Address Form

- Supports Nigerian states (all 36 states)
- Can be extended to support other countries
- Automatic default handling (only one default per user)

### Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                  ↓
                            CANCELLED (anytime)
```

## Customization Options

1. **Colors**: Update Tailwind classes to match your brand
2. **States**: Modify the `STATES` array in `address-form.tsx`
3. **Timezone**: Configure date formatting as needed
4. **Currency**: Uses `formatCurrency()` utility for formatting

## Testing the Feature

1. Create a test user account
2. Create test orders in database
3. Visit `/profile` when logged in
4. Test each section:
   - Dashboard stats
   - Orders list and detail
   - Address management (CRUD)
   - Settings updates

## Future Enhancements

- Order filters and search
- Invoice generation and download
- Order reorder functionality
- Wishlist management
- Payment method management
- Order notifications/email preferences
- Return/refund requests
- Order history export
