// Email provider abstraction.
//
// DEV MODE (default, AUTH_MODE=dev or unset): no email is actually sent.
// The OTP is returned in the API response (`devCode`) and logged to the
// server console, so you can exercise the full sign-in flow with zero
// configuration. This is clearly a development-only behavior — never do
// this in a real production deployment.
//
// LIVE MODE (AUTH_MODE=live): plug in a real provider. This function is the
// only place you need to touch — swap the body for Resend / SendGrid / SES /
// nodemailer+SMTP / etc. using the env vars documented in .env.example.

export async function sendOtpEmail({ email, code }) {
  const mode = process.env.AUTH_MODE || "dev";

  if (mode !== "live") {
    console.log(`[DEV AUTH MODE] Verification code for ${email}: ${code}`);
    return { sent: false, devCode: code, mode: "dev" };
  }

  // --- Example live implementation using Resend (uncomment & adapt) ------
  // const apiKey = process.env.RESEND_API_KEY;
  // if (!apiKey) throw new Error("RESEND_API_KEY is required when AUTH_MODE=live");
  // const res = await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     from: process.env.EMAIL_FROM,
  //     to: email,
  //     subject: "Your Career Guide AI verification code",
  //     text: `Your verification code is ${code}. It expires in 10 minutes.`,
  //   }),
  // });
  // if (!res.ok) throw new Error(`Email provider error: ${res.status}`);
  // return { sent: true, mode: "live" };

  throw new Error(
    "AUTH_MODE=live but no email provider is configured. See src/services/emailProvider.js"
  );
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
