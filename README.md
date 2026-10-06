# CanteenIQ - College Canteen Food Demand Prediction System

CanteenIQ is a modern, responsive web application designed for college canteens to predict food demand, manage orders, track waste, and handle student reports.

## Features
- **Authentication**: Role-based access (Student / Admin).
- **Demand Prediction**: Smart forecasting based on moving averages, holidays, and pre-bookings.
- **Smart Queue Indicator**: Estimated wait times for pickup slots.
- **Food Booking**: Pre-order food with QR code generation.
- **Waste Management**: Log and track leftover food, flag high-waste items.
- **Reporting System**: Real-time issue reporting with image uploads.
- **Admin Dashboard**: Analytics, menu management, bookings management, and waste tracking.

## Setup Instructions

### 1. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method.
   - Enable **Email/Password**.
4. Enable **Firestore Database**:
   - Create a database in **Test Mode** (or start in Production mode and update rules later).
   - Once created, go to the **Rules** tab and paste the contents of `firestore.rules` from this project.
5. Enable **Cloud Storage**:
   - Create a bucket.
   - Go to the **Rules** tab and paste the contents of `storage.rules` from this project.
6. Get Firebase Configuration:
   - Go to Project Settings > General.
   - Under "Your apps", add a Web app.
   - Copy the configuration object (apiKey, authDomain, etc.).

### 2. Project Setup
1. Open `js/firebase-config.js`.
2. Replace the placeholder configuration object with your actual Firebase configuration.

### 3. Running the App
Since this app uses ES modules, it must be served over HTTP/HTTPS, not directly from the file system (`file://`).

You can use any local web server. For example:
- **VS Code**: Install the "Live Server" extension and click "Go Live".
- **Node.js**: Run `npx serve .` or `npx http-server -c-1` in the project root.
- **Python**: Run `python -m http.server 8000` in the project root.

### 4. Admin Seeding
1. Register a new user on the main page.
2. Manually change their role to `admin` in Firestore:
   - Go to Firestore Database > `users` collection.
   - Find the document matching your user's UID.
   - Change the `role` field from `"student"` to `"admin"`.
3. Log out and log back in to access the Admin dashboard.
4. On the Admin Dashboard, click **"Seed Data"** to populate sample menu items and 30 days of fake sales history for demand prediction testing.

## Technologies Used
- HTML5, CSS3, Vanilla JavaScript (ES Modules)
- Firebase v10 Modular SDK (Auth, Firestore, Storage)
- Chart.js (CDN) for analytics
- QRCode.js (CDN) for booking QR codes
- FontAwesome (CDN) for icons
