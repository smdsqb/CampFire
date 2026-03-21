# 🔥 CampFire

> Gather around. Every great conversation starts with a spark.

A Reddit × Discord community platform with a cozy campfire night scene. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

---

## 🚀 Setup Guide

### 1. Clone your repo & add these files

Push everything in this zip into your GitHub repo.

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project → name it `campfire`
2. Wait for it to spin up (~1 min)

### 3. Run the database schema

1. In Supabase dashboard → **SQL Editor** → **New Query**
2. Open `supabase-schema.sql` from this project
3. Paste the entire file → click **Run**
4. This creates all your tables, security rules, and seeds the camps

### 4. Enable Google login

1. Supabase dashboard → **Authentication** → **Providers** → **Google**
2. Toggle it on
3. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
4. Create an OAuth 2.0 Client ID (Web application)
5. Add `https://your-project-id.supabase.co/auth/v1/callback` to Authorized redirect URIs
6. Copy the Client ID and Secret back into Supabase

### 5. Get your Supabase keys

Supabase dashboard → **Project Settings** → **API** → copy:
- `Project URL`
- `anon public` key

### 6. Add to Vercel environment variables

Vercel dashboard → your project → **Settings** → **Environment Variables** → add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 7. Deploy!

Push to GitHub → Vercel auto-deploys 🔥

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/callback/route.ts  # Google OAuth callback
│   ├── layout.tsx              # Root layout + AuthProvider
│   ├── page.tsx                # Main app shell
│   └── globals.css             # Animations + styles
├── components/
│   ├── layout/
│   │   ├── CampfireScene.tsx   # Animated forest + fire background
│   │   ├── Sidebar.tsx         # Icon nav
│   │   ├── CampList.tsx        # Left channel list
│   │   └── RightPanel.tsx      # Trending + stats
│   └── feed/
│       ├── Feed.tsx            # Post feed
│       ├── PostCard.tsx        # Post card with votes
│       └── NewPostModal.tsx    # Create post
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── db.ts                   # Database helpers
│   ├── auth-context.tsx        # Auth context
│   └── utils.ts                # Helpers
└── types/index.ts              # TypeScript types
```

---

## 🛠 Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Code | GitHub |
| Database + Auth | Supabase |
