import { sendStatementEmail } from '../utils/mailer.js';

export const sendStatement = async (req, res) => {
  const { email, html, startDate, endDate } = req.body;

  if (!email || !html) {
    return res.status(400).json({ success: false, message: 'Email and HTML content are required' });
  }

  try {
    const result = await sendStatementEmail(email, html, startDate, endDate);
    return res.json({
      success: true,
      message: 'Statement email request sent successfully.',
      ...result
    });
  } catch (err) {
    console.error('Send Statement Controller Error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to dispatch email statement.'
    });
  }
};
export default { sendStatement };
