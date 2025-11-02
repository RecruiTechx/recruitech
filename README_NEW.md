# RecruiTech - AI-Powered Recruitment Platform

A modern, full-stack recruitment platform built with Next.js 15, Supabase authentication, and deployed on Vercel.

## Quick Start

### Prerequisites
- Node.js 20+ and pnpm
- Supabase project account

### 1. Setup Environment

```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# SUPABASE_SERVICE_ROLE_KEY=your_role_key
```

### 2. Install & Run

```bash
pnpm install && pnpm dev
```

Visit `http://localhost:3000` - you'll be redirected to `/auth` (login page)

### 3. Create Account & Explore

- **Sign Up**: Click "Sign Up" to create a new account
- **Login**: Use your credentials to access protected routes
- **Protected Routes**: `/dashboard`, `/open`, `/test`

## Authentication

This app uses **Supabase** for authentication with:
- Email/password sign-up and sign-in
- Secure httpOnly cookies for sessions
- Route protection via middleware
- Password reset functionality

See [AUTH_DEPLOYMENT_GUIDE.md](./AUTH_DEPLOYMENT_GUIDE.md) for detailed auth documentation.

## Deployment

### Deploy to Vercel

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

For complete deployment steps, see [AUTH_DEPLOYMENT_GUIDE.md](./AUTH_DEPLOYMENT_GUIDE.md#production-deployment-to-vercel).

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Auth**: Supabase + Zod validation
- **Deployment**: Vercel Edge Functions
- **Forms**: React Hook Form + Zod

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for auth
│   ├── api/auth/         # Auth API routes
│   └── auth/             # Auth pages (login, signup)
├── components/
│   ├── auth-form.tsx     # Login form
│   ├── signup-form.tsx   # Sign-up form
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth-context.tsx  # Auth context & hooks
│   ├── supabase-client.ts # Supabase client
│   └── schemas.ts        # Zod schemas
└── middleware.ts         # Route protection
```

## Available Routes

| Route | Auth Required | Description |
|-------|---------------|-------------|
| `/auth` | ❌ | Login page |
| `/auth/signup` | ❌ | Sign-up page |
| `/dashboard` | ✓ | Dashboard (protected) |
| `/open` | ✓ | Open positions (protected) |
| `/test` | ✓ | Test page (protected) |

## Environment Variables

```env
# Public (Client & Server)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Private (Server Only)
SUPABASE_SERVICE_ROLE_KEY=...
```

## Development

### Build
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

### Start Production Server
```bash
pnpm start
```

## Documentation

- [Authentication & Deployment Guide](./AUTH_DEPLOYMENT_GUIDE.md)
- [System Prompt](./CLAUDE.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

## Contributing

This project follows TypeScript strict mode and Zod validation for all inputs. See [CLAUDE.md](./CLAUDE.md) for code standards and conventions.

---

**Status**: ✨ Authentication system complete • 🚀 Ready for production deployment
