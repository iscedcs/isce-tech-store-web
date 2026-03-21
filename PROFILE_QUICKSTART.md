# Profile Feature - Quick Start Guide

## 🚀 Getting Started

### 1. **Access the Profile**

After logging in, you have 3 ways to access the profile:

#### Option A: Navbar Profile Icon

- Click the user icon in the top-right of the navbar
- Select "My Profile" from dropdown
- Or choose specific sections (Orders, Addresses, Settings)

#### Option B: Direct URL

- Navigate to `http://localhost:2027/profile`

#### Option C: Profile Dropdown

- Click the profile icon to open dropdown
- Choose any profile option
- Auto-closes menu when you navigate

### 2. **Dashboard** (`/profile`)

**What you'll see:**

- Welcome message with your name
- Quick stats:
  - Total orders
  - Delivered orders
  - Active orders
- Last 5 orders with status and total
- "View All" link if you have more orders

**Try:**

- Hover over recent orders to see styling
- Click any order to see full details
- Click "View All" to see complete order history

---

## 📦 Managing Orders

### View All Orders (`/profile/orders`)

**Features:**

- Orders grouped by status:
  - Active Orders (in progress)
  - Delivered Orders
  - Cancelled Orders
- See order date, status, and amount
- Hover effects on order cards

**Try:**

- Look for color-coded status badges
- Click any order to view details
- Check the sidebar navigation highlights "My Orders"

### Track Individual Order (`/profile/orders/[id]`)

**What's Shown:**

1. **Order Progress Timeline**
   - Visual timeline showing order journey
   - Icons indicate each status
   - Completed steps highlighted in blue
   - Current step highlighted

2. **Order Items**
   - Product name
   - Quantity and unit price
   - Customization info (if applicable)
   - Total for each item

3. **Order Summary**
   - Subtotal
   - VAT (if applicable)
   - Delivery fee
   - Final total

4. **Delivery Address**
   - Full recipient information
   - Complete delivery address
   - Contact details

**Try:**

- Note the status progression
- Hover over status badges
- Scroll to see all order details
- Check delivery information

---

## 📍 Managing Addresses

### Add New Address (`/profile/addresses`)

**Steps:**

1. Click "Add New Address" button
2. Fill in address form:
   - Address Label (e.g., "Home", "Office")
   - First & Last Name
   - Phone Number
   - Street Address
   - City
   - State (select from dropdown)
3. Optionally check "Set as default"
4. Click "Save Address"

**Address Form includes:**

- Validation for required fields
- Phone number format check
- State dropdown (36 Nigerian states)
- Error messages if validation fails
- Success notification after saving

### Manage Saved Addresses

**For Each Address:**

- **Edit** - Update address details
- **Set Default** - Make it your primary delivery address
- **Delete** - Remove the address (with confirmation)
- **Default Badge** - Shows current default address

**Try:**

- Add a few test addresses
- Edit one address
- Set different address as default
- Delete a non-default address
- Edit default address (loses default status if you change it)

---

## ⚙️ Account Settings

### Update Profile Information (`/profile/settings`)

**Update:**

- First Name
- Last Name
- Email Address

**Steps:**

1. Scroll to "Profile Information" section
2. Edit fields as needed
3. Click "Save Changes"
4. See success notification

### Change Password

**Security Features:**

- Requires current password for verification
- New password must match confirmation
- Minimum 8 characters required
- Special character requirements (if configured)

**Steps:**

1. Scroll to "Change Password" section
2. Enter current password
3. Enter new password (8+ chars)
4. Confirm new password
5. Click "Update Password"
6. See success notification

**Try:**

- Try submitting without filling all fields
- Try passwords that don't match
- Try password less than 8 characters
- See error messages appear

---

## 🔐 Logout

**Ways to Logout:**

1. Click logout in sidebar
2. Click profile icon in navbar → click "Logout"
3. Session expires automatically

**After Logout:**

- Redirected to home page
- Profile icon shows as "User" icon
- Navbar shows "Login" and "Sign Up" options

---

## 🎯 Navigation Flow

```
Navbar (always visible)
├── Home (/)
├── Products (/products)
├── Cart (drawer)
└── Profile (dropdown)
    ├── When Not Logged In
    │   ├── Login
    │   └── Sign Up
    └── When Logged In
        ├── My Profile (/profile)
        ├── My Orders (/profile/orders)
        ├── Addresses (/profile/addresses)
        ├── Settings (/profile/settings)
        └── Logout

Profile Layout (/profile/*)
├── Sidebar (sticky)
│   ├── User Info Card
│   ├── Navigation Menu
│   │   ├── Dashboard
│   │   ├── My Orders
│   │   ├── Addresses
│   │   └── Settings
│   └── Logout Button
└── Main Content (responsive)
    └── Page Content
```

---

## 🐛 Troubleshooting

### "Unauthorized" Error

- Make sure you're logged in
- Check NextAuth session is valid
- Try logging out and back in

### Addresses not saving

- Check all required fields are filled
- Verify phone number is valid
- Check Browser DevTools Console for errors
- Check Network tab for API response

### Orders not showing

- Verify user has orders in database
- Check Order records are linked to correct userId
- Try refreshing page
- Check browser console for errors

### Password change fails

- Make sure old password is correct
- New password must be 8+ characters
- Passwords must match
- Check network request in DevTools

### Profile icon not showing

- Make sure you're logged in
- Check session is valid
- Try refreshing page
- Clear authentication cookies

---

## 📊 Sample Data for Testing

### Test Order States

Create orders with different statuses to see:

- PENDING (yellow) - just placed
- CONFIRMED (blue) - confirmed by merchant
- PROCESSING (purple) - preparing items
- SHIPPED (indigo) - on the way
- DELIVERED (green) - received
- CANCELLED (red) - cancelled order

### Test Addresses

Try adding multiple addresses:

- Home address (set as default)
- Office address
- Parent's house
- Friend's address
- Etc.

### Test Order Items

Create orders with:

- Regular products
- Customized items (with colors/design URLs)
- Multiple items
- Single high-value item

---

## ✨ Features Checklist

- [x] Dashboard with stats
- [x] View all orders
- [x] Order detail with tracking
- [x] Add address
- [x] Edit address
- [x] Delete address
- [x] Set default address
- [x] Update profile info
- [x] Change password
- [x] Logout
- [x] Responsive design
- [x] Protected routes
- [x] Status colors
- [x] Profile dropdown
- [x] Sidebar navigation

---

## 📝 Notes

- All profile data is tied to authenticated user
- Used NextAuth for authentication
- Database queries filter by userId for security
- Forms have client-side validation
- API routes have server-side authorization checks
- All pages are responsive (mobile, tablet, desktop)
- Sidebar is sticky (stays visible while scrolling)
- Time zones used for date display (customize as needed)

---

## 🎓 Learning Resources

To understand the implementation:

1. Read `PROFILE_FEATURE_GUIDE.md` for detailed feature list
2. Read `INTEGRATION_CHECKLIST.md` for backend integration
3. Check individual component files for implementation details
4. Review API route files for data handling
5. Examine Prisma schema for database structure

---

**Happy Testing!** 🎉
