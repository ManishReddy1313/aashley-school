/**
 * Email sending via SMTP (Hostinger or any SMTP server).
 * Forms send to ENQUIRY_EMAIL_TO (e.g. enquiry.aashley@gmail.com).
 *
 * Defaults: smtp.hostinger.com:465 with secure: true (SSL).
 * Optional: set SMTP_PORT=587 and SMTP_SECURE=false for STARTTLS.
 *
 * After changing .env, restart the Node process (or rebuild/restart Docker).
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const ENQUIRY_EMAIL_TO = process.env.ENQUIRY_EMAIL_TO || "enquiry.aashley@gmail.com";

const DEFAULT_SMTP_HOST = "smtp.hostinger.com";
const DEFAULT_SMTP_PORT = 465;

let transporter: Transporter | null = null;

function resolveSecure(port: number): boolean {
  const explicit = process.env.SMTP_SECURE?.toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  // Default: SSL on 465; STARTTLS-style on 587 and other ports
  if (port === 465) return true;
  return false;
}

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = (process.env.SMTP_HOST || DEFAULT_SMTP_HOST).trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn(
      "[mail] SMTP_USER or SMTP_PASS is missing. Email will not be sent. Set both in .env and restart the server/container."
    );
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || String(DEFAULT_SMTP_PORT), 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    console.error("[mail] Invalid SMTP_PORT:", process.env.SMTP_PORT);
    return null;
  }

  const secure = resolveSecure(port);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  });

  console.log(
    "[mail] SMTP transporter ready:",
    `host=${host}`,
    `port=${port}`,
    `secure=${secure}`,
    `user=${user}`
  );
  return transporter;
}

function logSendFailure(context: string, err: unknown): void {
  const e = err as {
    message?: string;
    code?: string;
    errno?: string | number;
    syscall?: string;
    address?: string;
    port?: number;
    command?: string;
    response?: string;
    responseCode?: number;
  };
  const parts = [
    `[mail] ${context} failed:`,
    e.message || String(err),
    e.code ? `code=${e.code}` : "",
    e.errno != null ? `errno=${e.errno}` : "",
    e.syscall ? `syscall=${e.syscall}` : "",
    e.address ? `address=${e.address}` : "",
    e.port != null ? `remotePort=${e.port}` : "",
    e.command ? `command=${e.command}` : "",
    e.response ? `response=${e.response}` : "",
    e.responseCode != null ? `responseCode=${e.responseCode}` : "",
  ].filter(Boolean);
  console.error(parts.join(" | "));
}

function getFromAddress(): string {
  const from = process.env.SMTP_FROM?.trim();
  if (from) return from;
  const user = process.env.SMTP_USER?.trim();
  if (user) return user;
  return "";
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

  const from = getFromAddress();
  if (!from) {
    console.warn("[mail] SMTP_FROM and SMTP_USER are empty; cannot set From header.");
  }

  try {
    await transport.sendMail({
      from: from || process.env.SMTP_USER,
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
    console.log("[mail] Contact form email sent successfully to", ENQUIRY_EMAIL_TO);
  } catch (err) {
    logSendFailure("Contact form email", err);
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

  const from = getFromAddress();
  if (!from) {
    console.warn("[mail] SMTP_FROM and SMTP_USER are empty; cannot set From header.");
  }

  try {
    await transport.sendMail({
      from: from || process.env.SMTP_USER,
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
    console.log("[mail] Admission enquiry email sent successfully to", ENQUIRY_EMAIL_TO);
  } catch (err) {
    logSendFailure("Admission enquiry email", err);
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
