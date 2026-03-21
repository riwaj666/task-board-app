# 📝 Task Board Assessment

A premium, highly-responsive Kanban-style task management application designed for seamless user experience, real-time synchronization, and structural scalability.

## 🌟 Overview & High-Level Design Decisions
My core objective was to build a cohesive, luxury-feeling task board inspired by modern productivity tools (like Linear and Asana) rather than a simple functional list. I approached this with strong intentional design and robust state handling to provide a friction-free experience.

**Design Philosophy & Experience:**
- **Cohesive Aesthetics:** I established a customized dark-theme aesthetic featuring glassmorphism elements, custom scrollbars, and deep contrast panels to build a clear visual hierarchy. Cards visually pop against the saturated background, allowing users to intuitively scan columns at a glance.
- **Fluid Drag-and-Drop Constraints:** To maintain a predictable feel across varying screen sizes, the drag physics dynamically adjust. Desktop users can drag tasks instantly by default, while mobile-touch visitors have a strict 250ms press-delay threshold. This solves the notoriously frustrating issue of users accidentally picking up task cards when simply trying to scroll the page.
- **Clear System Feedback:** Implemented loading states and empty states so users invariably understand what is happening. Searching for a task that doesn’t exist returns a stylized placeholder, and explicit loading spinners indicate asynchronous activity.
- **Zero-Latency Feedback:** The application employs highly optimistic UI strategies. When a task is dragged, the state instantly mutates in the DOM to feel immediate, while an asynchronous fetch to the database gracefully handles data synchronization in the background.

## 🚀 Live Demo & Links
- **Live Frontend App:** [Insert Vercel/Netlify Live Link Here]
- **GitHub Repository:** [https://github.com/riwaj666/task-board-app](https://github.com/riwaj666/task-board-app)

## 🛠️ Advanced Features Built
- **Task Activity Log (Audit Trail):** Every task actively tracks user interactions in an expandable chronological history dialogue. When a user drags a card across columns or selectively updates its properties, an immutable, timestamped payload (e.g. "Status changed from To Do to In Progress") is injected. The UI parses and color-tags these dynamic elements for premium readability.
- **Due Date Urgency Indicators:** To compel adherence to deadlines, the tasks run through an urgency algorithm. If a task matures to <= 48 hours remaining, the component dynamically shifts structure, wrapping the card in an assertive red-orange gradient stroke and forcing a clock icon to seize the viewer's attention.
- **Search & Dynamic Filtering:** To resolve buried tasks during intense productivity, the main view integrates a heavily debounced client-side textual search alongside strict categorical priority filtering.
- **Board Dashboard Statistics:** A responsive analytical header continuously sweeps the application state to aggregate and broadcast metrics like the total board volume, completed tasks, and currently overdue tasks relative to the local datetime.

## 💾 Database Schema & Security Protocol
Data persistence relies on PostgreSQL via Supabase, with Anonymous Auth strictly managing Row Level Security (RLS). When the application mounts, it guarantees a guest session is established. Using `user_id = auth.uid()` in RLS policies logically segregates data so every visitor experiences a perfectly private, isolated workspace.

### `tasks` table (RLS Enforced)
- `id`: UUID (Primary Key)
- `title`: Text (Required)
- `description`: Text (Optional)
- `status`: String ('todo', 'in_progress', 'in_review', 'done')
- `priority`: String ('low', 'normal', 'high')
- `due_date`: Date (Optional)
- `user_id`: UUID (Foreign Key linking to `auth.users`)
- `created_at`: Timestamp (Default: now())

### `activity_logs` table (RLS Enforced)
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key to tasks.id, cascades on deletion)
- `user_id`: UUID (Foreign Key linking to `auth.users`)
- `content`: Text (e.g., "Status changed from To Do to In Progress")
- `type`: String ('status_change', 'edit', 'creation')
- `created_at`: Timestamp (Default: now())

## ⚖️ Architectural Tradeoffs and Future Improvements
During the scope of the assessment, I deliberately navigated several architectural tradeoffs to establish a high-quality fundamental baseline. If I were provisioning this system for mass production or scaling a larger engineering team, my interview discussion points for improvement would be:

1. **Advanced State Management:** Currently, state flows via local React structures wrapped by Context APIs alongside raw database subscriptions. I would introduce standard complex declarative caching layers (e.g., TanStack Query or Zustand) to centrally warehouse these optimistic updates, handle race conditions across fast drag-and-drops, and efficiently deduplicate network requests.
2. **Database Operation Debouncing:** Extremely rapid, erratic dragging over many columns briefly spams the database updater via sequential fetches. To protect backend operations, I would implement robust debounce/queue strategies so that the database is only informed of the user's *final* resting drop choice securely, rather than every transient hover state calculation.
3. **Relational Team Members Implementation:** While I conceptualized the SQL models for assigning multiple contributors, I purposely deferred writing the `team_members` and `task_assignees` junction architecture to surgically prioritize the mobile drag-and-drop physics and aesthetic consistency. Because the foundation is built stringently upon UUIDs, implementing many-to-many relationship tracking is my definitive next priority step.
4. **Extracting a Dedicated Backend:** Integrating the frontend directly with a BaaS over RLS is excellent for prototyping sheer velocity. However, to encapsulate sophisticated business logic—like executing CRON jobs to automatically email users their overdue tasks—I would inevitably abstract the core DB mutators into an isolated, dedicated API layer (using Go or Node).

## 💻 Setup Instructions
1. Clone the repository locally: `git clone https://github.com/riwaj666/task-board-app.git`
2. Navigate inside the project directory.
3. Install dependencies using: `npm install`
4. Create a `.env` file in the root configuration directory and explicitly declare your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
5. Start the local development environment: `npm run dev`
