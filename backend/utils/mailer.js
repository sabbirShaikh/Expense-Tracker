import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

// Helper to clean quotes if dotenv loads them literally
const cleanEnvVar = (val) => {
  if (!val) return val;
  let str = val.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
};

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const smtpHost = cleanEnvVar(process.env.SMTP_HOST);
  const smtpPort = cleanEnvVar(process.env.SMTP_PORT) || 587;
  const smtpUser = cleanEnvVar(process.env.SMTP_USER);
  const smtpPass = cleanEnvVar(process.env.SMTP_PASS);

  if (smtpHost && smtpUser && smtpPass) {
    try {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      console.log(`SMTP Mail Transporter successfully initialized for ${smtpHost}:${smtpPort}`);
    } catch (err) {
      console.error(`Failed to initialize SMTP transporter:`, err);
    }
  } else {
    console.warn('SMTP credentials are incomplete or missing. Mailer will fall back to logging to console.');
  }

  return transporter;
};

export const sendOTPEmail = async (email, otp) => {
  const isDev = process.env.DEVELOPMENT_MODE === 'true';
  const smtpFrom = cleanEnvVar(process.env.SMTP_FROM) || '"Expense Tracker Workspace" <no-reply@ledger.com>';

  console.log(`\n==================================================`);
  console.log(`[OTP GENERATED] Email: ${email} | OTP: ${otp}`);
  console.log(`==================================================\n`);

  const activeTransporter = getTransporter();

  if (activeTransporter) {
    try {
      console.log(`Attempting to send OTP email to ${email} via SMTP...`);
      const info = await activeTransporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'Your One-Time Password (OTP) - Expense Tracker',
        text: `Your Expense Tracker OTP is: ${otp}. It is valid for 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 500px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Expense Tracker</h2>
            <p>Use the following One-Time Password to securely log in to your ledger:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 12px; background: #f3f4f6; text-align: center; border-radius: 6px; margin: 20px 0; color: #111827;">
              ${otp}
            </div>
            <p style="font-size: 13px; color: #6b7280;">This OTP code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`OTP Email sent successfully! MessageID: ${info.messageId}`);
      return { success: true, otp: isDev ? otp : undefined };
    } catch (smtpError) {
      console.error(`SMTP Send Error details:`, smtpError);
      if (isDev) {
        console.warn('Continuing in development fallback mode since SMTP failed.');
        return { success: true, message: `SMTP failed: ${smtpError.message}`, otp };
      }
      throw smtpError;
    }
  } else {
    console.warn(`Transporter is not active. Logged OTP: ${otp}`);
  }

  return { success: true, message: 'SMTP not configured, OTP logged to console', otp };
};


export const sendStatementEmail = async (email, html, startDate, endDate) => {
  const isDev = process.env.DEVELOPMENT_MODE === 'true';
  const smtpFrom = cleanEnvVar(process.env.SMTP_FROM) || '"Expense Tracker Workspace" <no-reply@ledger.com>';

  const activeTransporter = getTransporter();

  if (activeTransporter) {
    let browser = null;
    try {
      console.log(`Generating PDF statement via Puppeteer...`);
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.emulateMediaType('screen');
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
      });
      await browser.close();
      browser = null;

      console.log(`Attempting to send Statement email to ${email} via SMTP...`);

      const emailBodyHTML = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"/></head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #f3f4f6;">
                  <tr>
                    <td style="background:#4f46e5;padding:32px 40px;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:-0.5px;">💰 Expense Tracker</h1>
                      <p style="margin:4px 0 0;color:#c7d2fe;font-size:12px;">Financial Statement Dispatcher</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px; color:#374151; font-size:14px; line-height:1.6;">
                      <p style="margin:0; font-size:16px; font-weight:600; color:#111827;">Hello,</p>
                      <p style="margin:12px 0 0;">
                        Your requested ledger statement for the period <strong>${startDate}</strong> to <strong>${endDate}</strong> has been successfully compiled.
                      </p>
                      <p style="margin:12px 0 0;">
                        Please find your detailed statement report in the attached PDF file.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
                      <p style="margin:0;font-size:11px;color:#9ca3af;">
                        This is an automated system message. Please do not reply directly to this email.<br/>
                        &copy; Ledger Workspace Finance Tracker
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

      const info = await activeTransporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: `Your Expense Ledger Statement (${startDate} to ${endDate})`,
        text: `Your requested ledger statement for the period ${startDate} to ${endDate} is attached in this email.`,
        html: emailBodyHTML,
        attachments: [
          {
            filename: `statement-${startDate}-to-${endDate}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log(`Statement Email sent successfully! MessageID: ${info.messageId}`);
      return { success: true };
    } catch (smtpError) {
      if (browser) {
        await browser.close();
      }
      console.error(`SMTP Statement Send Error details:`, smtpError);
      if (isDev) {
        return { success: true, message: `SMTP failed: ${smtpError.message}` };
      }
      throw smtpError;
    }
  }

  console.warn('SMTP is not configured. Statement email was not dispatched.');
  return { success: true, message: 'SMTP not configured, statement logged to console' };
};

export const sendSupportEmail = async ({ to, fromEmail, fromName, subject, htmlText }) => {
  const activeTransporter = getTransporter();
  const smtpFrom = cleanEnvVar(process.env.SMTP_FROM) || '"Expense Tracker Workspace" <no-reply@ledger.com>';

  if (activeTransporter) {
    try {
      const info = await activeTransporter.sendMail({
        from: smtpFrom,
        to: to,
        replyTo: `"${fromName}" <${fromEmail}>`,
        subject: subject,
        html: htmlText,
      });
      console.log(`Support Email sent successfully! MessageID: ${info.messageId}`);
      return { success: true };
    } catch (smtpError) {
      console.error(`SMTP Support Send Error details:`, smtpError);
      throw smtpError;
    }
  }

  console.warn(`SMTP is not configured. Support email log:\nTo: ${to}\nFrom: ${fromName} <${fromEmail}>\nSubject: ${subject}\nBody:\n${htmlText}`);
  return { success: true, message: 'SMTP not configured, support email logged to console' };
};

export default { sendOTPEmail, sendStatementEmail, sendSupportEmail };

