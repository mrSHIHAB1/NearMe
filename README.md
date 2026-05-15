# 🚀 Near Me Backend

> A comprehensive service discovery platform backend that connects service providers with users based on location, categories, and subscriptions.

Near Me is a full-featured backend API for a service marketplace platform that enables users to discover nearby services, providers to showcase their offerings, and a seamless subscription-based payment system.

---

# 📌 Table of Contents

* [Overview](#-overview)
* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Project Structure](#-project-structure)
* [Installation](#-installation)
* [Environment Variables](#-environment-variables)
* [Running the Project](#-running-the-project)
* [API Documentation](#-api-documentation)
* [Scripts](#-scripts)
* [Database Models](#-database-models)
* [Key Modules](#-key-modules)
* [Contributing](#-contributing)
* [License](#-license)

---

# 📖 Overview

**Near Me Backend** is a production-ready REST API built with **Node.js, Express, and TypeScript**. It powers a location-based service discovery platform with advanced features including:

- User authentication & authorization with multiple roles
- Service provider listings with categorization
- Real-time messaging & notifications
- Subscription-based payment system
- OTP verification & security
- Geolocation-based service search
- Real-time socket communication
- Multi-provider analytics & insights

The backend follows a **modular MVC architecture** ensuring scalability, maintainability, and performance for production environments.

---

# ✨ Features

* 🔐 **Authentication & Authorization** - JWT-based auth with Passport.js and multiple strategies
* 👥 **Role-Based Access Control** - Support for USER, PROVIDER, and SUPER_ADMIN roles
* 📍 **Geolocation Services** - Find services near user location using coordinates
* 🏪 **Service Management** - Create, update, and manage service listings with categories
* 💳 **Payment Integration** - Subscription-based payments and transaction management
* 🔔 **Real-Time Notifications** - Socket.io-based instant notifications and messaging
* 💬 **Messaging System** - Direct messaging between users and service providers
* ⭐ **Reviews & Ratings** - Service quality ratings and user feedback
* 🎯 **Subscription Plans** - Flexible subscription tiers for service providers
* 📊 **Service Analytics** - Track views and performance metrics
* 🖼️ **File Upload** - Cloudinary integration for image management
* 🔐 **OTP Verification** - Email-based OTP for account verification
* ⚡ **Redis Caching** - Performance optimization with caching
* 🛡️ **Global Error Handling** - Comprehensive error management
* 🧹 **Request Validation** - Zod schema validation
* 📄 **Standard Response Format** - Consistent API responses
* 🌍 **Environment-Based Configuration** - Easy environment setup
* 🔍 Pagination, filtering, and sorting

---

# 🛠 Tech Stack

## Backend

* **Node.js** - JavaScript runtime
* **Express.js v5** - Web framework
* **TypeScript** - Static typing for JavaScript

## Database & Caching

* **MongoDB** - NoSQL database
* **Mongoose** - MongoDB object modeling
* **Redis** - In-memory caching

## Authentication & Security

* **JWT (Jose)** - JSON Web Tokens
* **Passport.js** - Authentication middleware
* **bcryptjs** - Password hashing
* **Google OAuth 2.0** - Third-party authentication

## Third-Party Services

* **Firebase Admin** - Push notifications and authentication
* **Cloudinary** - Image storage and management
* **Nodemailer** - Email notifications

## Real-Time Communication

* **Socket.io** - Real-time bidirectional communication

## Validation & Data Handling

* **Zod** - TypeScript-first schema validation

## Development Tools

* **ESLint** - Code linting
* **ts-node-dev** - TypeScript development server
* **dotenv** - Environment variable management

---

# 📁 Project Structure

```
src
│
├── app
│   ├── config/
│   │   ├── cloudinary.config.ts    # Image upload configuration
│   │   ├── env.ts                  # Environment variables
│   │   ├── firebase.config.ts       # Firebase initialization
│   │   ├── multer.config.ts         # File upload configuration
│   │   ├── passport.ts              # Passport authentication strategies
│   │   └── redis.config.ts          # Redis cache configuration
│   │
│   ├── errorHelpers/
│   │   └── AppError.ts              # Custom error class
│   │
│   ├── helpers/                     # Error handling helpers
│   │   ├── handleCastError.ts
│   │   ├── handleDuplicateError.ts
│   │   ├── handleValidationError.ts
│   │   └── handleZodError.ts
│   │
│   ├── interfaces/
│   │   ├── error.types.ts           # Error type definitions
│   │   └── index.d.ts               # Global type definitions
│   │
│   ├── middlewares/
│   │   ├── checkAuth.ts             # Authentication middleware
│   │   ├── globalErrorHandler.ts    # Global error handling
│   │   ├── notFound.ts              # 404 handler
│   │   ├── requireSubscriptionFeature.ts  # Subscription checker
│   │   └── validateRequest.ts       # Request validation
│   │
│   ├── modules/                     # Feature modules (MVC pattern)
│   │   ├── auth/                    # Authentication
│   │   ├── category/                # Service categories
│   │   ├── highlight_service/       # Featured services
│   │   ├── message/                 # Messaging system
│   │   ├── notification/            # Notifications
│   │   ├── otp/                     # OTP verification
│   │   ├── payment/                 # Payment processing
│   │   ├── plan/                    # Subscription plans
│   │   ├── review/                  # Service reviews
│   │   ├── service/                 # Service listings
│   │   ├── serviceAnalytics/        # Service metrics
│   │   ├── static_pages/            # Static pages
│   │   ├── subscription/            # Subscription management
│   │   ├── superAdmin/              # Admin panel
│   │   ├── user/                    # User management
│   │   └── views_impression/        # View tracking
│   │
│   ├── routes/
│   │   └── index.ts                 # Main route configuration
│   │
│   ├── socket/
│   │   ├── event.socket.ts          # Socket.io event handlers
│   │   └── index.ts                 # Socket initialization
│   │
│   ├── utils/                       # Helper utilities
│   │   ├── AverageRatingHelper/     # Rating calculations
│   │   ├── getNearestServicesHelper/# Geolocation queries
│   │   ├── notificationSendHelper/  # Notification dispatch
│   │   ├── subscriptionHelper/      # Subscription logic
│   │   ├── templates/               # Email templates
│   │   ├── catchAsync.ts            # Async error wrapper
│   │   ├── getTransactionId.ts      # Transaction ID generation
│   │   ├── invoice.ts               # Invoice generation
│   │   ├── jwt.ts                   # JWT utilities
│   │   ├── QueryBuilder.ts          # Database query builder
│   │   ├── randomOTPGenerator.ts    # OTP generation
│   │   ├── seedPlans.ts             # Plan seeding
│   │   ├── seedSuperAdmin.ts        # Admin seeding
│   │   ├── sendEmail.ts             # Email sending
│   │   ├── sendResponse.ts          # Standardized responses
│   │   ├── setCookie.ts             # Cookie management
│   │   └── userToken.ts             # Token utilities
│   │
│   └── constants.ts                 # Application constants
│
├── app.ts                           # Express app setup
└── server.ts                        # Server entry point
```

---

# ⚙️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Redis (for caching)
- Firebase project setup
- Cloudinary account

### Setup Steps

1. **Clone the repository:**

```bash
git clone https://github.com/Fahim-Hassan-Ovi/near-me-backend.git
cd near-me-backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure your `.env` file** with your actual credentials (see [Environment Variables](#-environment-variables) section)

5. **Compile TypeScript:**

```bash
npm run build
```

---

# 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/near-me-db

# JWT Secrets
JWT_ACCESS_SECRET=your_secret_access_key_here
JWT_REFRESH_SECRET=your_secret_refresh_key_here
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_NAME=NearMe
SMTP_FROM_EMAIL=noreply@nearme.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Payment Gateway (if applicable)
PAYMENT_GATEWAY_KEY=your_payment_key
PAYMENT_GATEWAY_SECRET=your_payment_secret

# App URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

---

# ▶️ Running the Project

### Development Mode

Start the development server with auto-reloading:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Mode

1. **Build the project:**

```bash
npm run build
```

2. **Run the compiled code:**

```bash
npm start
```

### Code Linting

Check for code quality issues:

```bash
npm run lint
```

---

# 📡 API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Core Endpoints

### Authentication
```
POST   /auth/register              # User registration
POST   /auth/login                 # User login
POST   /auth/logout                # User logout
POST   /auth/verify-otp            # OTP verification
POST   /auth/refresh-token         # Refresh JWT
POST   /auth/google/callback       # Google OAuth callback
```

### Users
```
GET    /users                      # Get all users
GET    /users/:id                  # Get user details
PATCH  /users/:id                  # Update user profile
DELETE /users/:id                  # Delete user account
GET    /users/nearby-services      # Get services near user location
```

### Services
```
GET    /services                   # Get all services
POST   /services                   # Create new service (providers)
GET    /services/:id               # Get service details
PATCH  /services/:id               # Update service
DELETE /services/:id               # Delete service
GET    /services/category/:id      # Get services by category
```

### Payments & Subscriptions
```
GET    /plans                      # Get subscription plans
POST   /subscriptions/create       # Create subscription
GET    /subscriptions/:id          # Get subscription details
POST   /payments/webhook           # Payment webhook
```

### Messages & Notifications
```
GET    /messages                   # Get user messages
POST   /messages                   # Send message
GET    /notifications              # Get notifications
PATCH  /notifications/:id/read     # Mark notification as read
```

### Reviews & Ratings
```
GET    /reviews/:serviceId         # Get service reviews
POST   /reviews                    # Create review
PATCH  /reviews/:id                # Update review
DELETE /reviews/:id                # Delete review
```

## API Features

- **Pagination**: Use `page` and `limit` query parameters
- **Filtering**: Service category, rating, price range
- **Sorting**: Sort by rating, price, distance
- **Authentication**: JWT Bearer token in Authorization header

---

# 📜 NPM Scripts

| Script         | Description                       |
| -------------- | --------------------------------- |
| `npm run dev`  | Start development server with auto-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start`    | Run production build              |
| `npm run lint` | Run ESLint to check code quality |

---

# � Database Models

## User Model
- `_id`: ObjectId (Primary Key)
- `name`: String
- `email`: String (Unique)
- `phone`: String (Bangladesh format)
- `password`: String (Hashed)
- `role`: Enum (USER, PROVIDER, SUPER_ADMIN)
- `isActive`: Boolean
- `isDeleted`: Boolean
- `isVerified`: Boolean
- `hasService`: Boolean
- `address`: String
- `coordinates`: { lat: Number, lon: Number }
- `fcmToken`: String
- `createdAt`: Date
- `updatedAt`: Date

## Service Model
- `_id`: ObjectId (Primary Key)
- `providerId`: ObjectId (References User)
- `title`: String
- `description`: String
- `category`: ObjectId (References Category)
- `price`: Number
- `rating`: Number (Average)
- `totalReviews`: Number
- `images`: Array of URLs
- `location`: { lat: Number, lon: Number }
- `address`: String
- `isAvailable`: Boolean
- `views`: Number
- `createdAt`: Date
- `updatedAt`: Date

## Category Model
- `_id`: ObjectId (Primary Key)
- `name`: String (Unique)
- `description`: String
- `icon`: String (URL)
- `createdAt`: Date

## Subscription Model
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (References User)
- `planId`: ObjectId (References Plan)
- `startDate`: Date
- `endDate`: Date
- `status`: Enum (ACTIVE, EXPIRED, CANCELLED)
- `transactionId`: String
- `createdAt`: Date

## Payment Model
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (References User)
- `amount`: Number
- `currency`: String
- `status`: Enum (PENDING, COMPLETED, FAILED)
- `transactionId`: String
- `paymentMethod`: String
- `createdAt`: Date

## Review Model
- `_id`: ObjectId (Primary Key)
- `serviceId`: ObjectId (References Service)
- `userId`: ObjectId (References User)
- `rating`: Number (1-5)
- `comment`: String
- `createdAt`: Date
- `updatedAt`: Date

## Message Model
- `_id`: ObjectId (Primary Key)
- `senderId`: ObjectId (References User)
- `receiverId`: ObjectId (References User)
- `content`: String
- `isRead`: Boolean
- `createdAt`: Date

## Notification Model
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (References User)
- `type`: String
- `title`: String
- `message`: String
- `isRead`: Boolean
- `relatedId`: ObjectId
- `createdAt`: Date

---

# �📊 Key Modules

## Authentication Module
- User registration and login
- JWT token management
- Google OAuth integration
- OTP-based verification
- Password reset functionality

## User Module
- User profile management
- Role-based access (USER, PROVIDER, SUPER_ADMIN)
- Location tracking
- Account settings

## Service Module
- Service CRUD operations
- Category management
- Geolocation-based search
- Service availability
- Featured services

## Payment & Subscription Module
- Subscription plan management
- Payment processing
- Transaction tracking
- Invoice generation
- Payment history

## Notification Module
- Push notifications via Firebase
- In-app notifications
- Email notifications
- Real-time notifications via Socket.io

## Message Module
- Direct messaging between users and providers
- Message history
- Real-time message delivery via Socket.io

## Analytics Module
- Service view tracking
- Performance metrics
- User engagement analytics

## Admin Module
- User and service management
- Payment monitoring
- System configuration
- Reports and analytics

---

# 🛡️ Code Quality

This project uses the following tools to maintain code quality:

* **TypeScript** → Static type checking and better IDE support
* **ESLint** → Code linting to catch potential issues
* **Zod** → Runtime schema validation

Run ESLint:

```bash
npm run lint
```

---

# 🚀 Deployment

### Before Deployment

1. Build the project:

```bash
npm run build
```

2. Test in production mode:

```bash
npm start
```

### Deployment Platforms

You can deploy this backend to various platforms:

* **Vercel** - Serverless deployment
* **Render** - Cloud platform
* **Railway** - Modern PaaS
* **AWS** - EC2, Lambda, Elastic Beanstalk
* **DigitalOcean** - Droplets or App Platform
* **Heroku** - Platform as a Service


# 🤝 Contributing

We welcome contributions! To contribute:

### Steps to Contribute

1. **Fork the repository** on GitHub

2. **Clone your fork:**
```bash
git clone https://github.com/Fahim-Hassan-Ovi/near-me-backend.git
cd near-me-backend
```

3. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

4. **Make your changes and commit:**
```bash
git add .
git commit -m "feat: Add your feature description"
```

5. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

6. **Open a Pull Request** on the main repository

### Coding Standards

- Write TypeScript with proper type annotations
- Follow the existing code structure and naming conventions
- Add comments for complex logic
- Test your changes before submitting a PR
- Keep commits focused and atomic

---

# 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.



