import jsPDF from "jspdf";
import certificateBg from "@/assets/Certificate.png";

export const generateCertificatePDF = async (
  data: {
    name: string;
    role: string;
    certificateNo: string;
    startDate: string;
    endDate: string;
    duration: string;
    issueDate: string;
  },
  qrBase64: string // 👈 QR image (base64)
) => {
  const pdf = new jsPDF("landscape", "px", [1123, 794]);

  /* ---------- BACKGROUND ---------- */
  pdf.addImage(certificateBg, "JPG", 0, 0, 1123, 794);

  /* ---------- NAME ---------- */
  pdf.setFont("times", "bold");
  pdf.setFontSize(45);
  pdf.setTextColor(25, 60, 89);
  pdf.text(data.name.toUpperCase(), 560, 370, { align: "center" });

  /* ---------- ROLE ---------- */
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(40);
  pdf.text(data.role.toUpperCase(), 560, 455, { align: "center" });

  /* ---------- CERTIFICATE NO ---------- */
  pdf.setFontSize(30);
  pdf.text(data.certificateNo, 800, 528);

  const textWidth = pdf.getTextWidth(data.certificateNo);
  pdf.line(800, 532, 800 + textWidth, 532);

  /* ---------- DATE RANGE ---------- */
  pdf.setFontSize(25);
  pdf.text(
    `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`,
    305,
    640,
    { align: "center" }
  );

  /* ---------- DURATION ---------- */
  pdf.setFont("times", "bold");
  pdf.text(data.duration, 305, 665, { align: "center" });

  /* ---------- ISSUE DATE ---------- */
  pdf.setFont("times", "normal");
  pdf.setFontSize(14);
  pdf.text(`Issued On: ${formatDate(data.issueDate)}`, 560, 620, {
    align: "center",
  });

  /* ---------- QR CODE (VERIFY) ---------- */
  if (qrBase64) {
    pdf.addImage(qrBase64, "PNG", 925, 540, 50, 50);
  }

  return pdf;
};

/* ---------- HELPER ---------- */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
