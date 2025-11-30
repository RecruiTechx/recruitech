import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInterviewEmail(
    to: string,
    candidateName: string,
    date: Date,
    meetLink: string
) {
    const formattedDate = date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });

    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('================ EMAIL MOCK (Missing RESEND_API_KEY) ================');
            console.log(`To: ${to}`);
            console.log(`Subject: Interview Invitation - RecruiTech`);
            console.log(`Meet Link: ${meetLink}`);
            console.log('=====================================================================');
            return { success: true, mock: true };
        }

        const normalizedLink = meetLink.startsWith('http')
            ? meetLink
            : `https://${meetLink}`;

        const { data, error } = await resend.emails.send({
            from: 'RecruiTech <onboarding@resend.dev>',
            to: [to],
            subject: 'Interview Invitation - RecruiTech',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #db2777;">Interview Invitation</h2>
          <p>Dear ${candidateName},</p>
          <p>We are pleased to invite you to an interview for your application at RecruiTech.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong></p>
            <p style="margin: 0 0 20px 0; font-size: 18px;">${formattedDate}</p>

            <p style="margin: 0 0 10px 0;"><strong>Meeting Link:</strong></p>
            
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td bgcolor="#db2777" style="border-radius: 5px;">
                  <a href="${normalizedLink}"
                    target="_blank"
                    style="padding: 10px 20px; font-weight: bold; font-size: 16px; color: #ffffff; text-decoration: none; display: inline-block;">
                    Join Google Meet
                  </a>
                </td>
              </tr>
            </table>
            
            <!-- fallback link (always clickable) -->
            <p style="margin-top: 14px;">
              Or open directly: 
              <a href="${normalizedLink}" target="_blank">${normalizedLink}</a>
            </p>
          </div>

          <p>Please make sure to join the meeting on time.</p>
          <p>Best regards,<br>The RecruiTech Team</p>
        </div>
      `,
        });

        if (error) {
            console.error('Error sending email with Resend:', error);
            return { success: false, error };
        }

        return { success: true, data };

    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
