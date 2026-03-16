/**
 * Email sending via SMTP (Hostinger or any SMTP server).
 * Forms send to ENQUIRY_EMAIL_TO (e.g. enquiry.aashley@gmail.com).
 * Configure SMTP in .env.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const ENQUIRY_EMAIL_TO = process.env.ENQUIRY_EMAIL_TO || "enquiry.aashley@gmail.com";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn(
      "[mail] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env (restart server after editing .env)."
    );
    return null;
  }
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure && { requireTLS: true }),
  });
  console.log("[mail] SMTP configured:", host + ":" + port, "secure:", secure, "user:", user);
  return transporter;
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ENQUIRY_EMAIL_TO,
      replyTo: data.email,
      subject: `[Website Contact] ${data.subject}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        `Subject: ${data.subject}`,
        "",
        "Message:",
        data.message,
      ]
        .filter(Boolean)
        .join("\n"),
      html: [
        "<p><strong>Name:</strong> " + escapeHtml(data.name) + "</p>",
        "<p><strong>Email:</strong> " + escapeHtml(data.email) + "</p>",
        data.phone ? "<p><strong>Phone:</strong> " + escapeHtml(data.phone) + "</p>" : "",
        "<p><strong>Subject:</strong> " + escapeHtml(data.subject) + "</p>",
        "<p><strong>Message:</strong></p>",
        "<p>" + escapeHtml(data.message).replace(/\n/g, "<br>") + "</p>",
      ].join(""),
    });
    console.log("[mail] Contact form email sent to", ENQUIRY_EMAIL_TO);
  } catch (err: any) {
    const msg = err?.message || String(err);
    const code = err?.code;
    const response = err?.response;
    console.error("[mail] Contact form email failed:", msg, code ? `(code: ${code})` : "", response ? `response: ${response}` : "");
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
  const transport = getTransporter();
  if (!transport) return;
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ENQUIRY_EMAIL_TO,
      replyTo: data.email,
      subject: `[Admission Enquiry] ${data.studentName} - Grade ${data.grade}`,
      text: [
        `Student: ${data.studentName}`,
        `Parent: ${data.parentName}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `Grade: ${data.grade}`,
        data.message ? `Message: ${data.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      html: [
        "<p><strong>Student:</strong> " + escapeHtml(data.studentName) + "</p>",
        "<p><strong>Parent:</strong> " + escapeHtml(data.parentName) + "</p>",
        "<p><strong>Email:</strong> " + escapeHtml(data.email) + "</p>",
        "<p><strong>Phone:</strong> " + escapeHtml(data.phone) + "</p>",
        "<p><strong>Grade:</strong> " + escapeHtml(data.grade) + "</p>",
        data.message
          ? "<p><strong>Message:</strong><br>" + escapeHtml(data.message).replace(/\n/g, "<br>") + "</p>"
          : "",
      ].join(""),
    });
    console.log("[mail] Admission enquiry email sent to", ENQUIRY_EMAIL_TO);
  } catch (err: any) {
    const msg = err?.message || String(err);
    const code = err?.code;
    const response = err?.response;
    console.error("[mail] Admission enquiry email failed:", msg, code ? `(code: ${code})` : "", response ? `response: ${response}` : "");
    throw err;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
