# 📝 Task Board Assessment

A responsive Kanban-style task management application focused on smooth interactions, real-time updates, and a clean user experience.

---

## 🌟 Overview & High-Level Design Decisions

The goal of this project was to build a polished task board inspired by tools like Linear and Asana. Instead of just creating a basic task list, I focused on making the experience feel fast, intuitive, and reliable.

### Design Philosophy & Experience

* **Cohesive Aesthetics:**
  I used a dark theme with strong contrast to make tasks easy to scan. Cards stand out clearly against the background, helping users quickly understand the board layout.

* **Drag-and-Drop Behavior:**
  Drag interactions are adjusted based on device type. On desktop, dragging is immediate. On mobile, there’s a short delay (250ms) to prevent accidental drags while scrolling.

* **Clear System Feedback:**
  The UI handles loading and empty states clearly. For example, if no tasks match a search, a simple placeholder is shown. Loading indicators help users understand when something is happening in the background.

* **Optimistic UI Updates:**
  When a task is moved, the UI updates immediately. The database update happens asynchronously, so the app feels fast and responsive.

---

## 🚀 Live Demo & Links

* **Live Frontend App:** [Insert Vercel/Netlify Live Link Here]
* **GitHub Repository:** https://github.com/riwaj666/task-board-app

---

## 🛠️ Advanced Features Built

* **Task Activity Log (Audit Trail):**
  Each task keeps a history of actions such as status changes, edits, and creation. These are timestamped and displayed in a simple timeline view.

* **Due Date Urgency Indicators:**
  Tasks close to their deadline (within 48 hours) are highlighted to make them easier to notice.

* **Search & Filtering:**
  Users can search tasks by title and filter them by priority. This makes it easier to find tasks in larger boards.

* **Board Dashboard Statistics:**
  The dashboard shows useful metrics like total tasks, completed tasks, and overdue tasks. These update automatically as the data changes.

---

## 💾 Database Schema & Security Protocol

The application uses PostgreSQL via Supabase with Row Level Security (RLS).

When the app loads, a guest session is created. All data is scoped to the current user using:

```env
user_id = auth.uid()
```

This ensures each user only sees their own data.

---

### `tasks` table (RLS Enforced)

* `id`: UUID (Primary Key)
* `title`: Text (Required)
* `description`: Text (Optional)
* `status`: ('todo', 'in_progress', 'in_review', 'done')
* `priority`: ('low', 'normal', 'high')
* `due_date`: Date (Optional)
* `user_id`: UUID (Foreign Key → auth.users)
* `created_at`: Timestamp (Default: now())

---

### `activity_logs` table (RLS Enforced)

* `id`: UUID (Primary Key)
* `task_id`: UUID (Foreign Key → tasks.id, cascade delete)
* `user_id`: UUID (Foreign Key → auth.users)
* `content`: Text
* `type`: ('status_change', 'edit', 'creation')
* `created_at`: Timestamp (Default: now())

---

## ⚖️ Architectural Tradeoffs and Future Improvements

During development, I focused on building a solid and usable foundation. With more time, here are the improvements I would prioritize:

1. **State Management:**
   The app currently uses React state and local updates. I would introduce a solution like TanStack Query or Zustand to improve caching, synchronization, and handling of edge cases.

2. **Reducing Database Calls:**
   Rapid drag actions can trigger multiple updates. I would add debouncing or batching so only the final state is saved.

3. **Team Collaboration:**
   The app is currently single-user. I would extend the schema to support multiple users and task assignments using many-to-many relationships.

4. **Dedicated Backend Layer:**
   The frontend directly interacts with Supabase for simplicity. In a production system, I would introduce a backend (Node.js or Go) to handle business logic and background tasks like notifications.

---

## 💻 Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/riwaj666/task-board-app.git
```

2. Navigate into the project:

```bash
cd task-board-app
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:

```bash
npm run dev
```

---
