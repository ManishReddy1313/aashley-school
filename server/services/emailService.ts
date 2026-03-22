/**
 * Email delivery via Resend API (HTTPS). No SMTP — works in Docker and blocked-port environments.
 *
 * Env: RESEND_API_KEY, EMAIL_FROM, ENQUIRY_EMAIL_TO
 * Restart the server/container after changing .env.
 */

import { Resend } from "resend";

const DEFAULT_ENQUIRY_TO = "enquiry.aashley@gmail.com";
const DEFAULT_FROM = "onboarding@resend.dev";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let resendClient: Resend | null | undefined;

function getResend(): Resend | null {
  if (resendClient !== undefined) return resendClient;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn(
      "[email] RESEND_API_KEY is missing. Emails will not be sent. Set RESEND_API_KEY in .env and restart."
    );
    resendClient = null;
    return null;
  }
  resendClient = new Resend(key);
  return resendClient;
}

function getEnquiryTo(): string {
  return (process.env.ENQUIRY_EMAIL_TO || DEFAULT_ENQUIRY_TO).trim();
}

function getFromAddress(): string {
  return (process.env.EMAIL_FROM || DEFAULT_FROM).trim();
}

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/**
 * Low-level send via Resend. One automatic retry on failure.
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, html, text, replyTo } = params;

  const toList = Array.isArray(to) ? to : [to];
  for (const addr of toList) {
    if (!isValidEmail(addr)) {
      console.error("[email] Invalid recipient address:", addr);
      throw new Error("Invalid recipient email address");
    }
  }
  if (replyTo && !isValidEmail(replyTo)) {
    console.error("[email] Invalid replyTo address:", replyTo);
    throw new Error("Invalid reply-to email address");
  }

  const resend = getResend();
  if (!resend) {
    throw new Error("Email service not configured: set RESEND_API_KEY in environment");
  }

  const from = getFromAddress();
  if (!from) {
    console.warn("[email] EMAIL_FROM is empty; using Resend default onboarding address.");
  }

  const payload = {
    from: from || DEFAULT_FROM,
    to: toList,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(replyTo ? { replyTo } : {}),
  };

  const attempt = async () => {
    const { data, error } = await resend.emails.send(payload);
    if (error) {
      const msg = error.message || error.name || "Resend API error";
      const err = new Error(msg) as Error & { statusCode?: number | null };
      err.statusCode = error.statusCode ?? undefined;
      throw err;
    }
    return data;
  };

  try {
    const data = await attempt();
    console.log("[email] Sent successfully", { id: data?.id, to: toList.join(", ") });
  } catch (firstErr) {
    console.warn("[email] First send attempt failed, retrying once:", (firstErr as Error)?.message);
    try {
      const data = await attempt();
      console.log("[email] Sent successfully (after retry)", { id: data?.id, to: toList.join(", ") });
    } catch (retryErr) {
      logEmailFailure("sendEmail", retryErr);
      throw retryErr;
    }
  }
}

function logEmailFailure(context: string, err: unknown): void {
  const e = err as { message?: string; statusCode?: number; name?: string };
  console.error(
    `[email] ${context} failed:`,
    e.message || String(err),
    e.statusCode != null ? `statusCode=${e.statusCode}` : "",
    e.name ? `name=${e.name}` : ""
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): Promise<void> {
  const to = getEnquiryTo();
  if (!isValidEmail(to)) {
    console.error("[email] ENQUIRY_EMAIL_TO is invalid:", to);
    throw new Error("Invalid ENQUIRY_EMAIL_TO configuration");
  }

  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : "",
    `Subject: ${data.subject}`,
    "",
    "Message:",
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = [
    "<p><strong>Name:</strong> " + escapeHtml(data.name) + "</p>",
    "<p><strong>Email:</strong> " + escapeHtml(data.email) + "</p>",
    data.phone ? "<p><strong>Phone:</strong> " + escapeHtml(data.phone) + "</p>" : "",
    "<p><strong>Subject:</strong> " + escapeHtml(data.subject) + "</p>",
    "<p><strong>Message:</strong></p>",
    "<p>" + escapeHtml(data.message).replace(/\n/g, "<br>") + "</p>",
  ].join("");

  try {
    await sendEmail({
      to,
      subject: `[Website Contact] ${data.subject}`,
      html,
      text,
      replyTo: data.email,
    });
  } catch (err) {
    logEmailFailure("sendContactFormEmail", err);
    throw err;
  }
}

export async function sendAdmissionEnquiryEmail(data: {
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  message?: string | null;
}): Promise<void> {
  const to = getEnquiryTo();
  if (!isValidEmail(to)) {
    console.error("[email] ENQUIRY_EMAIL_TO is invalid:", to);
    throw new Error("Invalid ENQUIRY_EMAIL_TO configuration");
  }

  const text = [
    `Student: ${data.studentName}`,
    `Parent: ${data.parentName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Grade: ${data.grade}`,
    data.message ? `Message: ${data.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = [
    "<p><strong>Student:</strong> " + escapeHtml(data.studentName) + "</p>",
    "<p><strong>Parent:</strong> " + escapeHtml(data.parentName) + "</p>",
    "<p><strong>Email:</strong> " + escapeHtml(data.email) + "</p>",
    "<p><strong>Phone:</strong> " + escapeHtml(data.phone) + "</p>",
    "<p><strong>Grade:</strong> " + escapeHtml(data.grade) + "</p>",
    data.message
      ? "<p><strong>Message:</strong><br>" + escapeHtml(data.message).replace(/\n/g, "<br>") + "</p>"
      : "",
  ].join("");

  try {
    await sendEmail({
      to,
      subject: `[Admission Enquiry] ${data.studentName} - Grade ${data.grade}`,
      html,
      text,
      replyTo: data.email,
    });
  } catch (err) {
    logEmailFailure("sendAdmissionEnquiryEmail", err);
    throw err;
  }
}
