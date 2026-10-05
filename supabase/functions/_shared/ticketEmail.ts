import type { EditionConfig } from "./editions.ts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildTicketEmailHtml(fullName: string, ticketCode: string, edition: EditionConfig) {
  const firstName = escapeHtml(fullName.split(" ")[0]);

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#F7F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #30166015;">
        <div style="background:#301660;padding:32px;text-align:center;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#F1A9FA;letter-spacing:0.08em;text-transform:uppercase;">The Venture Room &middot; ${edition.city}</p>
        </div>
        <div style="padding:32px;text-align:center;">
          <h1 style="font-size:20px;font-weight:700;color:#301660;margin:0 0 8px 0;">You're in, ${firstName}.</h1>
          <p style="font-size:13px;color:#301660;opacity:0.7;line-height:1.7;margin:0 0 24px 0;">
            ${edition.dateLabel} &middot; ${edition.timeLabel}<br />
            ${edition.venue}, ${edition.area}
          </p>
          <div style="background:#F1A9FA30;border:1px solid #F1A9FA;border-radius:14px;padding:18px;margin-bottom:24px;">
            <p style="font-size:11px;font-weight:700;color:#301660;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px 0;">Your Ticket Code</p>
            <p style="font-size:22px;font-weight:700;color:#301660;letter-spacing:0.05em;margin:0;">${ticketCode}</p>
          </div>
          <p style="font-size:12px;color:#301660;opacity:0.6;line-height:1.6;margin:0;">
            Bring this code with you to check in at the venue.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}