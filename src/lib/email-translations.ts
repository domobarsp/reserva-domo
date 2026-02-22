export type Locale = "pt" | "en" | "es";

interface ConfirmationStrings {
  subject: string;
  greeting: (firstName: string) => string;
  intro: string;
  dateLabel: string;
  timeLabel: string;
  accommodationLabel: string;
  partySizeLabel: string;
  specialRequestsLabel: string;
  cancelLinkText: string;
  footer: string;
}

interface CancellationStrings {
  subject: string;
  greeting: (firstName: string) => string;
  message: string;
  detailsTitle: string;
  footer: string;
}

interface NoShowChargeStrings {
  subject: string;
  greeting: (firstName: string) => string;
  message: string;
  amountLabel: string;
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
  confirmation: ConfirmationStrings;
  cancellation: CancellationStrings;
  noShowCharge: NoShowChargeStrings;
  adminNotification: AdminNotificationStrings;
}

export const emailTranslations: Record<Locale, EmailStrings> = {
  pt: {
    confirmation: {
      subject: "Sua reserva foi confirmada — Domo",
      greeting: (firstName) => `Olá, ${firstName}!`,
      intro: "Sua reserva no Domo foi realizada com sucesso. Veja os detalhes abaixo:",
      dateLabel: "Data",
      timeLabel: "Horário",
      accommodationLabel: "Acomodação",
      partySizeLabel: "Pessoas",
      specialRequestsLabel: "Pedidos especiais",
      cancelLinkText: "Cancelar reserva",
      footer: "Até breve no Domo!",
    },
    cancellation: {
      subject: "Sua reserva foi cancelada — Domo",
      greeting: (firstName) => `Olá, ${firstName},`,
      message: "Sua reserva foi cancelada conforme solicitado. Esperamos vê-lo em breve.",
      detailsTitle: "Detalhes da reserva cancelada",
      footer: "Até a próxima no Domo!",
    },
    noShowCharge: {
      subject: "Cobrança de no-show — Domo",
      greeting: (firstName) => `Olá, ${firstName},`,
      message: "Uma cobrança de no-show foi realizada referente à sua reserva que não foi comparecida.",
      amountLabel: "Valor cobrado",
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
    confirmation: {
      subject: "Your reservation is confirmed — Domo",
      greeting: (firstName) => `Hello, ${firstName}!`,
      intro: "Your reservation at Domo has been successfully made. See the details below:",
      dateLabel: "Date",
      timeLabel: "Time",
      accommodationLabel: "Seating",
      partySizeLabel: "Guests",
      specialRequestsLabel: "Special requests",
      cancelLinkText: "Cancel reservation",
      footer: "See you soon at Domo!",
    },
    cancellation: {
      subject: "Your reservation has been cancelled — Domo",
      greeting: (firstName) => `Hello, ${firstName},`,
      message: "Your reservation has been cancelled as requested. We hope to see you soon.",
      detailsTitle: "Cancelled reservation details",
      footer: "Until next time at Domo!",
    },
    noShowCharge: {
      subject: "No-show charge — Domo",
      greeting: (firstName) => `Hello, ${firstName},`,
      message: "A no-show charge has been applied to your reservation that was not attended.",
      amountLabel: "Amount charged",
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
    confirmation: {
      subject: "Tu reserva está confirmada — Domo",
      greeting: (firstName) => `¡Hola, ${firstName}!`,
      intro: "Tu reserva en Domo se ha realizado con éxito. Consulta los detalles a continuación:",
      dateLabel: "Fecha",
      timeLabel: "Hora",
      accommodationLabel: "Acomodación",
      partySizeLabel: "Personas",
      specialRequestsLabel: "Solicitudes especiales",
      cancelLinkText: "Cancelar reserva",
      footer: "¡Hasta pronto en Domo!",
    },
    cancellation: {
      subject: "Tu reserva ha sido cancelada — Domo",
      greeting: (firstName) => `Hola, ${firstName},`,
      message: "Tu reserva ha sido cancelada según lo solicitado. Esperamos verte pronto.",
      detailsTitle: "Detalles de la reserva cancelada",
      footer: "¡Hasta la próxima en Domo!",
    },
    noShowCharge: {
      subject: "Cargo por no presentarse — Domo",
      greeting: (firstName) => `Hola, ${firstName},`,
      message: "Se ha aplicado un cargo por no presentarse a tu reserva.",
      amountLabel: "Monto cobrado",
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
