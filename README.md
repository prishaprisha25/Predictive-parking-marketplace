# 🅿️ Predictive Parking Marketplace

[![Hackathon](https://img.shields.io/badge/Hackathon-Project-blueviolet?style=for-the-badge)](https://github.com/prishaprisha25/Predictive-parking-marketplace)
[![React Native](https://img.shields.io/badge/React_Native-v0.7x-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-v50-000020?style=for-the-badge&logo=expo)](https://expo.dev/)

**Predictive Parking Marketplace** is a high-performance, AI-driven mobile application designed to eliminate urban parking stress. By combining P2P commerce with real-time predictive analytics and a "Zero-UI" driving experience, it transforms how people find and book parking in congested cities like Chandigarh and Mumbai.

---

## 🌟 Key Features

### 🧠 AI-Powered Predictive Mapping
*   **Live Occupancy Tracking**: Visual progress bars showing available vs. total spots.
*   **Pulse Confidence Markers**: AI-verified high-probability spots pulse on the map for instant recognition.
*   **Dynamic Surge Pricing**: Real-time rate adjustments based on localized demand and peak hours.

### 🎙️ Ambient Driving Mode (Zero-UI)
*   **Voice Interface**: Interactive status updates and navigation guidance to keep your eyes on the road.
*   **Safety-First Controls**: High-contrast, large-format UI for distraction-free operation.
*   **Geo-Checkout**: Automated session tracking and one-tap checkout logic.

### 💰 P2P Marketplace & Smart Wallet
*   **List Your Spot**: Monetize your private driveway or parking space in seconds.
*   **Frictionless Booking**: Integrated digital wallet with 60ms transaction processing.
*   **Multi-Method Payments**: Seamlessly supports Wallet, UPI, and Card transactions.

### 🛡️ Safety & Anti-Mafia System
*   **Phantom Spot Detection**: Community-driven reporting system to flag fake or blocked spots.
*   **Trust Scores**: Earn points for verifying availability and maintaining a high community rating.
*   **Emergency Hub**: 5-second SOS trigger, live location sharing, and safe-zone mapping.

### 📊 Sustainability & Analytics
*   **Eco-Insights**: Calculates CO2 emissions saved by reducing cruising time.
*   **Usage Trends**: Visual 7-day analytics showing your parking habits and savings.

---

## 🛠️ Tech Stack

*   **Frontend**: React Native with Expo (TypeScript)
*   **Navigation**: React Navigation (Native Stack & Bottom Tabs)
*   **Styling**: Premium Custom Design System (Glassmorphism & Dark Mode)
*   **Icons**: Lucide React Native
*   **Animations**: React Native Reanimated & Animated API
*   **Maps**: React Native Maps with Custom Region Logic

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   Expo Go app on your mobile device

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/prishaprisha25/Predictive-parking-marketplace.git
    cd Predictive-parking-marketplace
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npx expo start -c
    ```

4.  **Launch the App**:
    *   Scan the QR code with your **Expo Go** app (Android) or Camera app (iOS).
    *   Press `a` for Android Emulator or `i` for iOS Simulator.

---

## 📁 Project Structure

```text
src/
├── context/      # Global State Management (AppContext)
├── navigation/   # AppNavigator & Tab Configurations
├── screens/      # All App Screens (Home, Ambient, Safety, etc.)
├── theme/        # Global Styles & Color Tokens
├── types/        # TypeScript Interfaces
└── utils/        # Mock Data & Helper Functions (Chandigarh/Mumbai Data)
```

---

## 🏙️ Deployment Cities
The application is currently optimized and pre-configured for:
- **Chandigarh**: Sector 17, Elante Mall, Sector 22, PGI Campus.
- **Mumbai**: BKC, Andheri East, Nariman Point, Powai.

---

## 📄 License
This project is developed for a hackathon and is open for community contributions.

---

**Developed with ❤️ for the future of Smart Cities.**
