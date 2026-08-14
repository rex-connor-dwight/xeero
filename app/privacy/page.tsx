"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Overview",
    body: `This Privacy Policy describes how Xeero ("Xeero," "we," "us," or "our") collects, uses, and protects information when you use our platform. By using Xeero, you agree to the collection and use of information as described here.`,
  },
  {
    title: "2. Information We Collect",
    body: `Account Information: When you create an account, we collect your email address and authentication information.

Profile Information: This includes your startup name, tagline, founder details, business information, pitch deck, links you choose to add, and any content you upload to build your public profile or data room.

Team Information: If you invite team members, we collect their email address, name, role, and any profile information they provide upon joining.

Payment Information: When you make a payment, our third-party payment processor collects the payment details necessary to process the transaction. Xeero does not store your full card number or banking credentials. For founders receiving payouts, such as through Community Support, we collect the bank account details necessary to facilitate those payouts.

Usage Information: We collect information about how you interact with Xeero, including page views, profile visits, and waitlist or data room activity, to help founders understand engagement with their profile.

Visitor and Applicant Information: If you sign up for a founder's waitlist, request data room access, apply for funding, book a consultation, or otherwise submit information through a founder's profile or Xeero's programs, we collect the information you provide in that process.`,
  },
  {
    title: "3. How We Use Information",
    body: `We use the information we collect to operate and improve Xeero, including to create and display your public profile, facilitate waitlist and data room functionality, process payments, communicate with you about your account or applications, send email notifications related to features you use, evaluate applications to Xeero's Services and advisory programs, and maintain the security and integrity of the platform.

We do not sell your personal information to third parties.`,
  },
  {
    title: "4. How Payment Information Is Handled",
    body: `Payments made on Xeero, including the one-time profile publishing fee, Xeero for Teams subscriptions, Services purchases, and advisory bookings, are processed through a third-party payment processor. Before completing any payment, you are shown the amount, purpose, and terms applicable to that payment, and by proceeding you confirm that you have read and agree to the associated Terms of Use.

Xeero retains records of payments made on the platform, including the amount, purpose, and reference identifier, for accounting, tax, and legal compliance purposes. These records are retained even if the associated profile or account is later deleted.`,
  },
  {
    title: "5. Public Information",
    body: `Information you choose to include on your published Xeero profile, such as your startup details, founder CV, pitch deck, and any links you add, is publicly visible to anyone who visits your profile link. Do not include information on your public profile that you do not want to be publicly accessible.

Information shared within a private data room is only accessible to visitors you have explicitly approved.`,
  },
  {
    title: "6. Data Sharing",
    body: `We do not share your personal information with third parties except: with service providers who help us operate the platform, such as payment processing, email delivery, and hosting infrastructure, each of which is contractually obligated to protect your information; when required by law, regulation, or legal process; to protect the rights, property, or safety of Xeero, our users, or the public; or with your consent, such as when you approve a data room access request.

If you apply to a Service or program operated by Xeero or its affiliated venture studio, the information in your application is shared internally with the team reviewing that application.`,
  },
  {
    title: "7. Data Retention",
    body: `We retain your information for as long as your account is active or as needed to provide you services. If you request account deletion, your account and associated data will be permanently deleted 30 days after the request, with the exception of payment records, which are retained for accounting and legal purposes as described above. You may cancel a pending deletion request at any time before it is processed.`,
  },
  {
    title: "8. Your Rights and Choices",
    body: `You can access and update most of your profile information directly from your dashboard. You can control which sections of your public profile are visible to visitors through your account settings. You may request deletion of your account and data at any time as described in Section 7. If you have questions about your data or wish to make a request not covered by the tools available in your dashboard, contact us at hello@xeero.me.`,
  },
  {
    title: "9. Data Security",
    body: `We take reasonable technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "10. Children's Privacy",
    body: `Xeero is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child without appropriate consent, we will take steps to delete that information.`,
  },
  {
    title: "11. International Users",
    body: `Xeero is used by founders and visitors in multiple countries. By using Xeero, you understand that your information may be transferred to and processed in countries other than your own, which may have different data protection laws than your jurisdiction.`,
  },
  {
    title: "12. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. If we make material changes, we will update the effective date below. Continued use of Xeero after changes take effect constitutes acceptance of the revised policy.`,
  },
  {
    title: "13. Contact",
    body: `If you have questions about this Privacy Policy or how we handle your information, contact us at dev@xeero.me.`,
  },
];

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <button style={styles.backBtn} onClick={() => router.push("/")}>
            <ArrowLeft size={13} />Back to Xeero
          </button>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.effectiveDate}>Effective June 1, 2026</p>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.card}>
          {SECTIONS.map((section) => (
            <div key={section.title} style={styles.section}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              {section.body.split("\n\n").map((para, i) => (
                <p key={i} style={styles.paragraph}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  hero: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)", padding: "60px 24px 48px 24px" },
  heroContent: { maxWidth: "700px", margin: "0 auto" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(255,255,255,0.6)", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "24px", padding: "0" },
  title: { fontSize: "32px", fontWeight: "800", color: "#ffffff", margin: "0 0 8px 0", letterSpacing: "-0.01em" },
  effectiveDate: { fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "0" },
  body: { maxWidth: "700px", margin: "0 auto", padding: "40px 24px 80px 24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "36px 32px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 10px 0" },
  paragraph: { fontSize: "13px", color: "#555555", lineHeight: "1.8", margin: "0 0 10px 0" },
};