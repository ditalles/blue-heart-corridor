/**
 * Generate a QR code image URL using the free api.qrserver.com service.
 */
export function getQRCodeUrl(data: string, size = 300): string {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
}
