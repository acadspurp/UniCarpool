# UniCarpool OTP API (Render)

Small backend for **6-digit email verification** on Firebase **Spark** (no Cloud Functions / Blaze).

Firebase Hosting + Auth + Firestore stay on Spark. This service sends OTP emails and marks users verified in Firebase Auth.

## Sending to `@iskolarngbayan.pup.edu.ph` (Gmail SMTP — recommended for thesis)

Use Gmail as the sender so codes can go to **any** PUP inbox. Do **not** set `RESEND_API_KEY` when using SMTP.

### A. Gmail App Password

1. Use a Google account with **2-Step Verification** enabled.
2. [Google Account → Security → App passwords](https://myaccount.google.com/apppasswords)
3. App: **Mail**, Device: **Other** → name it `UniCarpool`
4. Copy the **16-character password** (no spaces). You will not see it again.

### B. Firebase service account

1. [Firebase Console](https://console.firebase.google.com) → **unicarpool-f49e4** → ⚙️ **Project settings** → **Service accounts**
2. **Generate new private key** → save the `.json` file
3. Open the file, copy **all** JSON (one line is fine for Render)

### C. Deploy on Render (free tier)

1. Push this repo to GitHub (if not already)
2. [render.com](https://render.com) → **New** → **Web Service** → connect repo
3. Settings:
   - **Root directory:** `server`
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
4. **Environment** variables:

| Key | Value |
|-----|--------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service account JSON |
| `OTP_SMTP_USER` | Your Gmail address |
| `OTP_SMTP_PASS` | 16-char App Password (not your normal Gmail password) |
| `OTP_SMTP_FROM` | `UniCarpool <your@gmail.com>` |
| `CORS_ORIGINS` | `https://unicarpool-f49e4.web.app,http://localhost:8081` |

Do **not** set `RESEND_API_KEY` for Gmail SMTP.

5. **Create Web Service** → wait until **Live**
6. Copy the URL, e.g. `https://unicarpool-otp-api.onrender.com`
7. Open `https://YOUR-URL/health` — should show `{"ok":true}`

**Free tier:** service sleeps after ~15 min idle; first request may take 30–60s.

### D. Point the web app at Render

In project root `.env`:

```
EXPO_PUBLIC_OTP_API_URL=https://your-service.onrender.com
```

Redeploy hosting:

```powershell
npm.cmd run deploy:hosting
```

### E. Test

1. Open https://unicarpool-f49e4.web.app
2. Sign up with a **PUP email**
3. On the OTP screen, wait (cold start) or tap **Resend code**
4. Check PUP inbox **and Spam/Junk** for mail from your Gmail

---

## Alternative: Resend (needs your own verified domain for PUP addresses)

Resend sandbox (`onboarding@resend.dev`) only sends to your Resend signup email. To reach PUP addresses with Resend, verify a domain you own in Resend, then set `RESEND_API_KEY` and `RESEND_FROM`.

---

## Local dev

```powershell
cd server
copy .env.example .env
# Set FIREBASE_SERVICE_ACCOUNT_JSON, OTP_SMTP_USER, OTP_SMTP_PASS
npm.cmd install
npm.cmd run build
npm.cmd start
```

Root `.env`: `EXPO_PUBLIC_OTP_API_URL=http://localhost:3001`
