# Updating Supabase Email Template for Verification Codes

Follow these steps to update your email template for verification codes in the Supabase dashboard:

1. Log into your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** in the left sidebar
4. Click on **Email Templates**
5. Select the **Signup** template
6. Update the template with the following content:

```
Thank you for signing up for [Your App Name]!

To complete your registration, please enter the following verification code in the app:

{{ .Token }}

This code will expire in 24 hours.

If you did not sign up for this account, please ignore this email.
```

7. Replace `[Your App Name]` with your actual app name
8. Click **Save**

This email template will now send verification codes instead of links when users sign up for your app. 