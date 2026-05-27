import cors from "cors";
import express from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdmin } from "./firebase";
import { handleSendOtp, handleVerifyOtp } from "./otp";
import { sendError } from "./errors";

type AuthedRequest = express.Request & { authUser: DecodedIdToken };

const app = express();
const port = Number(process.env.PORT ?? 3001);

const defaultOrigins = [
  "http://localhost:8081",
  "http://localhost:19006",
  "https://unicarpool-f49e4.web.app",
  "https://unicarpool-f49e4.firebaseapp.com",
];
const corsOrigins =
  process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? defaultOrigins;

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ code: "unauthenticated", error: "You must be signed in." });
      return;
    }
    const token = header.slice("Bearer ".length);
    const decoded = await getAdmin().auth().verifyIdToken(token);
    (req as AuthedRequest).authUser = decoded;
    next();
  } catch {
    res.status(401).json({ code: "unauthenticated", error: "Invalid or expired session. Sign in again." });
  }
}

app.post("/api/otp/send", requireAuth, async (req, res) => {
  try {
    const result = await handleSendOtp((req as AuthedRequest).authUser);
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/otp/verify", requireAuth, async (req, res) => {
  try {
    const result = await handleVerifyOtp((req as AuthedRequest).authUser, req.body?.code);
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

getAdmin();

app.listen(port, () => {
  console.log(`UniCarpool OTP API listening on port ${port}`);
});
