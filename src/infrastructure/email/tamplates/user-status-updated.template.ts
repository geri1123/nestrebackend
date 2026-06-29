export function userStatusChangedTemplate(
  name: string,
  status: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2>Hello ${name},</h2>

      <p>
        Your account status has been updated on our platform.
      </p>

      <p>
        <strong>New Status:</strong>
        <span style="padding:4px 10px; border-radius:5px; background:#f3f4f6; display:inline-block;">
          ${status}
        </span>
      </p>

      ${
        status === 'rejected'
          ? `<p>If you believe this is a mistake, please contact us for more information.</p>`
          : `<p>If you have any questions, feel free to contact our support team.</p>`
      }

      <hr />

      <p>
        For any assistance, please contact our platform support team.
      </p>

      <p>
        Thanks,<br/>
        The PronaSmart Team
      </p>
    </div>
  `;
}