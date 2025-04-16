# @squirrel-scheduler/core

A lightweight scheduling library for Node.js. @squirrel-scheduler/core lets you queue tasks to be executed in the future, store them in any database, and poll for pending tasks at your own pace.

## Features

- **Database-Agnostic**: Implement a simple `SDBAdapter` interface for your preferred DB (MySQL, PostgreSQL, MongoDB, etc.)
- **Pluggable**: Already includes a `DrizzleAdapter` for SQLite databases
- **Retry Logic**: Handle transient failures by incrementing `retryCount` and rescheduling tasks if needed
- **Simple Polling**: Call `.sync()` on your own schedule (e.g., via setInterval, cron, or an external trigger)

## Installation

```bash
npm install @squirrel-scheduler/core
```

Or with pnpm:

```bash
pnpm add @squirrel-scheduler/core
```

## Quick Usage Example

```typescript
import { SScheduler } from "@squirrel-scheduler/core";

// Import your custom DB adapter that implements SDBAdapter
// e.g., the Drizzle Adapter:
import { SQLiteDrizzleAdapter } from "@squirrel-scheduler/drizzle-adapter";

// Suppose we have a drizzle-orm instance configured for SQLite
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DB_URL, 
  authToken: process.env.TURSO_DB_TOKEN
});
const db = drizzle(client);

(async () => {
  // 1. Create an adapter
  const dbAdapter = SQLiteDrizzleAdapter(db);

  // 2. Create a scheduler instance
  const scheduler = new SScheduler(dbAdapter);

  // 3. Add tasks
  scheduler
    .add({
      payload: { event: "sendEmail", to: "user@example.com" },
      scheduledAt: new Date(Date.now() + 5000), // 5 seconds in the future
    })
    .add({
      payload: { event: "generateReport", reportId: "abc123" },
      scheduledAt: new Date(Date.now() + 15000), // 15 seconds in the future
    });

  // 4. Persist tasks in the DB
  await scheduler.schedule();

  // 5. Later or periodically, call sync() to claim & execute due tasks
  await scheduler.sync();
})();
```

## Conceptual Overview

### Add Tasks

You enqueue tasks by calling `.add()` on the `SScheduler` instance, specifying a payload and a `scheduledAt` timestamp.

### Store Tasks

Invoke `.schedule()` to persist them in your database via the adapter.

### Sync & Execute

Periodically (or on-demand), call `.sync()`:

1. Fetches pending tasks that are due (`scheduledAt <= now`)
2. Claims them (sets `status = in_progress`)
3. Executes each task (the default example logs or simulates your action)
4. On success, updates status to `completed`. On failure, increments `retryCount` and reschedules or fails based on `maxRetries`

## SDBAdapter

The `SDBAdapter` interface defines how to store, update, and fetch tasks. This core package is database-agnostic. If you need a ready-made solution for SQLite with Drizzle ORM, check out `@squirrel-scheduler/drizzle-adapter`.

### SDBAdapter Interface

Implement these methods to integrate with any DB:

```typescript
export interface SDBAdapter {
  createTask(data: Omit<STask, "id" | "status" | "retryCount" | "createdAt" | "updatedAt">): Promise<STask>;
  createTasks(data: Array<Omit<STask, "id" | "status" | "retryCount" | "createdAt" | "updatedAt">>): Promise<STask[]>;
  getTask(id: string): Promise<STask | null>;
  listTasks(params: ListTasksParams): Promise<STask[]>;
  updateTask(taskId: string, update: Partial<Omit<STask, "id">>): Promise<STask>;
  claimTasks(tasks: STask[]): Promise<STask[]>;
  setLastSync(at?: Date, args?: { totalTasks: number }): Promise<void>;
  recordTaskAttempt(taskId: string, result: TaskAttemptResult): Promise<void>;
  pruneTasks(params: PruneTasksParams): Promise<number>;
  getLastSync(): Promise<{ timestamp: number | Date; totalTasks: number }>;
}
```

Implementing these methods for your DB of choice allows SquirrelScheduler to store and update tasks seamlessly.

## Roadmap

- Official Adapters for MySQL, PostgreSQL, MongoDB, etc.
- Concurrency: Parallel execution of tasks (optional)
- Retry Strategies: Exponential backoff, custom scheduling for failed tasks
- UI / Dashboard: Possibly track scheduled tasks visually

## Contributing

We love contributions! Feel free to open PRs for new adapters, additional features, or bug fixes.
See CONTRIBUTING.md (if you have one) for guidelines.

## License

MIT

Happy Scheduling! If you have questions or feedback, open an issue on GitHub.