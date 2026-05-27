type SendOtpParams = {
  to: string;
  code: string;
};

export async function sendOtpEmail({ to, code }: SendOtpParams) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    await sendWithBrevoApi(brevoApiKey, to, code);
    return;
  }

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

  throw new Error(
    "Email is not configured. Set BREVO_API_KEY, RESEND_API_KEY, or OTP_SMTP_USER + OTP_SMTP_PASS on the server.",
  );
}

function parseFromAddress(from: string) {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return {name: match[1] || "UniCarpool", email: match[2]};
  }
  return {name: "UniCarpool", email: from.trim()};
}

async function sendWithBrevoApi(apiKey: string, to: string, code: string) {
  const from = process.env.OTP_SMTP_FROM ?? "UniCarpool <noreply@example.com>";
  const sender = parseFromAddress(from);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{email: to}],
      subject: "Your UniCarpool verification code",
      htmlContent: `
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
    console.error("Brevo API error", body);
    if (body.includes("unauthorized") || body.includes("Key not found")) {
      throw new Error(
        "Invalid Brevo API key. In Brevo use SMTP & API → API Keys (v3), not the SMTP key. Update BREVO_API_KEY on Render.",
      );
    }
    throw new Error("Brevo API failed to send the verification email.");
  }
}

async function sendWithResend(apiKey: string, to: string, code: string) {
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
    console.error("Resend API error", body);
    throw new Error("Could not send verification email.");
  }
}

async function sendWithSmtp(user: string, pass: string, to: string, code: string) {
  const nodemailer = await import("nodemailer");
  const host = process.env.OTP_SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.OTP_SMTP_PORT ?? "587");
  const secure = process.env.OTP_SMTP_SECURE === "true";
  const from = process.env.OTP_SMTP_FROM ?? user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject: "Your UniCarpool verification code",
      text: `Your UniCarpool verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your UniCarpool verification code is <strong>${code}</strong>.</p><p>Expires in 10 minutes.</p>`,
    });
  } catch (error) {
    console.error("SMTP sendMail failed", error);
    throw new Error("SMTP failed to send the verification email.");
  }
}
