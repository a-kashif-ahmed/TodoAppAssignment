# To-Do App Backend

Node.js + Express + TypeScript + MongoDB REST API providing authentication
and task management for the React Native To-Do app.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/todo_app
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Run in dev mode (auto-restarts on file changes):

```bash
npm run dev
```

Build & run in production:

```bash
npm run build
npm start
```

## API Reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Route              | Body                              | Description         |
|--------|---------------------|-------------------------------------|----------------------|
| POST   | `/auth/register`    | `{ name, email, password }`        | Create an account, returns JWT |
| POST   | `/auth/login`        | `{ email, password }`              | Log in, returns JWT  |

Response shape:
```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

### Tasks

All task routes require `Authorization: Bearer <token>`.

| Method | Route                  | Body / Query                                                      | Description               |
|--------|-------------------------|---------------------------------------------------------------------|-----------------------------|
| GET    | `/tasks`                | query: `status=pending\|completed`, `category=<name>`, `sort=smart\|deadline\|priority\|dateTime` | List tasks (default sort: smart) |
| POST   | `/tasks`                | `{ title, description, dateTime, deadline, priority, category }`   | Create a task              |
| PUT    | `/tasks/:id`            | any subset of the fields above                                     | Update a task               |
| PATCH  | `/tasks/:id/toggle`     | –                                                                   | Toggle completed status     |
| DELETE | `/tasks/:id`            | –                                                                   | Delete a task                |

`priority` is one of `low | medium | high`. `dateTime` and `deadline` are ISO
date strings.

### Smart sort algorithm (bonus feature)

`src/utils/sortAlgorithm.ts` scores each task by blending three normalized
signals:

- **Deadline urgency** (50% weight) — how close/overdue the deadline is
- **Priority** (35% weight) — high/medium/low mapped to a 0–1 scale
- **Scheduled time** (15% weight) — how soon the task is scheduled

Completed tasks always sort to the bottom regardless of score.

## Project structure

```
src/
├── config/db.ts            # MongoDB connection
├── models/                 # Mongoose schemas (User, Task)
├── middleware/auth.ts      # JWT verification middleware
├── controllers/             # Route handler logic
├── routes/                  # Express routers
├── utils/sortAlgorithm.ts  # Smart-sort scoring function
└── index.ts                 # App entry point
```
