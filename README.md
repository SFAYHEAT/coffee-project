# ☕ Coffee Project

A modern full-stack Coffee Shop management platform built with **React Native**, **Expo**, **Node.js**, **Express**, and **MongoDB**. The application provides a complete digital experience for customers and administrators, including QR table ordering, loyalty rewards, AI-powered assistance, and real-time order management.

---

## ✨ Features

### 👤 Customer
- Secure authentication (Login & Register)
- Browse products by category
- Search products
- Product details
- Shopping cart
- Place orders
- QR Code table ordering
- Live order tracking
- Loyalty points system
- Reward redemption
- Spin Wheel rewards
- Achievements & badges
- Favorites
- Profile management
- Weather-based drink recommendations
- AI Coffee Assistant
- Contact & reclamation system
- Multi-language support

### 👨‍💼 Admin
- Dashboard & statistics
- Product management (CRUD)
- Category management
- User management
- Order management
- Table management
- Complaint management
- Image uploads
- QR Code generation
- Sales monitoring

---

# 🛠️ Tech Stack

## Frontend
- React Native
- Expo
- TypeScript
- Expo Router
- React Context API
- AsyncStorage

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Cloudinary
- Multer
- Socket.io

---

# 📁 Project Structure

```
coffee-project/
│
├── backend/
│
├── frontend/
│
└── README.md
```

---

# 🚀 Backend Installation

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure your environment variables.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

WEATHER_API_KEY=your_weather_api_key
```

Start the backend:

```bash
npm start
```

or

```bash
node server.js
```

If your project supports development mode:

```bash
npm run dev
```

---

# 📱 Frontend Installation

Open another terminal.

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

or

```bash
npm start
```

Scan the QR code with **Expo Go** or run on an emulator.

---

# 📷 Main Features

- QR Code Ordering
- Loyalty & Rewards
- AI Coffee Assistant
- Weather Recommendations
- Table Reservation
- Admin Dashboard
- Real-Time Order Tracking
- Image Uploads
- Customer Complaints
- Favorites
- Achievements
- Secure Authentication

---

# 🔐 Authentication

The application uses **JWT (JSON Web Token)** for secure authentication and role-based authorization for customers and administrators.

---

# 🌦️ Smart Recommendations

The application provides weather-aware beverage suggestions, helping users discover drinks that match current weather conditions.

---

# 🤖 AI Assistant

An integrated AI assistant helps users by:

- Recommending drinks
- Answering menu questions
- Providing product information
- Suggesting similar items

---

# 📸 Screenshots

Add screenshots of the mobile application here.

Example:

```
screenshots/
    home.png
    menu.png
    cart.png
    loyalty.png
    admin.png
```

---

# 📄 License

This project is developed for educational and portfolio purposes.

---

# 👨‍💻 Author

**Ahmed Sfaihi**

- GitHub: https://github.com/SFAYHEAT
- LinkedIn: https://www.linkedin.com/in/ahmed-sfaihi
