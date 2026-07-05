"use client";

import { useState, useEffect } from "react";
import { Layers, Briefcase, GraduationCap, Award } from "lucide-react";
import { LinkedInIcon, XIcon } from "@/components/slug/SocialIcons";
import { getInitials, getSkillsArray, fetchTeamMembers, type Profile, type TeamMemberPublic } from "@/lib/data/slugPage";

export default function TeamTab({ profile }: { profile: Profile }) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberPublic[]>([]);

  useEffect(() => {
    fetchTeamMembers(profile.id).then(setTeamMembers);
  }, [profile.id]);

  return (
    <div style={styles.founderContent}>

      {/* ── Founder ── */}
      <div style={styles.founderCard}>
        <div style={styles.founderHeaderRow}>
          <div style={styles.founderAvatar}>
            {profile.founder_photo_url
              ? <img src={profile.founder_photo_url} alt="founder" style={styles.founderPhoto} />
              : <span style={styles.founderInitials}>{getInitials(profile.founder_name)}</span>
            }
          </div>
          <div>
            <div style={styles.founderNameRow}>
              <p style={styles.founderName}>{profile.founder_name || "Founder"}</p>
              <span style={styles.founderBadge}>Founder</span>
            </div>
            <p style={styles.founderRole}>{profile.founder_role || ""}</p>
            <div style={styles.founderSocials}>
              {profile.founder_linkedin && (
                <a href={profile.founder_linkedin} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  <LinkedInIcon />LinkedIn
                </a>
              )}
              {profile.founder_twitter && (
                <a href={profile.founder_twitter} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  <XIcon />Twitter
                </a>
              )}
            </div>
          </div>
        </div>
        {profile.founder_bio && (
          <>
            <div style={styles.cvDivider} />
            <p style={styles.founderBio}>{profile.founder_bio}</p>
          </>
        )}
      </div>

      {profile.founder_skills && (
        <div style={styles.founderCard}>
          <div style={styles.cvSectionHeader}>
            <Layers size={15} color="#999999" />
            <p style={styles.cvSectionLabel}>Skills</p>
          </div>
          <div style={styles.skillsRow}>
            {getSkillsArray(profile.founder_skills).map((skill, i) => (
              <span key={i} style={styles.skillTag}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {profile.founder_experience?.length > 0 && (
        <div style={styles.founderCard}>
          <div style={styles.cvSectionHeader}>
            <Briefcase size={15} color="#999999" />
            <p style={styles.cvSectionLabel}>Experience</p>
          </div>
          {profile.founder_experience.map((exp, i) => (
            <div key={exp.id} style={styles.cvEntry}>
              <div style={styles.cvEntryLeft}>
                <div style={styles.cvEntryDot} />
                {i < profile.founder_experience.length - 1 && <div style={styles.cvEntryLine} />}
              </div>
              <div style={styles.cvEntryBody}>
                <p style={styles.cvEntryTitle}>{exp.role}</p>
                <p style={styles.cvEntrySubtitle}>{exp.company}</p>
                <p style={styles.cvEntryDate}>{exp.year_start} — {exp.year_end}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {profile.founder_education?.length > 0 && (
        <div style={styles.founderCard}>
          <div style={styles.cvSectionHeader}>
            <GraduationCap size={15} color="#999999" />
            <p style={styles.cvSectionLabel}>Education</p>
          </div>
          {profile.founder_education.map((edu, i) => (
            <div key={edu.id} style={styles.cvEntry}>
              <div style={styles.cvEntryLeft}>
                <div style={styles.cvEntryDot} />
                {i < profile.founder_education.length - 1 && <div style={styles.cvEntryLine} />}
              </div>
              <div style={styles.cvEntryBody}>
                <p style={styles.cvEntryTitle}>{edu.degree}</p>
                <p style={styles.cvEntrySubtitle}>{edu.school}</p>
                <p style={styles.cvEntryDate}>{edu.year}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {profile.founder_achievements && (
        <div style={styles.founderCard}>
          <div style={styles.cvSectionHeader}>
            <Award size={15} color="#999999" />
            <p style={styles.cvSectionLabel}>Achievements</p>
          </div>
          <p style={styles.cvText}>{profile.founder_achievements}</p>
        </div>
      )}

      {/* ── Team Members ── */}
      {teamMembers.map((member) => (
        <div key={member.id} style={styles.founderCard}>
          <div style={styles.founderHeaderRow}>
            <div style={styles.founderAvatar}>
              {member.photo_url
                ? <img src={member.photo_url} alt={member.name} style={styles.founderPhoto} />
                : <span style={styles.founderInitials}>{getInitials(member.name)}</span>
              }
            </div>
            <div>
              <p style={styles.founderName}>{member.name}</p>
              <p style={styles.founderRole}>{member.role}</p>
              <div style={styles.founderSocials}>
                {member.linkedin_url && (
                  <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                    <LinkedInIcon />LinkedIn
                  </a>
                )}
                {member.twitter_url && (
                  <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                    <XIcon />Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
          {member.bio && (
            <>
              <div style={styles.cvDivider} />
              <p style={styles.founderBio}>{member.bio}</p>
            </>
          )}
        </div>
      ))}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  founderContent: { display: "flex", flexDirection: "column", gap: "14px" },
  founderCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  founderHeaderRow: { display: "flex", alignItems: "center", gap: "16px" },
  founderAvatar: { width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  founderPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  founderInitials: { fontSize: "18px", fontWeight: "600", color: "#111111" },
  founderNameRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" },
  founderName: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0" },
  founderBadge: { fontSize: "10px", fontWeight: "600", color: "#3182ce", backgroundColor: "#ebf8ff", padding: "2px 8px", borderRadius: "99px", border: "1px solid #bee3f8" },
  founderRole: { fontSize: "13px", color: "#666666", margin: "0 0 8px 0" },
  founderSocials: { display: "flex", gap: "8px" },
  socialLink: { fontSize: "12px", color: "#111111", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", border: "1px solid #eeeeee", padding: "4px 10px", borderRadius: "99px", backgroundColor: "#fafafa" },
  cvDivider: { height: "1px", backgroundColor: "#f0f0f0", margin: "20px 0" },
  founderBio: { fontSize: "14px", color: "#444444", lineHeight: "1.7", margin: "0" },
  cvSectionHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  cvSectionLabel: { fontSize: "11px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillTag: { padding: "5px 14px", backgroundColor: "#f5f5f5", borderRadius: "99px", fontSize: "12px", color: "#444444", fontWeight: "500", border: "1px solid #eeeeee" },
  cvEntry: { display: "flex", gap: "14px", marginBottom: "16px" },
  cvEntryLeft: { display: "flex", flexDirection: "column", alignItems: "center", width: "10px", flexShrink: 0, marginTop: "5px" },
  cvEntryDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#111111", flexShrink: 0 },
  cvEntryLine: { width: "1px", flex: 1, backgroundColor: "#eeeeee", marginTop: "4px", minHeight: "24px" },
  cvEntryBody: { flex: 1, paddingBottom: "8px" },
  cvEntryTitle: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  cvEntrySubtitle: { fontSize: "13px", color: "#666666", margin: "0 0 2px 0" },
  cvEntryDate: { fontSize: "12px", color: "#aaaaaa", margin: "0" },
  cvText: { fontSize: "14px", color: "#444444", lineHeight: "1.7", margin: "0" },
};