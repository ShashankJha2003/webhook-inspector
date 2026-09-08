# ⚡ Webhook Inspector

A real-time webhook inspection, debugging, and testing platform built with Next.js, Prisma ORM, and Neon Serverless PostgreSQL.

🔗 **Live Deployment:** [webhook-inspector-shashank.vercel.app](https://webhook-inspector-shashank.vercel.app)

---

## Features

- **Dynamic Bucket Provisioning:** Instantly generate disposable webhook capture endpoints without sign-up.
- **Server-Sent Events (SSE):** Stream incoming requests directly to the browser dashboard with sub-second latency.
- **Persistent Relational Storage:** Store and retrieve query parameters, nested JSON payloads, IP addresses, and HTTP headers in PostgreSQL.
- **One-Click Replay:** Convert any captured request into ready-to-run `curl` commands to replicate workflows locally.
- **Dark Mode Dashboard:** Monospace, developer-focused UI optimized for request inspection.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Prisma v6
- **Real-Time Streaming:** Server-Sent Events (SSE) via Web Streams API
- **Styling:** Tailwind CSS & Lucide Icons
- **Hosting:** Vercel

---

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ShashankJha2003/webhook-inspector.git](https://github.com/ShashankJha2003/webhook-inspector.git)
   cd webhook-inspector

2. **Install dependencies:**

    npm install

3. **Configure Environment Variables:**
    
    Create a .env file in the root directory:

    DATABASE_URL="your-neon-postgresql-connection-string"

4. **Sync Prisma schema:**

    npx prisma db push

5. **Start development server:**

    npm run dev

