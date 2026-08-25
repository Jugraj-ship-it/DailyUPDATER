import { Resend } from "resend";

// RESEND_API_KEY comes from resend.com's dashboard (free tier). Without a
// custom domain verified there, EMAIL_FROM falls back to Resend's shared
// "onboarding@resend.dev" sender, which works out of the box for testing
// and light real use - verify your own domain in Resend later if you want
// mail to come "from" your own address.
//
// The client is created lazily inside the function (not at module scope) so
// a missing API key throws only when actually sending, where the caller's
// try/catch can handle it - the Resend constructor throws immediately at
// import time otherwise, which would crash every page that touches this file.
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set - password reset email not sent");
  }

  const resend = new Resend(apiKey);
  // The SDK returns { data, error } instead of throwing on API-level
  // failures (invalid recipient, unverified domain, etc.) - without this
  // check, a rejected send looks identical to a successful one to our code.
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: "Reset your Daily Update password",
    html: `
      <p>Someone requested a password reset for this account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
  if (error) {
    throw new Error(`Resend rejected the email: ${error.message}`);
  }
}
