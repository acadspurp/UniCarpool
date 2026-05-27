"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const firebase_functions_1 = require("firebase-functions");
async function sendOtpEmail({ to, code }) {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        await sendWithResend(resendKey, to, code);
        return;
    }
    const smtpUser = process.env.OTP_SMTP_USER;
    const smtpPass = process.env.OTP_SMTP_PASS;
    if (smtpUser && smtpPass) {
        await sendWithSmtp(smtpUser, smtpPass, to, code);
        return;
    }
    throw new Error("Email is not configured. Set RESEND_API_KEY or OTP_SMTP_USER + OTP_SMTP_PASS in Functions secrets.");
}
async function sendWithResend(apiKey, to, code) {
    const from = process.env.RESEND_FROM ?? "UniCarpool <onboarding@resend.dev>";
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject: "Your UniCarpool verification code",
            html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>UniCarpool verification</h2>
          <p>Your 6-digit code is:</p>
          <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
        }),
    });
    if (!response.ok) {
        const body = await response.text();
        firebase_functions_1.logger.error("Resend API error", body);
        throw new Error("Could not send verification email.");
    }
}
async function sendWithSmtp(user, pass, to, code) {
    const nodemailer = await import("nodemailer");
    const host = process.env.OTP_SMTP_HOST ?? "smtp.gmail.com";
    const port = Number(process.env.OTP_SMTP_PORT ?? "465");
    const secure = process.env.OTP_SMTP_SECURE !== "false";
    const from = process.env.OTP_SMTP_FROM ?? user;
    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
    await transporter.sendMail({
        from,
        to,
        subject: "Your UniCarpool verification code",
        text: `Your UniCarpool verification code is ${code}. It expires in 10 minutes.`,
        html: `<p>Your UniCarpool verification code is <strong>${code}</strong>.</p><p>Expires in 10 minutes.</p>`,
    });
}
//# sourceMappingURL=email.js.map