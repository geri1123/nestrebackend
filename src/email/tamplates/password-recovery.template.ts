export function passwordRecoveryTemplate(name: string, resetLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2>Hello ${name},</h2>
      <p>You requested to reset your password. Please click the button below to set a new password:</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px; background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Thanks,<br/>The Real Estate Platform Team</p>
    </div>
  `;
}
