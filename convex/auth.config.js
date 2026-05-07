export default {
  providers: [
    {
      // Replace with your Clerk Frontend API URL (found in Clerk dashboard → API Keys)
      // Format: https://<your-clerk-subdomain>.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
