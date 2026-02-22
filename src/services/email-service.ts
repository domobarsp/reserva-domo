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
    await resend.emails.send({ from: FROM, to, subject, html });
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
    await resend.emails.send({ from: FROM, to, subject, html });
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
    await resend.emails.send({ from: FROM, to, subject, html });
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
    await resend.emails.send({ from: FROM, to: ADMIN_TO, subject, html });
  } catch (err) {
    console.error("[email] sendAdminNotificationEmail failed:", err);
  }
}
