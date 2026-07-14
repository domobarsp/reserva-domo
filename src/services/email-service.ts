import { render } from "@react-email/components";
import React from "react";
import { resend } from "@/lib/resend";
import { emailTranslations, type Locale } from "@/lib/email-translations";
import { ConfirmationEmail } from "@/lib/email-templates/confirmation";
import { CancellationEmail } from "@/lib/email-templates/cancellation";
import { NoShowChargeEmail } from "@/lib/email-templates/no-show-charge";
import { AdminNotificationEmail } from "@/lib/email-templates/admin-notification";

const FROM = process.env.RESEND_FROM_EMAIL!;
const ADMIN_TO =
  process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.RESEND_FROM_EMAIL!;

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  label: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error(`[email] ${params.label}: RESEND_API_KEY missing`);
    return;
  }
  if (!FROM) {
    console.error(`[email] ${params.label}: RESEND_FROM_EMAIL missing`);
    return;
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    console.error(`[email] ${params.label} Resend error:`, error);
    return;
  }

  console.log(`[email] ${params.label} sent:`, { id: data?.id, to: params.to });
}

export async function sendConfirmationEmail(params: {
  to: string;
  firstName: string;
  date: string;
  timeLabel: string;
  accommodationLabel: string;
  partySize: number;
  specialRequests?: string;
  cancellationLink: string;
  locale: Locale;
}) {
  try {
    const { to, locale, ...rest } = params;
    const subject = emailTranslations[locale].confirmation.subject;
    const html = await render(
      React.createElement(ConfirmationEmail, { ...rest, locale })
    );
    await sendEmail({ to, subject, html, label: "sendConfirmationEmail" });
  } catch (err) {
    console.error("[email] sendConfirmationEmail failed:", err);
  }
}

export async function sendCancellationEmail(params: {
  to: string;
  firstName: string;
  date: string;
  timeLabel: string;
  accommodationLabel: string;
  partySize: number;
  locale: Locale;
}) {
  try {
    const { to, locale, ...rest } = params;
    const subject = emailTranslations[locale].cancellation.subject;
    const html = await render(
      React.createElement(CancellationEmail, { ...rest, locale })
    );
    await sendEmail({ to, subject, html, label: "sendCancellationEmail" });
  } catch (err) {
    console.error("[email] sendCancellationEmail failed:", err);
  }
}

export async function sendNoShowChargeEmail(params: {
  to: string;
  firstName: string;
  date: string;
  timeLabel: string;
  amount: number;
  locale: Locale;
}) {
  try {
    const { to, locale, ...rest } = params;
    const subject = emailTranslations[locale].noShowCharge.subject;
    const html = await render(
      React.createElement(NoShowChargeEmail, { ...rest, locale })
    );
    await sendEmail({ to, subject, html, label: "sendNoShowChargeEmail" });
  } catch (err) {
    console.error("[email] sendNoShowChargeEmail failed:", err);
  }
}

export async function sendAdminNotificationEmail(params: {
  customerName: string;
  email: string;
  phone?: string;
  date: string;
  timeLabel: string;
  accommodationLabel: string;
  partySize: number;
  specialRequests?: string;
  hasCard: boolean;
  reservationId: string;
}) {
  try {
    const subject = emailTranslations.pt.adminNotification.subject;
    const html = await render(React.createElement(AdminNotificationEmail, params));
    await sendEmail({
      to: ADMIN_TO,
      subject,
      html,
      label: "sendAdminNotificationEmail",
    });
  } catch (err) {
    console.error("[email] sendAdminNotificationEmail failed:", err);
  }
}
