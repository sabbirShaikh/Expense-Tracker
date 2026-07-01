import { sendSupportEmail } from '../utils/mailer.js';

export const handlePublicSupport = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const emailBody = `
      <h3>New Public Support Inquiry</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; background: #f4f4f5; padding: 15px; border-radius: 8px;">${message}</p>
    `;

    await sendSupportEmail({
      to: 'sksabbirali99@gmail.com',
      fromEmail: email,
      fromName: name,
      subject: `[Public Support] ${subject}`,
      htmlText: emailBody
    });

    return res.status(200).json({ message: 'Support request sent successfully!' });
  } catch (error) {
    console.error('Public support controller error:', error);
    return res.status(500).json({ error: 'Failed to process support request.' });
  }
};

export const handleUserSupport = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    const { Name, Email } = req.user; // populated by auth middleware

    if (!subject || !category || !priority || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const emailBody = `
      <h3>New Workspace User Support Ticket</h3>
      <p><strong>User Name:</strong> ${Name}</p>
      <p><strong>User Email:</strong> ${Email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; background: #f4f4f5; padding: 15px; border-radius: 8px;">${message}</p>
    `;

    await sendSupportEmail({
      to: 'sksabbirali99@gmail.com',
      fromEmail: Email,
      fromName: Name,
      subject: `[User Support Ticket] [${priority}] [${category}] ${subject}`,
      htmlText: emailBody
    });

    return res.status(200).json({ message: 'Support ticket submitted successfully!' });
  } catch (error) {
    console.error('User support controller error:', error);
    return res.status(500).json({ error: 'Failed to process support ticket.' });
  }
};
