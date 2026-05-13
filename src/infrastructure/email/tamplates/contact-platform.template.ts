export const contactPlatformTemplate = (
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
): string => `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif;">
    <div style="max-width:580px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#059669; padding:24px 32px;">
        <h2 style="margin:0; color:#fff; font-size:18px;">📬 Mesazh i ri nga kontakti</h2>
        <p style="margin:4px 0 0; color:#a7f3d0; font-size:12px;">
          ${new Date().toLocaleString("sq-AL", { dateStyle: "full", timeStyle: "short" })}
        </p>
      </div>

      <!-- Info -->
      <div style="padding:24px 32px; border-bottom:1px solid #e5e7eb;">
        <table style="width:100%; font-size:14px; border-collapse:collapse;">
          <tr>
            <td style="padding:7px 0; color:#6b7280; width:100px;">👤 Emri</td>
            <td style="padding:7px 0; color:#111827; font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:7px 0; color:#6b7280;">✉️ Email</td>
            <td style="padding:7px 0;">
              <a href="mailto:${email}" style="color:#059669; text-decoration:none;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:7px 0; color:#6b7280;">📞 Tel</td>
            <td style="padding:7px 0; color:#111827;">${phone || "—"}</td>
          </tr>
          <tr>
            <td style="padding:7px 0; color:#6b7280;">📌 Tema</td>
            <td style="padding:7px 0;">
              <span style="background:#d1fae5; color:#065f46; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600;">
                ${subject}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Message -->
      <div style="padding:24px 32px;">
        <p style="margin:0 0 10px; color:#6b7280; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">💬 Mesazhi</p>
        <p style="margin:0; padding:16px; background:#f9fafb; border-left:4px solid #059669; border-radius:0 8px 8px 0; color:#374151; font-size:14px; line-height:1.7;">
          ${message.replace(/\n/g, "<br/>")}
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; padding:14px 32px; border-top:1px solid #e5e7eb; text-align:center;">
        <p style="margin:0; color:#9ca3af; font-size:11px;">
          Dërguar automatikisht nga formulari i kontaktit
        </p>
      </div>

    </div>
  </body>
</html>
`;