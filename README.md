# ISCE Store

A modern, full-featured e-commerce platform built with Next.js for selling custom products with integrated payment processing, order tracking, and multi-role user management.

## Overview

**ISCE Store** is a production-ready e-commerce application designed to provide a seamless shopping experience for customers while offering powerful tools for site administrators. The platform supports product customization, secure checkout with Paystack payments, comprehensive order management, and detailed delivery tracking.

## Features

### 🛍️ Customer Features

- **Product Catalog** — Browse, search, and filter products
- **Product Customization** — Select colors, upload custom designs, and preview changes
- **Shopping Cart** — Add/remove items, manage quantities, and persistent cart storage
- **Secure Checkout** — Multi-step checkout with Paystack payment integration
- **User Authentication** — Secure login, registration, and password recovery
- **Order Management** — View all orders with status tracking (pending, confirmed, processing, shipped, delivered, cancelled)
- **Order Tracking** — Real-time order status with visual progress timeline
- **User Profiles** — Update account information, manage multiple delivery addresses, and view order history
- **Address Management** — Save multiple addresses with custom labels and set defaults for quick checkout
- **Responsive Design** — Fully optimized for mobile, tablet, and desktop experiences

### 👨‍💼 Admin Features

- **Order Management Dashboard** — View and manage all customer orders
- **Order Status Updates** — Update order status and track fulfillment

### 👑 Superadmin Features

- **Company Information Management** — Configure company details and branding
- **Invoice Generation** — Create and manage customer invoices
- **Wallet Management** — Track financial transactions and account balance

## Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) — React-based framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) — Type-safe development
- **UI Framework**: [React 19](https://react.dev/) with [Tailwind CSS](https://tailwindcss.com/) for styling
- **UI Components**: Custom component library with [Radix UI](https://www.radix-ui.com/) primitives
- **Forms**: [React Hook Form](https://react-hook-form.com/) with Zod schema validation
- **Animation**: [Framer Motion](https://www.framer.com/motion/) for smooth transitions
- **Charts**: [Recharts](https://recharts.org/) for data visualization

### Backend & Database

- **ORM**: [Prisma](https://www.prisma.io/) — Type-safe database access
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/) serverless platform
- **Database Adapter**: [@prisma/adapter-neon](https://github.com/neondatabase/neon/tree/main/cli) for serverless PostgreSQL
- **Authentication**: [NextAuth](https://next-auth.js.org/) v5 beta — Secure session management

### Payments & External Services

- **Payment Gateway**: [Paystack](https://paystack.com/) — Nigerian/African payment processing
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/) — Product images and design uploads
- **Maps Integration**: [Google Maps API](https://developers.google.com/maps) — Location-based delivery
- **Email Service**: [Resend](https://resend.com/) — Transactional emails

### Development & Tooling

- **Package Manager**: [pnpm](https://pnpm.io/) — Fast, disk-space efficient package management
- **Linting**: [ESLint](https://eslint.org/) — Code quality and consistency
- **Styling**: [PostCSS](https://postcss.org/) with Tailwind CSS

## Installation & Setup

### Prerequisites

- Node.js 18+ or higher
- pnpm 8+ (or npm/yarn as alternatives)
- PostgreSQL database (Neon recommended)
- Paystack account for payment processing
- AWS S3 credentials for file uploads
- Google Maps API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd store
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Update the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key

# AWS S3
NEXT_PUBLIC_AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Resend Email
RESEND_API_KEY=your-resend-api-key
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with sample data (optional)
pnpm db:seed
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:2027](http://localhost:2027) in your browser to view the application.

## Available Scripts

```bash
# Development
pnpm dev              # Start development server on port 2027

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes to database
pnpm db:migrate       # Create and apply migrations
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Prisma Studio (visual DB manager)

# Code Quality
pnpm lint             # Run ESLint
```

## Project Structure

```
store/
├── app/                      # Next.js App Router pages and layouts
│   ├── (auth)/              # Authentication pages (login, register, password reset)
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes (auth, uploads, user endpoints)
│   ├── checkout/            # Checkout flow with payment verification
│   ├── products/            # Product catalog and detail pages
│   ├── profile/             # User dashboard
│   │   ├── addresses/       # Address management
│   │   ├── orders/          # Order history and tracking
│   │   └── settings/        # Account settings
│   ├── superadmin/          # Superadmin dashboard
│   │   ├── company/         # Company information
│   │   ├── invoices/        # Invoice management
│   │   └── wallet/          # Wallet management
│   └── track/               # Order tracking page
├── actions/                  # Server actions for forms and operations
├── components/              # Reusable React components
│   ├── auth/               # Authentication-related components
│   ├── cart/               # Shopping cart components
│   ├── checkout/           # Checkout flow components
│   ├── layout/             # Layout components (navbar, footer)
│   ├── pages/              # Page-specific components
│   ├── products/           # Product-related components
│   ├── profile/            # Profile management components
│   ├── ui/                 # UI primitives and shadcn components
│   └── ...
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and helpers
│   ├── api-client.ts       # Paystack and other API client setup
│   ├── prisma.ts           # Prisma client singleton
│   ├── upload.ts           # AWS S3 upload utilities
│   ├── mail.ts             # Email service integration
│   ├── utils.ts            # General utility functions
│   └── schemas/            # Zod validation schemas
├── prisma/                  # Database configuration
│   ├── schema.prisma       # Prisma data model
│   ├── migrations/         # Database migration history
│   └── seed.ts             # Database seeding script
├── public/                  # Static assets
│   ├── assets/             # Images and SVGs
│   └── products/           # Product images
├── auth.config.ts          # NextAuth configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## Key Features Deep Dive

### Authentication & Authorization

- Secure user authentication with NextAuth
- Role-based access control (customer, admin, superadmin)
- Password hashing and recovery flow
- Protected API routes with session validation

### Payment Processing

- Paystack integration for safe card and bank payments
- Payment verification and webhook handling
- Transaction history and receipt generation
- Support for multiple payment methods (cards, bank transfers, USSD)

### Product Management

- Rich product details with images and descriptions
- Color customization with color selector
- Design upload and preview functionality
- Inventory management

### Order Management

- Complete order lifecycle (pending → delivered/cancelled)
- Order status tracking with visual timeline
- Order items with customization details
- Delivery information and address management

### File Uploads

- AWS S3 integration for secure file storage
- Design image uploads during checkout
- Product image management
- Presigned URLs for secure downloads

## Getting Help

For detailed feature documentation, see:

- [Profile Feature Guide](PROFILE_FEATURE_GUIDE.md) — Complete user profile system documentation
- [Profile Quickstart](PROFILE_QUICKSTART.md) — Quick setup guide for profile features

For framework documentation:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth Documentation](https://next-auth.js.org/)

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Commit with clear messages: `git commit -m 'feat: description'`
4. Push to remote: `git push origin feature/your-feature`
5. Open a pull request for review

## License

This project is proprietary. All rights reserved.
