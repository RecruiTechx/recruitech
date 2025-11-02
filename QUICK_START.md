# 🚀 RecruiTech Quick Deployment Guide

## One-Time Setup (10 minutes)

### 1. Get Supabase Credentials
1. Visit [supabase.com](https://supabase.com)
2. Create/open your project
3. Go **Settings → API**
4. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Anon Key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Setup Local Environment
```bash
# In d:\playground\recruitech\

# Copy template
cp .env.example .env.local

# Edit .env.local with your Supabase values
# (Windows: use Notepad or VS Code)
```

### 3. Test Locally
```bash
pnpm install  # First time only
pnpm dev      # Starts at http://localhost:3000
```

Test by:
- Signing up at `/auth/signup`
- Logging in at `/auth`
- Accessing `/dashboard` (should work if logged in)

## Deploy to Vercel (5 minutes)

### Step 1: Push Code
```bash
git add .
git commit -m "feat: add Supabase authentication"
git push
```

### Step 2: Connect Vercel

**Option A - Using CLI:**
```bash
npm install -g vercel
vercel login
vercel link
vercel deploy --prod
```

**Option B - Using Web:**
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Select your Git repo
4. Click **Deploy**

### Step 3: Add Environment Variables

In Vercel Dashboard → Your Project → **Settings → Environment Variables**

Add these 4 variables:
```
NEXT_PUBLIC_SUPABASE_URL          → your Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     → your Anon Key
SUPABASE_SERVICE_ROLE_KEY         → your Service Role Key
NEXT_PUBLIC_APP_URL               → https://your-app.vercel.app
```

### Step 4: Configure Supabase

In Supabase Dashboard → **Authentication → URL Configuration**

Set:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs** (add all):
  ```
  https://your-app.vercel.app
  https://your-app.vercel.app/auth
  https://your-app.vercel.app/auth/callback
  https://your-app.vercel.app/auth/reset-password
  ```

### Step 5: Deploy Again

In Vercel → **Deployments** → Select branch → **Deploy**

Or via CLI:
```bash
vercel deploy --prod
```

## ✅ Verification Checklist

After deployment, verify:
- [ ] Visit your Vercel URL
- [ ] Redirected to `/auth`
- [ ] Can sign up ✓
- [ ] Can sign in ✓
- [ ] Can access `/dashboard` after login ✓
- [ ] Sign out works ✓

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "Missing env vars" | Check `.env.local` has all 4 variables |
| Auth redirects to login loop | Update `NEXT_PUBLIC_APP_URL` to match Vercel domain |
| "Failed to set session" | Verify `SUPABASE_SERVICE_ROLE_KEY` is set on Vercel |
| Cookies not working | Ensure environment is production in Vercel |

## 📚 Full Documentation

- **Setup & Architecture**: See `AUTH_DEPLOYMENT_GUIDE.md`
- **Deployment Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **What Was Built**: See `IMPLEMENTATION_SUMMARY.md`

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Project Repo](https://github.com/RecruiTechx/recruitech)

## 💡 Tips

- **Local Testing**: `pnpm dev` and test before deploying
- **Logs**: Check Vercel and Supabase dashboards for errors
- **Redeploy**: Push to main branch or use Vercel dashboard
- **Env Changes**: Redeploy after changing environment variables

---

**Status**: ✅ Ready to deploy!

Questions? See `AUTH_DEPLOYMENT_GUIDE.md` for detailed documentation.
