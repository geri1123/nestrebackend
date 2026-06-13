export const agencyOutreachTemplate = (agencyName: string) => `
<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bashkohuni me PronaSmart</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- HEADER -->
<tr>
  <td style="background:linear-gradient(135deg,#1a3c5e 0%,#2563eb 100%);padding:40px 48px;text-align:center;">
    <img src="https://pronasmart.onrender.com/logo.png" alt="PronaSmart" width="160" style="display:block;margin:0 auto 12px;" />
    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
      PronaSmart
    </h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">
      Platforma kryesore e pasurive të paluajtshme në Shqipëri
    </p>
  </td>
</tr>

          <!-- BODY -->
          <tr>
            <td style="padding:48px 48px 32px;">
              <p style="margin:0 0 12px;color:#374151;font-size:16px;">Përshëndetje <strong>${agencyName}</strong>,</p>

              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
                Jemi <strong>PronaSmart</strong> — platforma dixhitale e pasurive të paluajtshme që po ndryshon mënyrën
                si blihen, shiten dhe jepen me qira prona në Shqipëri.
              </p>

              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
                Do të donim t'ju ftojmë të bashkoheni si agjenci partnere dhe të përfitoni:
              </p>

              <!-- BENEFITS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:12px 16px;background:#f0f7ff;border-radius:8px;margin-bottom:8px;display:block;">
                    <span style="color:#2563eb;font-size:18px;">✅</span>
                    <strong style="color:#1e3a5f;font-size:14px;"> Listoni pronat tuaja</strong>
                    <p style="margin:4px 0 0 26px;color:#4b5563;font-size:13px;">
                      Publikoni apartamente, vila, tokë dhe lokale tregëtare pa kufizim.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f0fdf4;border-radius:8px;">
                    <span style="color:#16a34a;font-size:18px;">📊</span>
                    <strong style="color:#1e3a5f;font-size:14px;"> Panel i dedikuar për agjenci</strong>
                    <p style="margin:4px 0 0 26px;color:#4b5563;font-size:13px;">
                      Menaxhoni agjentët tuaj, shikoni statistikat e klikimeve dhe menaxhoni gjithçka nga një vend.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#fefce8;border-radius:8px;">
                    <span style="color:#ca8a04;font-size:18px;">🔍</span>
                    <strong style="color:#1e3a5f;font-size:14px;"> Dukshmëri e lartë në kërkim</strong>
                    <p style="margin:4px 0 0 26px;color:#4b5563;font-size:13px;">
                      Profilet e agjencive shfaqen direkt në rezultatet e kërkimit — klientët gjejnë ju, jo konkurrentin.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#fdf4ff;border-radius:8px;">
                    <span style="color:#9333ea;font-size:18px;">💬</span>
                    <strong style="color:#1e3a5f;font-size:14px;"> Kontakt direkt me klientët</strong>
                    <p style="margin:4px 0 0 26px;color:#4b5563;font-size:13px;">
                      Merrni kërkesa dhe mesazhe direkt nga blerësit dhe qiramarrësit e interesuar.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#fff1f2;border-radius:8px;">
                    <span style="color:#e11d48;font-size:18px;">⭐</span>
                    <strong style="color:#1e3a5f;font-size:14px;"> Vlerësime dhe reputacion</strong>
                    <p style="margin:4px 0 0 26px;color:#4b5563;font-size:13px;">
                      Ndërtoni besueshmërinë e agjencisë suaj përmes vlerësimeve nga klientët e kënaqur.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="https://pronasmart.com/signup"
                       style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(37,99,235,0.35);">
                      🚀 Regjistrohuni Falas Tani
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
                Regjistrimi është <strong>falas</strong> dhe i shpejtë. Nëse keni pyetje ose dëshironi
                një demonstrim të platformës, mos hezitoni të na kontaktoni duke i'u përgjigjur këtij emaili.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 48px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} PronaSmart · Tiranë, Shqipëri
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                Nëse nuk dëshironi të merrni email nga ne, thjesht mos i'u përgjigjni këtij mesazhi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;