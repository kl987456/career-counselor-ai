# Career Counselor AI Chat Application

Welcome to the **Career Counselor AI Chat** app! This is a modern web application built with **Next.js, TypeScript, tRPC, Prisma, and TailwindCSS (ShadCN UI)**. The app allows users to chat with an **AI career counselor**, save chat sessions, and continue previous conversations seamlessly.

---

## Features

- **AI Career Counselor Chat**
  - Ask career-related questions and get meaningful AI guidance.
  - AI responses powered by OpenAI GPT API.
- **Chat Session Management**
  - Create, view, and delete multiple chat sessions.
  - Continue previous conversations.
- **Real-time AI Typing Indicator**
  - Shows an animated "AI is thinking..." indicator while the AI responds.
- **Dark/Light Mode Toggle**
- **Responsive Design**
  - Works on mobile, tablet, and desktop devices.

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, TailwindCSS (ShadCN UI), react-hot-toast  
- **Backend:** tRPC, Prisma ORM  
- **Database:** SQLite (development) / PostgreSQL (production)  
- **AI Integration:** OpenAI GPT API  

---

## Setup Instructions

1. **Clone the repository:**

git clone https://github.com/your-username/career-counselor-ai.git
cd career-counselor-ai
Install dependencies:

npm install
# or
yarn install


Set up environment variables:
Create a .env file in the root directory:

DATABASE_URL="sqlite:./dev.db" # or your PostgreSQL connection string
OPENAI_API_KEY="your_openai_api_key"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/trpc"


Run Prisma migrations:

npx prisma migrate dev --name init


Start the development server:

npm run dev
# or
yarn dev


Open http://localhost:3000
 in your browser.

Usage

Click + New to create a chat session.

Type your message in the input box and press Enter or Send.

AI responses will appear automatically.

Use the sidebar to switch between sessions or delete them.

Toggle dark/light mode using the button on the top-right.

author name :
Kamal Reddy