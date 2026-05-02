# Empyrean

A comprehensive IoT monitoring and management system with Python backend and React Native frontend.

## Project Structure

- **backend/** - Python backend service (MQTT broker, Firebase integration)
- **frontend/** - React Native mobile app (Expo)
- **firmware/** - Device firmware code

## Setup Instructions

### Backend Setup

1. **Navigate to the backend folder:**

   ```bash
   cd backend
   ```

2. **Create and activate the virtual environment:**

   ```bash
   # Create venv (if not already created)
   python -m venv .venv

   # Activate venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your configuration

5. **Run the backend:**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to the frontend folder:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Run on specific platform:**
   ```bash
   npm run android   # Android
   npm run ios       # iOS
   npm run web       # Web
   ```

## Dependencies

### Backend

- paho-mqtt >= 2.0.0
- firebase-admin >= 6.2.0
- python-dotenv >= 1.0.0

### Frontend

- React Native 0.81.5
- Expo 54.0
- Firebase 12.12.1
- React Navigation 7.x
- Chart Kit for visualizations

## Requirements

- Python 3.8+ (for backend)
- Node.js 18+ (for frontend)
- npm or yarn

## Getting Started

1. Clone the repository
2. Follow the Backend Setup and Frontend Setup sections above
3. Configure your environment variables in `.env`
4. Start both services in separate terminals
