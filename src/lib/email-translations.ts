export type Locale = "pt" | "en" | "es";

export function resolveLocale(locale: string | null | undefined): Locale {
  if (locale === "en" || locale === "es" || locale === "pt") return locale;
  return "pt";
}

interface SharedLabels {
  dateLabel: string;
  timeLabel: string;
  accommodationLabel: string;
  partySizeLabel: string;
  specialRequestsLabel: string;
  cancelLinkText: string;
}

interface CreateConfirmedStrings {
  subject: string;
  greeting: (firstName: string) => string;
  intro: string;
  footer: string;
}

interface CancellationStrings {
  subject: string;
  greeting: (firstName: string) => string;
  message: string;
  detailsTitle: string;
  footer: string;
}

interface NoShowStrings {
  subject: string;
  greeting: (firstName: string) => string;
  message: string;
  footer: string;
}

interface AdminNotificationStrings {
  subject: string;
  title: string;
  customerLabel: string;
  emailLabel: string;
  phoneLabel: string;
  dateLabel: string;
  timeLabel: string;
  accommodationLabel: string;
  partySizeLabel: string;
  specialRequestsLabel: string;
  cardLabel: string;
}

interface EmailStrings {
  labels: SharedLabels;
  create: CreateConfirmedStrings;
  confirmed: CreateConfirmedStrings;
  cancellation: CancellationStrings;
  noShow: NoShowStrings;
  adminNotification: AdminNotificationStrings;
}

export const emailTranslations: Record<Locale, EmailStrings> = {
  pt: {
    labels: {
      dateLabel: "Data",
      timeLabel: "Horário",
      accommodationLabel: "Acomodação",
      partySizeLabel: "Pessoas",
      specialRequestsLabel: "Pedidos especiais",
      cancelLinkText: "Cancelar reserva",
    },
    create: {
      subject: "Reserva recebida — Dōmo",
      greeting: (firstName) => `Olá, ${firstName}!`,
      intro:
        "Sua reserva no Dōmo foi cadastrada com sucesso e em breve será confirmada pela nossa equipe. Veja os detalhes abaixo:",
      footer: "Até breve no Dōmo!",
    },
    confirmed: {
      subject: "Sua reserva foi confirmada — Dōmo",
      greeting: (firstName) => `Olá, ${firstName}!`,
      intro:
        "Ótima notícia: sua reserva no Dōmo foi confirmada. Esperamos você! Veja os detalhes abaixo:",
      footer: "Até breve no Dōmo!",
    },
    cancellation: {
      subject: "Sua reserva foi cancelada — Dōmo",
      greeting: (firstName) => `Olá, ${firstName},`,
      message:
        "Sua reserva foi cancelada. Esperamos vê-lo em breve em outra ocasião.",
      detailsTitle: "Detalhes da reserva cancelada",
      footer: "Até a próxima no Dōmo!",
    },
    noShow: {
      subject: "Não comparecimento — Dōmo",
      greeting: (firstName) => `Olá, ${firstName},`,
      message:
        "Registramos que você não compareceu à sua reserva no Dōmo. Conforme informado no momento da reserva, uma cobrança de no-show pode ser realizada.",
      footer: "Em caso de dúvidas, entre em contato conosco.",
    },
    adminNotification: {
      subject: "Nova reserva recebida",
      title: "Nova Reserva",
      customerLabel: "Cliente",
      emailLabel: "E-mail",
      phoneLabel: "Telefone",
      dateLabel: "Data",
      timeLabel: "Horário",
      accommodationLabel: "Acomodação",
      partySizeLabel: "Pessoas",
      specialRequestsLabel: "Pedidos especiais",
      cardLabel: "Cartão registrado",
    },
  },
  en: {
    labels: {
      dateLabel: "Date",
      timeLabel: "Time",
      accommodationLabel: "Seating",
      partySizeLabel: "Guests",
      specialRequestsLabel: "Special requests",
      cancelLinkText: "Cancel reservation",
    },
    create: {
      subject: "Reservation received — Dōmo",
      greeting: (firstName) => `Hello, ${firstName}!`,
      intro:
        "Your reservation at Dōmo has been registered successfully and will be confirmed by our team shortly. See the details below:",
      footer: "See you soon at Dōmo!",
    },
    confirmed: {
      subject: "Your reservation is confirmed — Dōmo",
      greeting: (firstName) => `Hello, ${firstName}!`,
      intro:
        "Great news: your reservation at Dōmo has been confirmed. We look forward to seeing you! See the details below:",
      footer: "See you soon at Dōmo!",
    },
    cancellation: {
      subject: "Your reservation has been cancelled — Dōmo",
      greeting: (firstName) => `Hello, ${firstName},`,
      message:
        "Your reservation has been cancelled. We hope to see you again soon.",
      detailsTitle: "Cancelled reservation details",
      footer: "Until next time at Dōmo!",
    },
    noShow: {
      subject: "No-show notice — Dōmo",
      greeting: (firstName) => `Hello, ${firstName},`,
      message:
        "We recorded that you did not attend your reservation at Dōmo. As informed when you booked, a no-show charge may be applied.",
      footer: "If you have any questions, please contact us.",
    },
    adminNotification: {
      subject: "New reservation received",
      title: "New Reservation",
      customerLabel: "Customer",
      emailLabel: "Email",
      phoneLabel: "Phone",
      dateLabel: "Date",
      timeLabel: "Time",
      accommodationLabel: "Seating",
      partySizeLabel: "Guests",
      specialRequestsLabel: "Special requests",
      cardLabel: "Card on file",
    },
  },
  es: {
    labels: {
      dateLabel: "Fecha",
      timeLabel: "Hora",
      accommodationLabel: "Acomodación",
      partySizeLabel: "Personas",
      specialRequestsLabel: "Solicitudes especiales",
      cancelLinkText: "Cancelar reserva",
    },
    create: {
      subject: "Reserva recibida — Dōmo",
      greeting: (firstName) => `¡Hola, ${firstName}!`,
      intro:
        "Tu reserva en Dōmo ha sido registrada con éxito y será confirmada por nuestro equipo en breve. Consulta los detalles a continuación:",
      footer: "¡Hasta pronto en Dōmo!",
    },
    confirmed: {
      subject: "Tu reserva está confirmada — Dōmo",
      greeting: (firstName) => `¡Hola, ${firstName}!`,
      intro:
        "Buenas noticias: tu reserva en Dōmo ha sido confirmada. ¡Te esperamos! Consulta los detalles a continuación:",
      footer: "¡Hasta pronto en Dōmo!",
    },
    cancellation: {
      subject: "Tu reserva ha sido cancelada — Dōmo",
      greeting: (firstName) => `Hola, ${firstName},`,
      message:
        "Tu reserva ha sido cancelada. Esperamos verte pronto en otra ocasión.",
      detailsTitle: "Detalles de la reserva cancelada",
      footer: "¡Hasta la próxima en Dōmo!",
    },
    noShow: {
      subject: "Aviso de no presentación — Dōmo",
      greeting: (firstName) => `Hola, ${firstName},`,
      message:
        "Registramos que no asististe a tu reserva en Dōmo. Según lo informado al reservar, se puede aplicar un cargo por no presentarse.",
      footer: "Si tienes alguna pregunta, contáctanos.",
    },
    adminNotification: {
      subject: "Nueva reserva recibida",
      title: "Nueva Reserva",
      customerLabel: "Cliente",
      emailLabel: "Correo",
      phoneLabel: "Teléfono",
      dateLabel: "Fecha",
      timeLabel: "Hora",
      accommodationLabel: "Acomodación",
      partySizeLabel: "Personas",
      specialRequestsLabel: "Solicitudes especiales",
      cardLabel: "Tarjeta registrada",
    },
  },
};
