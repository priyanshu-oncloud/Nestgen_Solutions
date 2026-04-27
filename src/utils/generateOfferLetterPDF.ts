import jsPDF from "jspdf";
import offerBg from "@/assets/Offer.png";

export const generateOfferLetterPDF = async (data: {
  name: string;
  position: string;
  startDate: string;
  endDate: string;
  stipendText: string;
  issueDate: string;
}) => {
  const pdf = new jsPDF("portrait", "px", [794, 1123]);

  /* ---------- BACKGROUND ---------- */
  pdf.addImage(offerBg, "PNG", 0, 0, 794, 1123);

  /* ---------- DATE (TOP RIGHT) ---------- */
  pdf.setFont("times", "bold");
  pdf.setFontSize(35);
  pdf.setTextColor(1, 37, 84);
  pdf.text(formatDate(data.issueDate), 505, 130);

  /* ---------- NAME ---------- */
  pdf.setFont("times", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(1, 37, 84);
  pdf.text(`Dear ${data.name},`, 94, 360);

  /* ---------- BODY TEXT ---------- */
  pdf.setFont("times", "normal");
  pdf.setFontSize(25);
  pdf.setTextColor(1, 37, 84);

  const bodyText = `
  We are pleased to inform you that based on your initial interaction and interest in the Nestgen Solutions Internship Program, you have been shortlisted to proceed further. This letter serves as a formal Offer of Internship for the ${data.position} position at Nestgen Solutions.
  `;

  pdf.text(bodyText.trim(), 94, 426, {
    maxWidth: 634,
    lineHeightFactor: 1.3,
  });

  /* ---------- INTERNSHIP DETAILS ---------- */
  pdf.setFont("times", "normal");
  pdf.setFontSize(25);
  pdf.setTextColor(1, 37, 84);

  const details = [
    `•  Position: ${data.position}`,
    `•  Location: Remote`,
    `•  Duration: ${getDuration(data.startDate, data.endDate)} (starting from ${formatDate(data.startDate)})`,
    `•  Stipend: ${data.stipendText}`,
  ];

  let y = 555;
  details.forEach((line) => {
    pdf.text(line, 103, y);
    y += 25;
  });


  return pdf;
};

/* ---------- HELPERS ---------- */

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getDuration = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);

  const months =
    (e.getFullYear() - s.getFullYear()) * 12 +
    (e.getMonth() - s.getMonth());

  return `${months || 1} Month${months > 1 ? "s" : ""}`;
};