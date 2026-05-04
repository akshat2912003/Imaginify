# ✦ IMAGINIFY — AI Image SaaS Platform

> A full-stack AI-powered image editing SaaS built with Next.js 14, Clerk, Cloudinary AI, MongoDB, and **Razorpay** (₹ INR payments).

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Clerk-based sign in/up with webhooks |
| 🖼️ **Image Restore** | Remove noise & imperfections with AI |
| ✨ **Generative Fill** | AI outpainting to expand image dimensions |
| 🗑️ **Object Remove** | Remove any object from an image using AI |
| 🎨 **Object Recolor** | Recolor specific objects in an image |
| 📷 **Background Remove** | Extract subjects from backgrounds |
| 🔍 **Smart Search** | Search images by visual content (e.g. "sky", "car") |
| 💳 **Razorpay Payments** | Buy credits in ₹ INR — Indian payment gateway |
| 🗄️ **MongoDB** | Stores all user data, images, and transactions |
| 📄 **Pagination** | Browse all transformations with page controls |
| ⬇️ **Download** | Download transformed images |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** Clerk
- **Database:** MongoDB + Mongoose
- **AI / Image Processing:** Cloudinary AI
- **Payments:** Razorpay (₹ INR)
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod

---

## 📋 Pricing Plans (in ₹ INR)

| Plan | Price | Credits |
|---|---|---|
| Free | ₹0 | 20 Credits |
| Pro Package | ₹1,999 | 120 Credits |
| Premium Package | ₹9,999 | 2,000 Credits |

---

## ⚙️ Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd imaginify
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all values (see below for each service).

### 3. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) → Create application
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. In Clerk Dashboard → Webhooks → Add endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the `Signing Secret` → `WEBHOOK_SECRET`

### 4. Set Up MongoDB

1. Go to [mongodb.com](https://mongodb.com) → Create cluster
2. Create database user → Copy connection string → `MONGODB_URL`

### 5. Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → Dashboard
2. Copy Cloud Name, API Key, API Secret
3. Create an **Upload Preset** named `imaginify_unsigned` (Settings → Upload → Add preset → Unsigned)

### 6. Set Up Razorpay

1. Go to [razorpay.com](https://razorpay.com) → Sign up
2. Dashboard → Settings → API Keys → Generate test keys
3. Copy `Key ID` → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Copy `Key Secret` → `RAZORPAY_KEY_SECRET`
5. Webhooks → Add new webhook:
   - URL: `https://your-domain.com/api/webhooks/razorpay`
   - Events: `payment.captured`
   - Copy secret → `RAZORPAY_WEBHOOK_SECRET`

### 7. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔍 How Smart Search Works

This app uses **Cloudinary's visual search** — when you type `sky`, it searches Cloudinary for all images containing sky using the expression:

```
folder=imaginify AND sky
```

Cloudinary uses AI-based image tagging to find images by their visual content, not just filenames.

---

## 📁 Project Structure

```
imaginify/
├── app/
│   ├── (auth)/              # Clerk auth pages
│   ├── (root)/              # Main app pages
│   │   ├── page.tsx         # Home / gallery
│   │   ├── profile/         # User profile
│   │   ├── credits/         # Buy credits (Razorpay)
│   │   └── transformations/ # All AI tools
│   └── api/
│       └── webhooks/
│           ├── clerk/       # Clerk user sync
│           └── razorpay/    # Payment confirmation
├── components/
│   ├── shared/              # App components
│   └── ui/                  # shadcn/ui components
├── constants/               # Nav links, plans, tools
├── lib/
│   ├── actions/             # Server actions
│   └── database/            # Mongoose models
└── types/                   # TypeScript types
```

---

## 🌐 Deploy on Vercel

```bash
npm run build
vercel deploy
```

Add all `.env.local` variables to Vercel Environment Variables.

Update Clerk webhook URL and Razorpay webhook URL to your production domain.

---

## 📝 Credit System

- Each user starts with **20 free credits**
- Every AI transformation costs **1 credit**
- Buy more credits via **Razorpay** in ₹ INR
- Credits are tracked in MongoDB per user

---

Built with ❤️ using Next.js 14 + Cloudinary AI + Razorpay
