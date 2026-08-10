"use client";

type Props = { app: any; documents: any[] };

function Field({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={styles.field}>
      <p style={styles.fieldLabel}>{label}</p>
      <p style={styles.fieldValue}>{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <p style={styles.sectionTitle}>{title}</p>
      <div style={styles.sectionGrid}>{children}</div>
    </div>
  );
}

export default function ApplicationDetail({ app, documents }: Props) {
  return (
    <div style={styles.wrapper}>

      <Section title="Founder Information">
        <Field label="Full name" value={app.full_name} />
        <Field label="Email" value={app.email} />
        <Field label="Phone" value={app.phone_number} />
        <Field label="LinkedIn" value={app.linkedin_url} />
        <Field label="Location" value={app.location} />
        <Field label="Founder role" value={app.founder_role} />
        <Field label="Number of founders" value={app.number_of_founders} />
        <Field label="Team size" value={app.team_size} />
      </Section>

      <Section title="Startup Information">
        <Field label="Startup name" value={app.startup_name} />
        <Field label="Website" value={app.website_url} />
        <Field label="Industry" value={app.industry} />
        <Field label="Market served" value={app.market_served} />
        <Field label="Stage" value={app.startup_stage} />
        <Field label="Revenue status" value={app.revenue_status} />
        <Field label="Revenue amount" value={app.revenue_amount} />
        <Field label="Customer count" value={app.customer_count} />
        <Field label="Funding status" value={app.funding_status} />
        <Field label="Amount raised to date" value={app.amount_raised_to_date} />
        <Field label="Currently fundraising" value={app.currently_fundraising} />
      </Section>

      <Section title="Problem Validation">
        <Field label="Problem" value={app.problem_description} />
        <Field label="Who experiences it" value={app.who_experiences_problem} />
        <Field label="Current solutions" value={app.current_solutions} />
        <Field label="Validation method" value={app.validation_method} />
        <Field label="Customers spoken to" value={app.customers_spoken_to} />
        <Field label="Demand evidence" value={app.demand_evidence} />
        <Field label="Paid for manual version" value={app.customers_paid_for_manual_version} />
        <Field label="Pre-revenue evidence" value={app.pre_revenue_demand_evidence} />
      </Section>

      <Section title="Current Business">
        <Field label="Current operations" value={app.business_current_operations} />
        <Field label="Manual processes" value={app.manual_processes} />
        <Field label="Scaling blockers" value={app.scaling_blockers} />
        <Field label="Tech improvement area" value={app.tech_improvement_area} />
        <Field label="Consequence if not built" value={app.consequence_if_not_built} />
      </Section>

      <Section title="Technology Request">
        <Field label="Technology description" value={app.technology_description} />
        <Field label="Why needed now" value={app.why_needed_now} />
        <Field label="Current alternative" value={app.current_alternative} />
        <Field label="Has existing MVP" value={app.has_existing_mvp} />
        <Field label="Platforms required" value={(app.platforms_required || []).join(", ")} />
        <Field label="Minimum product" value={app.minimum_product_description} />
        <Field label="Success in 90 days" value={app.success_90_days} />
      </Section>

      <Section title="Development Budget">
        <Field label="Has development estimate" value={app.has_development_estimate} />
        <Field label="Estimated total cost" value={app.estimated_total_cost ? `$${Number(app.estimated_total_cost).toLocaleString()}` : null} />
        <Field label="Founder contribution" value={app.founder_contribution_amount ? `$${Number(app.founder_contribution_amount).toLocaleString()}` : null} />
        <Field label="Requested from Pordware" value={app.requested_pordware_amount ? `$${Number(app.requested_pordware_amount).toLocaleString()}` : null} />
        <Field label="Existing dev team" value={app.existing_dev_team} />
        <Field label="Previous dev work" value={app.previous_development_work} />
        <Field label="Existing codebase/assets" value={app.existing_codebase_assets} />
      </Section>

      <Section title="Business Model">
        <Field label="Revenue model" value={app.revenue_model} />
        <Field label="Current pricing" value={app.current_pricing_model} />
        <Field label="Expected change after tech" value={app.expected_change_after_tech} />
        <Field label="Expected revenue impact" value={app.expected_revenue_impact} />
        <Field label="Expected cost savings" value={app.expected_cost_savings} />
        <Field label="Expected capacity increase" value={app.expected_capacity_increase} />
      </Section>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Validation Evidence</p>
        {app.evidence_notes && <p style={styles.evidenceNotes}>{app.evidence_notes}</p>}
        {documents.length === 0 ? (
          <p style={styles.noDocs}>No files uploaded.</p>
        ) : (
          <div style={styles.docList}>
            {documents.map((doc) => (
              <a key={doc.id} href={doc.signedUrl || "#"} target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                {doc.file_name}
              </a>
            ))}
          </div>
        )}
      </div>

      <Section title="Founder Questions">
        <Field label="Why support this" value={app.why_support_this} />
        <Field label="Built without tech" value={app.what_built_without_tech} />
        <Field label="Customer learning" value={app.customer_learning} />
        <Field label="Fallback plan" value={app.fallback_plan} />
      </Section>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "16px" },
  section: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 14px 0" },
  sectionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  field: {},
  fieldLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px 0" },
  fieldValue: { fontSize: "13px", color: "#333333", margin: "0", lineHeight: "1.5", wordBreak: "break-word" },
  evidenceNotes: { fontSize: "13px", color: "#555555", lineHeight: "1.6", margin: "0 0 12px 0" },
  noDocs: { fontSize: "12px", color: "#aaaaaa", margin: "0" },
  docList: { display: "flex", flexDirection: "column", gap: "6px" },
  docLink: { fontSize: "13px", color: "#3182ce", textDecoration: "none" },
};