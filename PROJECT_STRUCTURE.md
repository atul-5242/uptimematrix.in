# 🏗️ UptimeMatrix - Project Structure Documentation

## 📋 Overview

UptimeMatrix is a comprehensive uptime monitoring application built with a modern Turbo Repo monorepo architecture. The project consists of multiple applications and shared packages designed for scalability and maintainability.

## 🗂️ Root Directory Structure

```
webapp-on/
├── 📁 apps/                    # Application services
│   ├── 🌐 web/                # Next.js frontend application
│   ├── 🔌 api/                # Express.js backend API
│   ├── 📡 pusher/             # Real-time notification service
│   ├── 🧪 test/               # Testing suite
│   └── 👷 worker/             # Background job processor
├── 📦 packages/               # Shared packages and utilities
│   ├── 🗄️ store/             # Prisma database layer
│   ├── 🔄 redisstream/        # Redis streaming utilities
│   ├── 🎨 ui/                 # Shared UI components
│   ├── ⚙️ eslint-config/      # ESLint configuration
│   └── 📝 typescript-config/  # TypeScript configuration
├── 🛠️ scripts/               # Build and deployment scripts
├── 🐳 docker-compose.yml      # Development environment setup
├── 📋 package.json            # Root package configuration
├── 🔧 turbo.json              # Turbo build configuration
├── 🔒 pnpm-workspace.yaml     # PNPM workspace configuration
└── 📄 README.md               # Project documentation
```

## 🌐 Applications (`/apps`)

### 1. **Web Application** (`/apps/web`)
**Technology**: Next.js 13.5.1 with TypeScript
**Purpose**: Frontend dashboard and user interface

```
apps/web/
├── 📁 app/                    # Next.js 13 App Router
│   ├── 🏠 dashboard/          # Main dashboard pages
│   │   ├── (uptime)/          # Uptime monitoring routes
│   │   │   ├── monitoring/    # Monitoring dashboard
│   │   │   ├── incidents/     # Incident management
│   │   │   └── analytics/     # Analytics and reports
│   │   └── (settings)/        # Settings routes
│   ├── 🔐 auth/              # Authentication pages
│   ├── 🎯 all-actions/       # Server actions
│   └── 🧩 components/        # Page-specific components
├── 🎨 components/            # Reusable UI components
│   ├── ui/                   # Base UI components (Radix UI)
│   ├── forms/                # Form components
│   ├── charts/               # Chart components
│   └── layout/               # Layout components
├── 🪝 hooks/                 # Custom React hooks
├── 📚 lib/                   # Utility functions
├── 🏪 store/                 # Redux store configuration
├── 🎭 types/                 # TypeScript type definitions
└── 📋 package.json           # Web app dependencies
```

**Key Dependencies**:
- Next.js 13.5.1
- React 18.2.0
- Radix UI components
- Redux Toolkit
- Tailwind CSS
- Recharts for analytics

### 2. **API Service** (`/apps/api`)
**Technology**: Express.js with TypeScript
**Purpose**: Backend REST API and business logic

```
apps/api/
├── 🎮 controllers/           # Request handlers
│   ├── authController.ts     # Authentication logic
│   ├── monitorController.ts  # Monitor management
│   ├── incidentController.ts # Incident handling
│   └── analyticsController.ts # Analytics processing
├── 🛡️ middlewares/          # Express middlewares
│   └── middleware.ts         # Auth and validation
├── 🛣️ routes/               # API route definitions
│   ├── authRoutes.ts         # Authentication routes
│   ├── monitorRoutes.ts      # Monitor CRUD routes
│   ├── incidentRoutes.ts     # Incident management
│   └── analyticsRoutes.ts    # Analytics endpoints
├── 🔧 utils/                # Utility functions
├── 📋 index.ts              # Express app entry point
├── 🏷️ types.ts             # TypeScript definitions
└── 📋 package.json          # API dependencies
```

**Key Dependencies**:
- Express.js 5.1.0
- Prisma client
- JWT authentication
- Zod validation
- Nodemailer
- Axios

### 3. **Pusher Service** (`/apps/pusher`)
**Technology**: Node.js with TypeScript
**Purpose**: Real-time notifications and WebSocket handling

```
apps/pusher/
├── 📋 index.ts              # Pusher service entry point
├── 📋 package.json          # Pusher dependencies
└── 📄 README.md             # Service documentation
```

**Key Dependencies**:
- Redis streams
- WebSocket handling
- Real-time event processing

### 4. **Test Suite** (`/apps/test`)
**Technology**: Vitest
**Purpose**: End-to-end and integration testing

```
apps/test/
├── 🧪 utils/                # Test utilities
├── 📋 package.json          # Test dependencies
└── 📄 README.md             # Testing documentation
```

### 5. **Worker Service** (`/apps/worker`)
**Technology**: Node.js with TypeScript
**Purpose**: Background job processing and scheduled tasks

```
apps/worker/
├── 📋 package.json          # Worker dependencies
└── 📄 README.md             # Worker documentation
```

## 📦 Shared Packages (`/packages`)

### 1. **Store Package** (`/packages/store`)
**Purpose**: Database layer with Prisma ORM

```
packages/store/
├── 🗄️ prisma/              # Database schema and migrations
│   ├── schema.prisma        # Database schema definition
│   ├── migrations/          # Database migration files
│   └── seeds/               # Database seed data
├── 📋 index.ts              # Package entry point
├── 🏷️ types.ts             # Database type definitions
└── 📋 package.json          # Store package config
```

**Key Features**:
- PostgreSQL database schema
- Prisma ORM integration
- Database migrations
- Seed data management

### 2. **Redis Stream Package** (`/packages/redisstream`)
**Purpose**: Redis streaming utilities and queue management

```
packages/redisstream/
├── 📋 index.ts              # Redis utilities
├── 📋 package.json          # Package configuration
└── 📄 README.md             # Documentation
```

### 3. **UI Package** (`/packages/ui`)
**Purpose**: Shared UI components across applications

```
packages/ui/
├── 🎨 components/           # Reusable UI components
├── 📋 package.json          # UI package config
└── 📄 README.md             # Component documentation
```

### 4. **ESLint Config** (`/packages/eslint-config`)
**Purpose**: Shared ESLint configuration

```
packages/eslint-config/
├── base.js                  # Base ESLint rules
├── next.js                  # Next.js specific rules
├── react.js                 # React specific rules
└── 📋 package.json          # Config package
```

### 5. **TypeScript Config** (`/packages/typescript-config`)
**Purpose**: Shared TypeScript configurations

```
packages/typescript-config/
├── base.json                # Base TypeScript config
├── nextjs.json              # Next.js TypeScript config
├── react-library.json       # React library config
└── 📋 package.json          # Config package
```

## 🛠️ Scripts (`/scripts`)

```
scripts/
├── migrate.ps1              # Windows migration script
├── migrate.sh               # Unix migration script
└── seed-roles-permissions.js # Database seeding script
```

## 🐳 Infrastructure

### **Docker Compose** (`docker-compose.yml`)
Development environment setup with:
- PostgreSQL 16 Alpine
- Redis 7 Alpine
- Volume persistence
- Environment variable configuration

### **Environment Configuration**
- `.env.example` - Environment template
- `.env` - Development environment
- `.env.production` - Production environment

## 🔧 Build & Development

### **Turbo Configuration** (`turbo.json`)
- Build pipeline optimization
- Task dependency management
- Caching strategies
- Parallel execution

### **Package Management**
- **PNPM**: Efficient package management
- **Workspaces**: Monorepo dependency sharing
- **Lock file**: `pnpm-lock.yaml` for reproducible builds

## 📊 Key Features

### **Frontend (Web)**
- 🎨 Modern UI with Radix UI components
- 📱 Responsive design with Tailwind CSS
- 📈 Real-time analytics dashboard
- 🔔 Incident management system
- 👥 Team collaboration features
- 🔐 JWT-based authentication

### **Backend (API)**
- 🛡️ Secure REST API endpoints
- 📊 Incident analytics and reporting
- 🔄 Real-time status updates
- 📧 Email notification system
- 🗄️ PostgreSQL data persistence
- ⚡ Redis caching and queuing

### **Real-time (Pusher)**
- 🔄 WebSocket connections
- 📡 Live status updates
- 🔔 Instant notifications
- 📊 Real-time metrics streaming

### **Background Processing (Worker)**
- ⏰ Scheduled monitoring checks
- 📧 Email notification processing
- 📊 Analytics data aggregation
- 🔄 Data synchronization tasks

## 🚀 Development Workflow

### **Getting Started**
```bash
# Install dependencies
pnpm install

# Start development environment
pnpm run dev

# Run database migrations
pnpm run migrate

# Build all applications
pnpm run build
```

### **Available Scripts**
- `pnpm run dev` - Start development servers
- `pnpm run build` - Build all applications
- `pnpm run lint` - Run ESLint across all packages
- `pnpm run check-types` - TypeScript type checking
- `pnpm run db:dev` - Start development database
- `pnpm run migrate` - Run database migrations

## 🏗️ Architecture Principles

### **Monorepo Benefits**
- 📦 **Code Sharing**: Shared packages and utilities
- 🔄 **Consistent Tooling**: Unified build and development tools
- 🚀 **Atomic Changes**: Cross-package changes in single commits
- 📊 **Dependency Management**: Centralized dependency updates

### **Microservices Architecture**
- 🎯 **Single Responsibility**: Each service has a focused purpose
- 🔄 **Independent Scaling**: Services scale based on demand
- 🛡️ **Fault Isolation**: Service failures don't cascade
- 🚀 **Technology Flexibility**: Different tech stacks per service

### **Modern Stack**
- ⚡ **Performance**: Next.js 13 with App Router
- 🎨 **Developer Experience**: TypeScript, ESLint, Prettier
- 🔧 **Build Optimization**: Turbo for fast builds
- 🐳 **Containerization**: Docker for consistent environments

---

## 📈 Scalability Considerations

This architecture supports:
- **Horizontal Scaling**: Independent service scaling
- **Database Optimization**: Prisma ORM with connection pooling
- **Caching Strategy**: Redis for session and data caching
- **Real-time Features**: WebSocket connections via Pusher service
- **Background Processing**: Async job processing via Worker service

## 🔒 Security Features

- JWT-based authentication
- Environment variable management
- Database query validation with Zod
- CORS configuration
- Secure headers and middleware

---

*This documentation provides a comprehensive overview of the UptimeMatrix project structure. For specific implementation details, refer to individual service README files and code documentation.*
