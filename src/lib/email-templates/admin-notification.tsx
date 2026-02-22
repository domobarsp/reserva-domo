import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
} from "@react-email/components";
import { emailTranslations } from "@/lib/email-translations";

interface AdminNotificationEmailProps {
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
}

export function AdminNotificationEmail({
  customerName,
  email,
  phone,
  date,
  timeLabel,
  accommodationLabel,
  partySize,
  specialRequests,
  hasCard,
  reservationId,
}: AdminNotificationEmailProps) {
  // Admin notification always in PT
  const t = emailTranslations.pt.adminNotification;

  return (
    <Html lang="pt">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Domo — {t.title}</Heading>
          <Text style={idText}>#{reservationId.slice(0, 8).toUpperCase()}</Text>

          <Hr style={hr} />

          <Section style={detailsBox}>
            <table style={table}>
              <tbody>
                <tr>
                  <td style={labelCell}>{t.customerLabel}</td>
                  <td style={valueCell}>{customerName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>{t.emailLabel}</td>
                  <td style={valueCell}>{email}</td>
                </tr>
                {phone && (
                  <tr>
                    <td style={labelCell}>{t.phoneLabel}</td>
                    <td style={valueCell}>{phone}</td>
                  </tr>
                )}
                <tr>
                  <td style={labelCell}>{t.dateLabel}</td>
                  <td style={valueCell}>{date}</td>
                </tr>
                <tr>
                  <td style={labelCell}>{t.timeLabel}</td>
                  <td style={valueCell}>{timeLabel}</td>
                </tr>
                <tr>
                  <td style={labelCell}>{t.accommodationLabel}</td>
                  <td style={valueCell}>{accommodationLabel}</td>
                </tr>
                <tr>
                  <td style={labelCell}>{t.partySizeLabel}</td>
                  <td style={valueCell}>{partySize}</td>
                </tr>
                {specialRequests && (
                  <tr>
                    <td style={labelCell}>{t.specialRequestsLabel}</td>
                    <td style={valueCell}>{specialRequests}</td>
                  </tr>
                )}
                <tr>
                  <td style={labelCell}>{t.cardLabel}</td>
                  <td style={valueCell}>{hasCard ? "✓ Sim" : "Não"}</td>
                </tr>
              </tbody>
            </table>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container: React.CSSProperties = {
  margin: "40px auto",
  padding: "32px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  maxWidth: "560px",
};

const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#65a30d",
  marginBottom: "4px",
};

const idText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  fontFamily: "monospace",
  margin: "0 0 16px 0",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "16px 0",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const labelCell: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  padding: "5px 8px 5px 0",
  fontWeight: "500",
  width: "35%",
  verticalAlign: "top",
};

const valueCell: React.CSSProperties = {
  fontSize: "13px",
  color: "#111827",
  padding: "5px 0",
  verticalAlign: "top",
};
