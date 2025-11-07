export const welcomeEmailTemplate = (name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Welcome to Real Estate Platform, ${name}!</h2>
    <p>Your account has been successfully verified and you can now login.</p>
    <p>Thank you for joining our platform!</p>
  </div>
`;

export const AgentWellcomeEmailTemplate = (name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Welcome to Real Estate Platform, ${name}!</h2>
    <p>Your Request has been successfully approved by Agency owner and you can now login.</p>
    <p>Thank you for joining our platform!</p>
  </div>
`;

export const pendingApprovalEmailTemplate = (name: string) => `
  <h2>Hello ${name}!</h2>
  <p>Your registration has been submitted and is pending approval.</p>
  <p>We will review your application and notify you once it's approved.</p>
`;
