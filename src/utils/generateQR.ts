import QRCode from "qrcode";

/**
 * Generates a QR code as Base64 image
 * @param text URL or any text to encode
 */
export async function generateQR(text: string): Promise<string> {
  try {
    const qr = await QRCode.toDataURL(text, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "H",
    });
    return qr;
  } catch (error) {
    console.error("QR generation failed:", error);
    throw error;
  }
}
