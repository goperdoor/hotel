<div align="center">

# 🏨 Goperdoor Hotel Management System

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=30&duration=3000&pause=1000&color=F75C7E&center=true&vCenter=true&width=600&lines=Welcome+to+Goperdoor!;Hotel+Food+Ordering+System;Built+with+MERN+Stack;Real-time+Order+Tracking" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js"/>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/goperdoor/hotel?style=social" alt="GitHub stars"/>
  <img src="https://img.shields.io/github/forks/goperdoor/hotel?style=social" alt="GitHub forks"/>
  <img src="https://img.shields.io/github/watchers/goperdoor/hotel?style=social" alt="GitHub watchers"/>
</p>

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700">
</div>

---

**🚀 A comprehensive hotel food ordering and management platform built with the MERN stack**

*This system enables hotels to manage their menus, process orders, and track deliveries while providing customers with a seamless ordering experience.*

</div>

## 🚀 Features

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="400">
</div>

### 👨‍💼 Customer Features
- 🏨 Browse hotels by location and type (veg/non-veg)
- 📋 View detailed hotel information and menus
- 🛒 Place orders with real-time tracking
- 📊 Order status updates (pending → accepted → preparing → ready → completed)

### 🏪 Hotel Owner Features
- 🔐 Secure owner dashboard with authentication
- 📝 Menu management (add, edit, delete items)
- 📸 Image upload for menu items via Cloudinary
- ⚡ Real-time order management
- 👨‍🍳 Order status updates and kitchen workflow

### 👑 Admin Features
- 🎯 Complete system administration
- 🏨 Hotel registration and management
- 👥 User management (owners and admins)
- 📈 System-wide analytics and monitoring
- 🔄 Bulk operations and data seeding

## 🛠️ Tech Stack

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212257468-1e9a91f1-b626-4baa-b15d-5c385dfa7ed2.gif" width="100">
  <img src="https://user-images.githubusercontent.com/74038190/212257467-871d32b7-e401-42e8-a166-fcfd7baa4c6b.gif" width="100">
  <img src="https://user-images.githubusercontent.com/74038190/212257460-738ff738-247f-4445-a718-cdd0ca76e2db.gif" width="100">
  <img src="https://user-images.githubusercontent.com/74038190/212257465-7ce8d493-cac5-494e-982a-5a9deb852c4b.gif" width="100">
</div>

### 🎨 Frontend
- **React 18** - Modern UI framework
- **React Router DOM** - Client-side routing  
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### ⚙️ Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage and management
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="100">
</div>

```
hotel/
├── 🎨 client/                 # React frontend
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 🧩 components/     # Reusable UI components
│   │   ├── 🔄 context/        # React context providers
│   │   ├── 📄 pages/          # Page components
│   │   │   ├── 👑 admin/      # Admin dashboard pages
│   │   │   └── 🏪 owner/      # Owner dashboard pages
│   │   └── 🛠️ services/       # API service layer
│   └── 📦 package.json
└── ⚙️ server/                 # Node.js backend
    ├── 📁 src/
    │   ├── 🔧 config/         # Database configuration
    │   ├── 🎯 controllers/    # Route handlers
    │   ├── 🛡️ middleware/     # Custom middleware
    │   ├── 📊 models/         # Mongoose schemas
    │   ├── 🛣️ routes/         # API routes
    │   ├── 🌱 seed/           # Database seeding scripts
    │   └── 🛠️ utils/          # Utility functions
    └── 📦 package.json
```

## 🚀 Getting Started

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="500">
</div>

### ✅ Prerequisites
- 📦 Node.js (v16 or higher)
- 🍃 MongoDB (local or Atlas)
- ☁️ Cloudinary account (for image uploads)

### 🛠️ Environment Setup

1. **📥 Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel
   ```

2. **⚙️ Server Environment Variables**
   Create `server/.env` file:
   ```env
   # 🗄️ Database
   MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/goperdoor?retryWrites=true&w=majority
   
   # 🔐 Authentication
   JWT_SECRET=your-jwt-secret-key
   
   # 👑 Admin Seeding
   ADMIN_EMAIL=admin@goperdoor.com
   ADMIN_PASSWORD=admin123
   
   # ☁️ Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_FOLDER=goperdoor
   
   # 🌐 Server
   PORT=5000
   ```

3. **📦 Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

### 🗄️ Database Setup

1. **🌱 Seed Admin User**
   ```bash
   cd server
   npm run seed
   ```

2. **📋 Seed Sample Menus** (optional)
   ```bash
   npm run seed:menus
   ```

### 🎬 Running the Application

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284136-03988914-d899-44b4-b1d9-4eeccf656e44.gif" width="200">
</div>

1. **⚡ Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   🌐 Server runs on `http://localhost:5000`

2. **🎨 Start the Frontend**
   ```bash
   cd client
   npm start
   ```
   🌐 Client runs on `http://localhost:3000`

## 🔐 Authentication & Authorization

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284094-e50ceae2-de86-4dd8-b87b-1dc0c3fff9b4.gif" width="300">
</div>

### 👥 User Roles
- **👑 Admin**: Full system access, can manage hotels and owners
- **🏪 Owner**: Manage their hotel's menu and orders
- **👨‍💼 Customer**: Public access for browsing and ordering

### 🔑 Login Endpoints
- 👑 Admin Login: `/admin/login`
- 🏪 Owner Login: `/owner/login`

### 🎯 Default Admin Credentials
- 📧 Email: As set in `ADMIN_EMAIL` environment variable
- 🔐 Password: As set in `ADMIN_PASSWORD` environment variable

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Hotels
- `GET /api/hotels` - List all active hotels
- `POST /api/hotels` - Create hotel (admin only)
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel (admin only)

### Menu Management
- `GET /api/menu/:hotelId` - Get hotel menu
- `POST /api/menu` - Add menu item (owner/admin)
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders/hotel/:hotelId` - Get hotel orders (owner)
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/track/:orderNumber` - Track order

### File Upload
- `POST /api/upload` - Upload images to Cloudinary (auth required)

## 🖼️ Image Management

### Cloudinary Integration
- Automatic image optimization and resizing
- Secure upload with authentication
- File size limit: 5MB
- Supported formats: JPG, PNG, WebP

### Upload Flow
1. User selects image file
2. Frontend sends to `/api/upload`
3. Server uploads to Cloudinary
4. Returns secure URL for database storage

## 🔄 Order Management Workflow

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284145-bf2c01a8-c448-4f1a-b911-996024c84606.gif" width="400">
</div>

1. **🛒 Customer Places Order**
   - Selects items and quantities
   - Provides contact information
   - Receives order number for tracking

2. **📊 Order Processing States**
   ```
   🟡 pending → ✅ accepted → 👨‍🍳 preparing → 🎉 ready → ✨ completed
                    ↓
                  ❌ cancelled
   ```

3. **⚡ Real-time Updates**
   - Order status updates via WebSocket
   - Notifications for status changes

## 🧪 Development Scripts

### Server
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed admin user
- `npm run seed:menus` - Seed sample menu data

### Client
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🚀 Deployment

### Environment Considerations
- Set `NODE_ENV=production` in production
- Configure production MongoDB URI
- Set secure JWT secret
- Configure Cloudinary for production

### Build Process
```bash
# Build client
cd client
npm run build

# The build folder can be served statically
# or integrated with the Express server
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- Secure file upload validation
- Environment variable protection

## 🤝 Contributing

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="300">
</div>

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✨ Make your changes
4. 🧪 Add tests if applicable
5. 📤 Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="300">
</div>

For support and questions:
- 🐛 Create an issue in the repository
- 📧 Contact the development team

---

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284087-bbe7e430-757e-4901-90bf-4cd2ce3e1852.gif" width="50">
  <br>
  <b>Built with ❤️ by the Goperdoor Team</b>
  <br><br>
  <img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="Built with Love">
  <img src="https://forthebadge.com/images/badges/made-with-javascript.svg" alt="Made with JavaScript">
  <img src="https://forthebadge.com/images/badges/powered-by-coffee.svg" alt="Powered by Coffee">
</div>

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="900">
</div>
