const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

exports.sendCareerConfirmation = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        email,
        name,
        phone,
        position,
        experience,
        message,
        resumeName,
        resumeUrl,
        submittedAt,
      } = req.body;

      // Basic validation
      if (!email || !name || !position) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      /* ---------------- MAIL TRANSPORT ---------------- */
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "nestgensolutions@gmail.com",
          pass: "ivfxdgmgcplmfuww", // Gmail App Password (no spaces)
        },
      });

      /* ---------------- 1️⃣ APPLICANT EMAIL ---------------- */
      const applicantMail = {
        from: "Nestgen Solutions Careers <hr@nestgensolutions.com>",
        to: email,
        subject: "Internship Application Received & Join Official Group - Nestgen Solutions",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333;">
            <p>Dear ${name},</p>

            <p>
              Thank you for applying for the <strong>${position}</strong> position with
              <strong>Nestgen Solutions</strong> – Software · Security · Innovation.
            </p>

            <p>
              We are pleased to confirm that your application has been
              <strong>successfully received</strong> and is currently under review by our
              recruitment team.
            </p>

            <p>
              📢 <strong>Stay Connected:</strong><br/>
              To receive updates regarding the internship process, announcements, and guidance,
              you can join our official WhatsApp group below:
            </p>

            <p>
              👉 <a href="https://chat.whatsapp.com/GAcNf6PcVCMLiGP0FDJN1V"
              style="color:#25D366; font-weight:bold;">
              Join Nestgen Internship WhatsApp Group
              </a>
            </p>

            <p>
              At <strong>Nestgen Solutions</strong>, we are committed to nurturing young
              professionals and supporting their growth in the fields of
              <strong>Software Development, Cybersecurity, and Digital Innovation</strong>.
            </p>

            <p>
              We sincerely appreciate your interest in joining Nestgen Solutions and look
              forward to the possibility of working with you.
            </p>

            <br />

            <p>
              Best regards,<br />
              <strong>Recruitment Team</strong><br />
              Nestgen Solutions<br />
              hr@nestgensolutions.com
            </p>
          </div>
        `,
      };

      /* ---------------- 2️⃣ HR INTERNAL EMAIL ---------------- */
      const hrMail = {
        from: "Careers Portal <nestgensolutions@gmail.com>",
        to: "hr@nestgensolutions.com",
        subject: `New Internship Application Received – ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333;">
            <h2>New Career Application Received</h2>

            <p>
              A new application has been submitted through the Careers Portal.
              Please find the applicant details below:
            </p>

            <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                <td><strong>Name:</strong></td>
                <td>${name}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>${email}</td>
              </tr>
              <tr>
                <td><strong>Phone:</strong></td>
                <td>${phone}</td>
              </tr>
              <tr>
                <td><strong>Position:</strong></td>
                <td>${position}</td>
              </tr>
              <tr>
                <td><strong>Experience:</strong></td>
                <td>${experience}</td>
              </tr>
              <tr>
                <td><strong>Message:</strong></td>
                <td>${message}</td>
              </tr>
              <tr>
                <td><strong>Resume:</strong></td>
                <td>
                  Resume: ${resumeName} (Available in Admin Panel)
                </td>
              </tr>
            </table>

            <br />

            <p>
              Please log in to the admin panel to review the full application
              and proceed with the recruitment process.
            </p>

            <p>
              Regards,<br />
              Nestgen Solutions
            </p>
          </div>
        `,
      };

      /* ---------------- SEND EMAILS ---------------- */
      await transporter.sendMail(applicantMail);
      await transporter.sendMail(hrMail);

      return res.status(200).json({
        message: "Applicant and HR emails sent successfully",
      });
    } catch (error) {
      console.error("Email error:", error);
      return res.status(500).json({
        message: "Email sending failed",
      });
    }
  });
});
