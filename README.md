# 🌟 Nona AI

> A modern platform for discovering, creating, and chatting with unique AI personalities.

<div align="center">
  <img src="https://files.catbox.moe/obic5w.png" alt="Nona AI Logo" width="150" />
</div>

<br />

Nona AI allows users to bring their imagination to life by designing custom AI characters with distinct personalities, backgrounds, and conversational styles. Whether you want to chat with a helpful assistant, a fantasy wizard, or a cyberpunk hacker, Nona AI makes it seamlessly possible.

## ✨ Features

- **🤖 Create Custom AI Characters:** Define your character's name, short description, avatar, and core personality (system prompt).
- **🔍 Discover & Search:** Browse a community-driven feed of public AI characters and easily search by name or description.
- **💬 Real-time Chat:** Engage in dynamic, context-aware conversations with diverse AI personalities powered by Groq.
- **🎨 Theming:** Beautiful, responsive UI with full support for both **Light** and **Dark** modes.
- **🔐 Secure Authentication:** Seamless user login, onboarding, and profile management via Firebase.
- **🔒 Privacy Controls:** Choose to keep your created characters private or share them publicly with the world.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **Routing:** React Router v6
- **Backend & Database:** Firebase (Authentication, Firestore)
- **AI Integration:** Groq API (Llama 3)
- **Deployment:** Vercel (Serverless Functions)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase Project (for Auth and Firestore)
- Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/s-n-t09/nona-ai.git
   cd nona-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your necessary API keys and Firebase configuration (refer to `.env.example`):
   ```env
   VITE_FIREBASE_API_KEY="your_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
   VITE_FIREBASE_DATABASE_ID="(default)"
   
   GROQ_API_KEY="your_groq_api_key"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to see the app in action.

## ☁️ Deploying to Vercel

This project is pre-configured for deployment on Vercel with Serverless Functions (`/api/chat.ts`).

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com/) and create a new project from your repository.
3. In the **Environment Variables** section, add all the variables from your `.env` file (`VITE_FIREBASE_*` and `GROQ_API_KEY`).
4. Click **Deploy**. Vercel will automatically detect Vite and set up the routing using `vercel.json`.

## 👨‍💻 Author

Created with ❤️ by **[s-n-t09](https://github.com/s-n-t09)**

## 📄 License

This project is licensed under the MIT License.
