"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import UpgradeGateModal from "@/components/dashboard/UpgradeGateModal";
import WaitlistHeader from "@/components/dashboard/waitlist/WaitlistHeader";
import WaitlistComposer from "@/components/dashboard/waitlist/WaitlistComposer";
import WaitlistStats from "@/components/dashboard/waitlist/WaitlistStats";
import WaitlistEmailHistory from "@/components/dashboard/waitlist/WaitlistEmailHistory";
import WaitlistTable from "@/components/dashboard/waitlist/WaitlistTable";
import WaitlistImportModal from "@/components/dashboard/waitlist/WaitlistImportModal";

type WaitlistEntry = { id: string; email: string; name: string; created_at: string; source?: string };
type EmailHistory = { id: string; subject: string; sent_count: number; created_at: string };

function exportCSV(entries: WaitlistEntry[], startupName: string) {
  const header = "Name,Email,Joined\n";
  const rows = entries
    .map((e) => `${e.name || ""},${e.email},${new Date(e.created_at).toLocaleDateString()}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${startupName}-waitlist.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WaitlistView() {
  const { profile, profileLoading, isTeamMember, founderProfile, isTeamsActive } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [subject, setSubject] = useState("");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [sendError, setSendError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showGate, setShowGate] = useState(false);

  const fetchWaitlist = () => {
    if (!activeProfile) return;
    supabase
      .from("waitlist")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setWaitlist(data || []);
        setWaitlistLoading(false);
      });
  };

  useEffect(() => {
    if (!activeProfile) return;
    fetchWaitlist();

    supabase
      .from("waitlist_emails")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setEmailHistory(data || []));
  }, [activeProfile]);

  const handleSend = async () => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    if (!(subject && header && body) || !activeProfile) return;
    setSending(true);
    setSendError("");
    setSendResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/waitlist-broadcast`,
        { method: "OPTIONS", headers: { "Authorization": `Bearer ${session?.access_token}` } }
      ).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/waitlist-broadcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            profile_id: activeProfile.id,
            subject,
            header,
            body,
            cta_label: ctaLabel || undefined,
            cta_url: ctaUrl || undefined,
            image_url: imageUrl || undefined,
            reply_to: replyTo || undefined,
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok || data.error) setSendError(data.error || "Something went wrong.");
      else {
        setSendResult(data);
        const { data: history } = await supabase
          .from("waitlist_emails")
          .select("*")
          .eq("profile_id", activeProfile.id)
          .order("created_at", { ascending: false });
        setEmailHistory(history || []);
      }
    } catch (err: any) {
      if (err.name === "AbortError") setSendError("Request timed out. Please try again.");
      else setSendError("Something went wrong. Please try again.");
    }
    setSending(false);
  };

  const handleReset = () => {
    setSendResult(null);
    setSubject("");
    setHeader("");
    setBody("");
    setCtaLabel("");
    setCtaUrl("");
    setReplyTo("");
    setImageUrl("");
    setSendError("");
    setShowPreview(false);
  };

  if (profileLoading || waitlistLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const startupName = activeProfile?.startup_name || "";
  const existingEmails = new Set(waitlist.map((w) => w.email.toLowerCase()));

  return (
    <div style={styles.page}>
      {showGate && <UpgradeGateModal featureName="Waitlist Emailer" onClose={() => setShowGate(false)} />}

      {showImport && activeProfile && (
        <WaitlistImportModal
          profileId={activeProfile.id}
          existingEmails={existingEmails}
          onClose={() => setShowImport(false)}
          onImported={fetchWaitlist}
        />
      )}

      <WaitlistHeader
        count={waitlist.length}
        startupName={startupName}
        onExport={() => exportCSV(waitlist, startupName)}
        onImport={() => setShowImport(true)}
        onComposeToggle={() => { setShowComposer(!showComposer); setSendResult(null); }}
      />

      {showComposer && (
        <WaitlistComposer
          waitlistCount={waitlist.length}
          startupName={startupName}
          subject={subject} setSubject={setSubject}
          header={header} setHeader={setHeader}
          body={body} setBody={setBody}
          ctaLabel={ctaLabel} setCtaLabel={setCtaLabel}
          ctaUrl={ctaUrl} setCtaUrl={setCtaUrl}
          replyTo={replyTo} setReplyTo={setReplyTo}
          imageUrl={imageUrl} setImageUrl={setImageUrl}
          imageUploading={imageUploading} setImageUploading={setImageUploading}
          sending={sending}
          sendError={sendError}
          sendResult={sendResult}
          showPreview={showPreview} setShowPreview={setShowPreview}
          onClose={() => { setShowComposer(false); handleReset(); }}
          onSend={handleSend}
          onReset={handleReset}
        />
      )}

      <WaitlistStats waitlist={waitlist} emailHistoryCount={emailHistory.length} />
      <WaitlistEmailHistory history={emailHistory} />
      <WaitlistTable waitlist={waitlist} isTeamMember={isTeamMember} />
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "860px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
};