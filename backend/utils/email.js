const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Check if SMTP environment variables are defined
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback: Generate Ethereal test SMTP account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error('Failed to create Ethereal test email account:', err);
      throw new Error('Email service could not be initialized.');
    }
  }

  const mailOptions = {
    from: `"MediBridge Security" <${process.env.EMAIL_USER || 'no-reply@medibridge.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  // If using Ethereal fallback, log the test mail URL to console
  if (!process.env.EMAIL_USER) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\n==================================================');
    console.log('✉️  Ethereal Test Email Sent!');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('OTP Code:', options.otpText || 'N/A');
    console.log('👉 View inbox preview at:', previewUrl);
    console.log('==================================================\n');
  }

  return info;
};

module.exports = sendEmail;
