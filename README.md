# 🌐 UptimeMatrix  

> **Modern observability and monitoring platform** – check uptime, get alerts, manage status pages, view logs, and more.  

Inspired by BetterStack but fully custom-built to learn and scale real-world monitoring.  

---

## ✨ Features  

- ✅ **Uptime Monitoring** – Track website & API health across regions  
- ✅ **Instant Alerts** – Get notified when downtime happens  
- ✅ **Beautiful Status Pages** – Share real-time system health with your users  
- ✅ **Log Management** – Collect and analyze application logs  
- ✅ **Team Collaboration** – Invite members, assign escalation policies  
- ✅ **Stripe Billing Integration** – Subscription-based SaaS (cloud-only)  

---

## 🛠️ Tech Stack  

- **Frontend:** [Next.js](https://nextjs.org/) + [shadcn/ui](https://ui.shadcn.com/)  
- **Backend:** [Express.js](https://expressjs.com/) + [Prisma](https://www.prisma.io/)  
- **Database:** PostgreSQL  
- **Messaging:** Redis Streams  
- **Realtime:** Pusher  
- **Infra:** Docker + AWS (planned)  

---

## 🚀 Getting Started  

### 1️⃣ Clone the repo  
```bash
git clone https://github.com/atul-5242/uptimematrix.git
cd uptimematrix


3️⃣ Setup environment

Create a .env file in apps/api and apps/web with your config:
DATABASE_URL="postgresql://user:password@localhost:5432/uptimematrix"
REDIS_URL="redis://localhost:6379"
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
STRIPE_SECRET_KEY=""


4️⃣ Run locally
pnpm dev

Visit: http://localhost:3000 🎉

📦 Monorepo Structure

uptimematrix/
 ├── apps/
 │   ├── web/        # Next.js frontend
 │   ├── api/        # Express backend (REST APIs)
 │   ├── worker/     # Worker for Redis stream processing
 │   └── pusher/     # Realtime events
 ├── packages/
 │   ├── store/      # Prisma ORM schema + client
 │   └── redisstream/# Redis stream utilities
 └── README.md

📜 License

This project is licensed under the Business Source License (BSL 1.1).

✅ Free for personal, educational, research, or internal use

✅ You can run locally and modify the code

❌ You cannot host or sell it as a SaaS/managed service (that right is reserved for uptimematrix.in
)

See LICENSE
 for full details.


🤝 Contributing

We welcome contributions to improve UptimeMatrix.
To contribute:

Fork the repository

Create a feature branch: git checkout -b feature/your-feature

Commit changes: git commit -m "feat: add your feature"

Push to branch: git push origin feature/your-feature

Open a Pull Request 🎉

📧 Contact

Created with ❤️ by Atul Maurya (atulmaurya.in)
🌐 uptimematrix.atulmaurya.in