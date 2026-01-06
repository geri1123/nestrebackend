## EmailModule / EmailService

Purpose:
- Provide centralized email sending across the platform
- Use Nodemailer with a configured SMTP provider
- Send system emails (verification, welcome, approvals, password reset, etc.)

Provider:
- `EMAIL_TRANSPORTER` (Nodemailer Transporter instance)
- Validated on startup via transporter.verify()
- Logs "Email transporter ready" when configured

Configuration:
- Loaded from AppConfigService
- Requires:
  - EMAIL_SERVICE
  - EMAIL_USER
  - EMAIL_PASS

Sending:
- Emails are sent using HTML templates
- From address: Real Estate Platform <emailUser>
- All operations logged via Nest Logger
- Failures return false (not thrown)

Templates used for:
- Account verification
- Welcome email
- Pending approval notice
- Password change notification
- Agent approval
- Agent rejection
- Password recovery

Security:
- Credentials must NOT be exposed to frontend
- SMTP credentials stored in environment
- Token validation required before sending verification/reset links

Design:
- Global NestJS module
- EmailService is injectable anywhere
- Private sendEmail() handles base logic

Why:
- Standardized email format
- Centralized SMTP config
- Strong logging & reliability
- Supports localization-aware links