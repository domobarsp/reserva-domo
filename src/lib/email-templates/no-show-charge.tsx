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
import { emailTranslations, type Locale } from "@/lib/email-translations";

interface NoShowChargeEmailProps {
  firstName: string;
  date: string;
  timeLabel: string;
  /** Amount in cents */
  amount: number;
  locale: Locale;
}

function formatAmount(amount: number, locale: Locale): string {
  const value = amount / 100;
  if (locale === "pt") {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  }
  return `$${value.toFixed(2)}`;
}

export function NoShowChargeEmail({
  firstName,
  date,
  timeLabel,
  amount,
  locale,
}: NoShowChargeEmailProps) {
  const t = emailTranslations[locale].noShowCharge;
  const dateLabel = emailTranslations[locale].confirmation.dateLabel;
  const timeLabelStr = emailTranslations[locale].confirmation.timeLabel;

  return (
    <Html lang={locale}>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Dōmo</Heading>
          <Text style={paragraph}>{t.greeting(firstName)}</Text>
          <Text style={paragraph}>{t.message}</Text>

          <Hr style={hr} />

          <Section style={detailsBox}>
            <table style={table}>
              <tbody>
                <tr>
                  <td style={labelCell}>{dateLabel}</td>
                  <td style={valueCell}>{date}</td>
                </tr>
                <tr>
                  <td style={labelCell}>{timeLabelStr}</td>
                  <td style={valueCell}>{timeLabel}</td>
                </tr>
                <tr>
                  <td style={labelCell}>{t.amountLabel}</td>
                  <td style={{ ...valueCell, fontWeight: "600" }}>
                    {formatAmount(amount, locale)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

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

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "24px 0",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#fff7ed",
  borderRadius: "6px",
  padding: "16px",
  border: "1px solid #fed7aa",
  margin: "8px 0 16px 0",
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

const footer: React.CSSProperties = {
  fontSize: "13px",
  color: "#9ca3af",
  marginTop: "24px",
  textAlign: "center" as const,
};
