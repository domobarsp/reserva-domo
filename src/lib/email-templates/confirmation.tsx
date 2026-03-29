import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from "@react-email/components";
import { emailTranslations, type Locale } from "@/lib/email-translations";

interface ConfirmationEmailProps {
  firstName: string;
  date: string;
  timeLabel: string;
  accommodationLabel: string;
  partySize: number;
  specialRequests?: string;
  cancellationLink: string;
  locale: Locale;
}

export function ConfirmationEmail({
  firstName,
  date,
  timeLabel,
  accommodationLabel,
  partySize,
  specialRequests,
  cancellationLink,
  locale,
}: ConfirmationEmailProps) {
  const t = emailTranslations[locale].confirmation;

  return (
    <Html lang={locale}>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Dōmo</Heading>
          <Text style={paragraph}>{t.greeting(firstName)}</Text>
          <Text style={paragraph}>{t.intro}</Text>

          <Section style={detailsBox}>
            <table style={table}>
              <tbody>
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
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          <Button style={cancelButton} href={cancellationLink}>
            {t.cancelLinkText}
          </Button>

          <Text style={footer}>{t.footer}</Text>
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
  fontSize: "24px",
  fontWeight: "700",
  color: "#65a30d",
  marginBottom: "24px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  margin: "8px 0",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const labelCell: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  padding: "4px 8px 4px 0",
  fontWeight: "500",
  width: "40%",
  verticalAlign: "top",
};

const valueCell: React.CSSProperties = {
  fontSize: "13px",
  color: "#111827",
  padding: "4px 0",
  verticalAlign: "top",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "24px 0",
};

const cancelButton: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  color: "#374151",
  fontSize: "13px",
  padding: "10px 20px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  border: "1px solid #d1d5db",
};

const footer: React.CSSProperties = {
  fontSize: "13px",
  color: "#9ca3af",
  marginTop: "24px",
  textAlign: "center" as const,
};
