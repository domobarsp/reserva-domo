import { render } from "@react-email/components";
import React from "react";
import { resend } from "@/lib/resend";
import {
  emailTranslations,
  resolveLocale,
  type Locale,
} from "@/lib/email-translations";
import { ConfirmationEmail } from "@/lib/email-templates/confirmation";
import { CancellationEmail } from "@/lib/email-templates/cancellation";
import { NoShowEmail } from "@/lib/email-templates/no-show-charge";
import { AdminNotificationEmail } from "@/lib/email-templates/admin-notification";

const FROM = process.env.RESEND_FROM_EMAIL!;
const ADMIN_TO =
  process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.RESEND_FROM_EMAIL!;

/** Converte YYYY-MM-DD → DD/MM/YYYY para exibição nos emails. */
function formatEmailDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

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

type ReservationEmailParams = {
  to: string;
  firstName: string;
  date: string;
  timeLabel: string;
  accommodationLabel: string;
  partySize: number;
  specialRequests?: string;
  cancellationLink: string;
  locale: Locale | string | null | undefined;
};

export async function sendCreateEmail(params: ReservationEmailParams) {
  try {
    const locale = resolveLocale(params.locale);
    const { to, cancellationLink, specialRequests, date, ...rest } = params;
    const subject = emailTranslations[locale].create.subject;
    const html = await render(
      React.createElement(ConfirmationEmail, {
        ...rest,
        date: formatEmailDate(date),
        specialRequests,
        cancellationLink,
        locale,
        kind: "create",
      })
    );
    await sendEmail({ to, subject, html, label: "sendCreateEmail" });
  } catch (err) {
    console.error("[email] sendCreateEmail failed:", err);
  }
}

/** @deprecated Use sendCreateEmail */
export async function sendConfirmationEmail(params: ReservationEmailParams) {
  return sendCreateEmail(params);
}

export async function sendConfirmedEmail(params: ReservationEmailParams) {
  try {
    const locale = resolveLocale(params.locale);
    const { to, cancellationLink, specialRequests, date, ...rest } = params;
    const subject = emailTranslations[locale].confirmed.subject;
    const html = await render(
      React.createElement(ConfirmationEmail, {
        ...rest,
        date: formatEmailDate(date),
        specialRequests,
        cancellationLink,
        locale,
        kind: "confirmed",
      })
    );
    await sendEmail({ to, subject, html, label: "sendConfirmedEmail" });
  } catch (err) {
    console.error("[email] sendConfirmedEmail failed:", err);
  }
}

export async function sendCancellationEmail(params: {
  to: string;
  firstName: string;
  date: string;
  timeLabel: string;
  accommodationLabel: string;
  partySize: number;
  locale: Locale | string | null | undefined;
}) {
  try {
    const locale = resolveLocale(params.locale);
    const { to, date, ...rest } = params;
    const subject = emailTranslations[locale].cancellation.subject;
    const html = await render(
      React.createElement(CancellationEmail, {
        ...rest,
        date: formatEmailDate(date),
        locale,
      })
    );
    await sendEmail({ to, subject, html, label: "sendCancellationEmail" });
  } catch (err) {
    console.error("[email] sendCancellationEmail failed:", err);
  }
}

export async function sendNoShowEmail(params: {
  to: string;
  firstName: string;
  date: string;
  timeLabel: string;
  locale: Locale | string | null | undefined;
}) {
  try {
    const locale = resolveLocale(params.locale);
    const { to, date, ...rest } = params;
    const subject = emailTranslations[locale].noShow.subject;
    const html = await render(
      React.createElement(NoShowEmail, {
        ...rest,
        date: formatEmailDate(date),
        locale,
      })
    );
    await sendEmail({ to, subject, html, label: "sendNoShowEmail" });
  } catch (err) {
    console.error("[email] sendNoShowEmail failed:", err);
  }
}

/** @deprecated Use sendNoShowEmail — charge flow no longer sends email */
export async function sendNoShowChargeEmail(params: {
  to: string;
  firstName: string;
  date: string;
  timeLabel: string;
  amount?: number;
  locale: Locale | string | null | undefined;
}) {
  const { amount: _amount, ...rest } = params;
  return sendNoShowEmail(rest);
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
    const html = await render(
      React.createElement(AdminNotificationEmail, {
        ...params,
        date: formatEmailDate(params.date),
      })
    );
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
