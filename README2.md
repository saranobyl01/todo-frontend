# Todo Application with Telegram Reminders

A full-stack Todo list application built with React, Vite, Tailwind CSS, PostgreSQL, and FastAPI.

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL
- **Background Jobs**:
  - The FastAPI backend runs an internal asyncio background task that polls the database and triggers Telegram notifications using `httpx`.

## Prerequisites
- Node.js 18+ (for running the Frontend)
- Python 3.10+ (for running the Backend)
- PostgreSQL 14+

---

## 1. Database Setup (Local)

1. Open pgAdmin, psql, or any database client connected to your local PostgreSQL instance.
2. Open the file `db/schema.sql` and run it completely. This will create:
   - `auth` and `public` schemas
   - `todos`, `users`, and `user_telegram` tables

---

## 2. Backend Setup (Local)

1. Open a terminal and navigate to the backend folder:
```bash
cd backend
```
2. Create a virtual environment and activate it (optional but recommended):
```bash
python -m venv venv
venv\Scripts\activate
```
3. Install dependencies:
```bash
pip install -r requirements.txt
```
4. Set up your environment variables (or just rely on the defaults which use `postgres:postgres@localhost:5432/todo_db` and standard JWT secret).
   Optionally create a `.env` file in the `backend` folder.

5. Start the FastAPI server:
```bash
uvicorn main:app --reload --port 3000
```
FastAPI should now be listening on `http://localhost:3000`.

---

## 3. Frontend Setup

1. Open a terminal and navigate to the frontend folder:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the `frontend` folder to point to FastAPI:
```env
VITE_API_URL=http://localhost:3000
```
4. Start the development server:
```bash
npm run dev
```
5. Open your browser to `http://localhost:5173`. You can now sign up, log in, and manage your todos!

---

## 4. Setting Up Telegram Reminders

### Creating a Telegram Bot via BotFather
1. Open Telegram and search for **@BotFather**.
2. Send the message `/newbot` to create a new bot.
3. Choose a name and a username for your bot (username must end in `bot`, e.g., `SaranTodoBot`).
4. BotFather will give you a **Bot Token** (e.g., `123456789:ABCdefGHIjklmnoPQRstuvwxyz`). Keep this secret!

### Setting the Bot Token
Run this command in your PostgreSQL database to configure the bot token globally so the backend can use it:
```sql
ALTER DATABASE todo_db SET app.settings.telegram_bot_token = 'YOUR_BOT_TOKEN_HERE';
```
Alternatively, set the `TELEGRAM_BOT_TOKEN` environment variable for the FastAPI backend.

### Finding your Personal Chat ID
To receive messages, the app needs your personal Chat ID:
1. Search for your newly created bot in Telegram and click **Start** (or send `/start`).
2. Open a web browser and go to:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN_HERE>/getUpdates`
3. Look for the `"chat": {"id": 123456789}` section. The number is your Chat ID.
4. Open the Todo App **Settings** page and enter this Chat ID. Enable notifications.
