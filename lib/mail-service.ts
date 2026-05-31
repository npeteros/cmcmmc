import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY as string,
});

const FROM_EMAIL = new Sender(
  "cm.catholicmassmediacongress@gmail.com",
  "Cebu Metropolitan Catholic Mass Media Congress",
);

const SUBJECT =
  "[CMCMMC] Initial Registration Confirmation";

const buildHtmlEmail = (name: string) => {
  return `
    <p>Dear ${name},</p>

    <p>We are glad to inform you that you are an official participant to the 2nd Cebu Metropolitan Catholic Mass Media Congress.</p>

    <p>Here are the initial event details:</p>
    <ul>
      <li><strong>Dates:</strong> October 3-4, 2026.</li>
      <li><strong>Time:</strong> October 3 - 7:00 AM - 9:30 PM<br/>October 4 - 7:30 AM - 12:00 NN</li>
      <li><strong>Venue:</strong> Recoletos Coliseum (USJ-R - Basak Campus)</li>
    </ul>

    <p>We have attached a copy of the receipt of your payment.</p>

    <p>Keep posted for the Congress through the Archdiocese's official social media accounts.</p>

    <p>Don't forget to like, follow, and subscribe to @sugboanongsimbahan on Facebook, Instagram, X, YouTube, and Tiktok. Visit the Archdiocese's official website: thearchdioceseofcebu.com.</p>
    `
};

export const sendEmail = async (
  sentTo: Recipient[],
) => {
  const emailParams = new EmailParams()
    .setFrom(FROM_EMAIL)
    .setTo(sentTo)
    .setReplyTo(FROM_EMAIL)
    .setSubject(SUBJECT)
    .setHtml(buildHtmlEmail(sentTo[0].name || sentTo[0].email));

  await mailerSend.email.send(emailParams);
};
