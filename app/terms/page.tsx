"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By creating an account, building a profile, or otherwise using Xeero ("Xeero," "we," "us," or "our"), you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use Xeero. These terms apply to founders, team members, investors, supporters, and any other visitor who interacts with the platform.

You must read and accept these Terms of Use before making any payment on Xeero, including the one-time fee to publish your profile, any Xeero for Teams subscription, any Services purchase, or any Community Support contribution.`,
  },
  {
    title: "2. What Xeero Is",
    body: `Xeero is a platform that allows founders to build a public startup profile, collect waitlist signups, manage a private data room, showcase a pitch deck, list team members, and connect with visitors including potential investors and early users. Xeero also offers optional paid Services, including but not limited to incorporation assistance, and access to Xeero for Teams, which unlocks team collaboration features and the Services marketplace.

Xeero is not an investment platform, broker-dealer, or financial advisor. Xeero does not guarantee funding, investor introductions, or any specific business outcome for any founder using the platform.`,
  },
  {
    title: "3. Accounts and Eligibility",
    body: `You must provide accurate information when creating an account and keep your profile information up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.

Founders may invite team members to join their startup's workspace on Xeero. Each team member is responsible for their own account and agrees to these Terms of Use upon accepting an invitation. Founders are responsible for the permissions granted to their team members and for any actions those team members take within the scope of those permissions.

You must be legally able to enter into a binding contract in your jurisdiction to use Xeero. If you are using Xeero on behalf of a company, venture studio, or other entity, you represent that you have the authority to bind that entity to these terms.`,
  },
  {
    title: "4. Payments",
    body: `Certain features on Xeero require payment, including publishing your profile publicly, subscribing to Xeero for Teams, purchasing Services such as incorporation assistance, and booking paid consultation packages. All fees are displayed prior to payment, and by completing a payment you confirm that you have read, understood, and agree to these Terms of Use as they relate to that purchase.

Payments are processed through a third-party payment processor. Xeero does not store your full card details. All fees are charged in the currency and amount displayed at checkout, converted where applicable using the exchange rate in effect at the time of payment.

Unless otherwise stated for a specific service, fees paid to Xeero are non-refundable once the corresponding feature or service has been activated or delivered. Where a service involves a deposit and installment structure, such as incorporation assistance, the specific terms of that payment plan will be presented to you before you commit to it, and cancellation or refund eligibility may be limited once processing has begun on your behalf.`,
  },
  {
    title: "5. Xeero for Teams and Team Access",
    body: `Xeero for Teams is an optional annual subscription that unlocks team member seats, role-based permissions, and access to the Services marketplace. Subscriptions renew automatically unless cancelled, and continued access to Teams features is contingent on an active subscription.

Founders control what permissions are granted to each team member and may revoke team member access at any time. Xeero is not responsible for disputes between a founder and their team members regarding access, permissions, or the use of information shared within a startup's workspace.`,
  },
  {
    title: "6. Services and Advisory Programs",
    body: `Xeero offers optional paid Services, including incorporation assistance and access to programs operated by Xeero's affiliated venture studio, such as technology development funding and paid advisory sessions. These Services are subject to additional terms presented to you at the time of application or purchase, including but not limited to eligibility requirements, review and assessment processes, and payment structures.

Applying for a Service or program does not guarantee approval, funding, or a specific outcome. Any commitment of funds, resources, or development support is subject to Xeero's or its affiliate's discretion and the terms presented to you upon approval.`,
  },
  {
    title: "7. Community Support",
    body: `Xeero allows approved founders to receive optional financial contributions from visitors through the Community Support feature. Supporters who contribute funds do so voluntarily and understand that such contributions are not investments, do not confer any ownership, equity, or financial return, and are not refundable once processed. Founders receiving Community Support are solely responsible for how those funds are used.`,
  },
  {
    title: "8. Content and Conduct",
    body: `You are solely responsible for the accuracy of the information you post on your Xeero profile, including startup details, founder information, links, and any documents uploaded to your data room. You agree not to use Xeero to post false, misleading, or fraudulent information, to impersonate any person or entity, or to use the platform for any unlawful purpose.

Xeero reserves the right to remove content, suspend, or terminate any account that violates these Terms of Use or that we reasonably believe is fraudulent, misleading, or harmful to other users.`,
  },
  {
    title: "9. Data Room and Confidential Information",
    body: `The data room feature allows founders to share documents with visitors they approve. Xeero facilitates this access but is not a party to any confidentiality agreement between a founder and the person requesting access. Founders are responsible for determining what information is appropriate to share and with whom.`,
  },
  {
    title: "10. Account Deletion",
    body: `You may request deletion of your account and associated data at any time through your account settings. Upon request, your account will be scheduled for permanent deletion 30 days from the date of the request. You may cancel a pending deletion request at any time before it is processed by logging back into your account.

Once processed, deletion is permanent and includes your profile, waitlist data, data room documents, team member records, and other associated data, with the exception of payment records, which Xeero retains for accounting and legal purposes even after an associated profile has been deleted.`,
  },
  {
    title: "11. Termination",
    body: `Xeero may suspend or terminate your access to the platform at any time, with or without notice, if we believe you have violated these Terms of Use or engaged in conduct harmful to Xeero or other users. You may stop using Xeero at any time and may request account deletion as described above.`,
  },
  {
    title: "12. Disclaimers and Limitation of Liability",
    body: `Xeero is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or secure at all times. Xeero does not guarantee investor interest, funding outcomes, or business results of any kind for founders using the platform.

To the fullest extent permitted by law, Xeero and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.`,
  },
  {
    title: "13. Changes to These Terms",
    body: `We may update these Terms of Use from time to time. If we make material changes, we will update the effective date below. Continued use of Xeero after changes take effect constitutes acceptance of the revised terms.`,
  },
  {
    title: "14. Contact",
    body: `If you have questions about these Terms of Use, contact us at dev@xeero.me.`,
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <button style={styles.backBtn} onClick={() => router.push("/")}>
            <ArrowLeft size={13} />Back to Xeero
          </button>
          <h1 style={styles.title}>Terms of Use</h1>
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