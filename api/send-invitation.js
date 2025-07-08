const { Resend } = require('resend');

// This function is the secure backend helper.
// It will run on Vercel's servers, not in the user's browser.
export default async function handler(req, res) {
  // 1. Check for the correct request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get the data from the request sent by the main app
  const { to, clinicName, role } = req.body;

  // 3. Get the secret API key from Vercel's environment variables
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // 4. Tell Resend to send the email
    const { data, error } = await resend.emails.send({
      from: 'TherapySaaS <onboarding@resend.dev>', // This is a required field by Resend
      to: [to],
      subject: `You're invited to join ${clinicName} on TherapySaaS`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2>You've Been Invited!</h2>
          <p>You have been invited to join <strong>${clinicName}</strong> on the TherapySaaS platform as a <strong>${role}</strong>.</p>
          <p>To accept your invitation, please sign up with this email address at the following link:</p>
          <a 
            href="https://therapysaas01.vercel.app" 
            style="display: inline-block; margin: 10px 0; padding: 12px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 8px;"
          >
            Accept Invitation & Create Account
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">If you were not expecting this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      return res.status(400).json(error);
    }

    // 5. Send a success response back to the main app
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
