import nodemailer from "nodemailer";

export async function sendRegistrationConfirmationEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const recepientName = typeof name === "string" ? name.trim() : "";
  const recepientEmail = typeof email === "string" ? email.trim() : "";

  if (!recepientName || !recepientEmail) {
    return {
      success: false,
      message: "Please provide both your name and email.",
    };
  }

  const username = process.env.GMAIL_USERNAME;
  const password = process.env.GMAIL_PASSWORD;

  if (!username || !password) {
    console.error("Missing Gmail credentials.");
    return {
      success: false,
      message: "Email service is not configured.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: username,
      pass: password,
    },
  });

  try {
    // verify connection configuration to catch auth/network issues early
    await transporter.verify();

    const textBody = `Dear ${recepientName},\n\nThank you for signing up for the 2nd Cebu Metropolitan Catholic Mass Media Congress.\n\nOur team is currently reviewing the information you provided in the registration form. We will send you an update on the status of your registration within the next two (2) weeks.\n\nFor clarifications in the future, you can send an email to cm.catholicmassmediacongress@gmail.com.\n\nDon't forget to like, follow, and subscribe to the official social media accounts of the Archdiocese of Cebu, @sugboanongsimbahan, on Facebook, Instagram, X, YouTube, and Tiktok. Visit the Archdiocese's official website: thearchdioceseofcebu.com.\n\nThank you and God bless!`;

    await transporter.sendMail({
      from: `no-reply <${username}>`,
      to: recepientEmail,
      subject: `[CMCMMC] Initial Registration Confirmation`,
      text: textBody,
      html: `Dear ${recepientName},<br><br>

Thank you for signing up for the 2nd Cebu Metropolitan Catholic Mass Media Congress.<br><br>

Our team is currently reviewing the information you provided in the registration form. We will send you an update on the status of your registration within the next two (2) weeks.<br><br>

For clarifications in the future, you can send an email to cm.catholicmassmediacongress@gmail.com.<br><br>

Don't forget to like, follow, and subscribe to the official social media accounts of the Archdiocese of Cebu, @sugboanongsimbahan, on Facebook, Instagram, X, YouTube, and Tiktok. Visit the Archdiocese's official website: thearchdioceseofcebu.com.<br><br>

Thank you and God bless!`,
      replyTo: username,
      envelope: { from: username, to: recepientEmail },
      headers: {
        "List-Unsubscribe": `<mailto:${username}?subject=unsubscribe>`,
        "X-Priority": "3",
      },
    });
    return {
      success: true,
      message:
        "Email sent successfully! If you don't receive it within the next hour, please check your spam folder.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to send email." };
  }
}

export async function sendContactUsEmail(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  const senderName = typeof name === "string" ? name.trim() : "";
  const senderEmail = typeof email === "string" ? email.trim() : "";
  const senderMessage = typeof message === "string" ? message.trim() : "";

  if (!senderName || !senderEmail || !senderMessage) {
    return {
      success: false,
      message: "Please complete all contact form fields.",
    };
  }

  const username = process.env.GMAIL_USERNAME;
  const password = process.env.GMAIL_PASSWORD;

  if (!username || !password) {
    console.error("Missing Gmail credentials.");
    return {
      success: false,
      message: "Email service is not configured.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: username,
      pass: password,
    },
  });

  try {
    await transporter.verify();

    const contactText = `Name: ${senderName}\nEmail: ${senderEmail}\n\n${senderMessage}`;

    await transporter.sendMail({
      from: `no-reply <${username}>`,
      to: username,
      subject: `New message from ${senderName}`,
      text: contactText,
      html: contactText.replace(/\n/g, "<br>"),
      replyTo: senderEmail,
      envelope: { from: username, to: username },
    });
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to send email." };
  }
}
