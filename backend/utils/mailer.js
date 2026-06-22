import axios from 'axios';

export const sendOTPEmail = async (email, otp) => {
  const webhookUrl = process.env.TABLESPRINT_OTP_WEBHOOK_URL;
  const isDev = process.env.DEVELOPMENT_MODE === 'true' || !webhookUrl;

  console.log(`\n==================================================`);
  console.log(`[OTP GENERATED] Email: ${email} | OTP: ${otp}`);
  console.log(`==================================================\n`);

  if (!webhookUrl || webhookUrl.includes('mock-webhook')) {
    console.warn('TABLESPRINT_OTP_WEBHOOK_URL is set to mock/empty. Falling back to console logging.');
    return { success: true, message: 'OTP logged to console (mock webhook)', otp };
  }

  try {
    console.log(`Triggering OTP webhook for ${email} to URL: ${webhookUrl}`);
    const response = await axios.post(
      webhookUrl,
      { email, otp },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    return { success: true, details: response.data, otp: isDev ? otp : undefined };
  } catch (error) {
    console.error(`Error sending OTP via Tablesprint webhook: ${error.message}`);
    if (isDev) {
      console.log('Continuing in development mode (fallback OTP printed above)');
      return { success: true, message: 'OTP logged to console (webhook failed)', otp, error: error.message };
    }
    throw error;
  }
};

export const sendStatementEmail = async (email, html, startDate, endDate) => {
  const webhookUrl = process.env.TABLESPRINT_STATEMENT_WEBHOOK_URL;
  const isDev = process.env.DEVELOPMENT_MODE === 'true' || !webhookUrl;

  if (!webhookUrl || webhookUrl.includes('mock-webhook')) {
    console.warn('TABLESPRINT_STATEMENT_WEBHOOK_URL is set to mock/empty. Falling back to console logging.');
    console.log(`[STATEMENT EMAIL MOCK] Email: ${email} | Start: ${startDate} | End: ${endDate} | HTML length: ${html ? html.length : 0}`);
    return { success: true, message: 'Statement logged to console (mock webhook)' };
  }

  try {
    console.log(`Triggering Statement webhook for ${email} to URL: ${webhookUrl}`);
    const response = await axios.post(
      webhookUrl,
      { email, html, startDate, endDate },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    return { success: true, details: response.data };
  } catch (error) {
    console.error(`Error sending Statement via Tablesprint webhook: ${error.message}`);
    if (isDev) {
      console.log('Continuing in development mode (fallback statement simulation)');
      return { success: true, message: 'Statement logged to console (webhook failed)', error: error.message };
    }
    throw error;
  }
};
export default { sendOTPEmail, sendStatementEmail };
