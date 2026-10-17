import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PaymentRecord, Member, OrganizationSettings } from '../types';
import { formatDate, formatCurrency, amountToWordsEnglish } from './formatters';

export interface GeneratePdfOptions {
  receipt: PaymentRecord;
  member?: Member | null;
  settings: OrganizationSettings;
  remainingBalance?: number;
  elementId?: string;
}

export interface PdfGenerationResult {
  success: boolean;
  blobUrl?: string;
  fileName: string;
  error?: string;
}

/**
 * Generates a clean, vector-based PDF receipt guaranteeing all required fields are present
 * with zero blurriness and minimal file size.
 */
function generateVectorReceipt(doc: jsPDF, options: GeneratePdfOptions) {
  const { receipt, member, settings, remainingBalance = 0 } = options;

  // Page dimensions
  const pageWidth = 210;
  const leftMargin = 14;
  const rightMargin = pageWidth - 14;
  const contentWidth = rightMargin - leftMargin;

  // Background and Outer Border
  doc.setDrawColor(6, 78, 59); // Emerald 800
  doc.setLineWidth(0.8);
  doc.rect(leftMargin, 12, contentWidth, 270);
  doc.setLineWidth(0.2);
  doc.rect(leftMargin + 1.5, 13.5, contentWidth - 3, 267);

  // Top Header Banner
  doc.setFillColor(6, 78, 59);
  doc.rect(leftMargin + 2, 14, contentWidth - 4, 34, 'F');

  // Organization Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const orgName = settings.orgName || 'Anjuman Falah-o-Bahbood Chamhatti Khala Butt Karachi';
  doc.text(orgName.toUpperCase(), pageWidth / 2, 23, { align: 'center' });

  // Official Registration Number
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  const regNumber = settings.registrationNumber || 'Registered Number: K/2018 DSW(4347)';
  doc.text(regNumber, pageWidth / 2, 30, { align: 'center' });

  // Address & Contact
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const addressText = `${settings.address || 'Central Office Karachi, Sindh'} | Phone: ${settings.phone || '0300-1234567'}`;
  doc.text(addressText, pageWidth / 2, 36, { align: 'center' });

  // Subtitle / Voucher Type Badge
  let y = 54;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.roundedRect(leftMargin + 30, y - 5, contentWidth - 60, 8, 2, 2, 'FD');
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OFFICIAL PAYMENT RECEIPT / VOUCHER (رسید وصولی فیس)', pageWidth / 2, y, { align: 'center' });

  // Receipt Information Row
  y += 11;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.rect(leftMargin + 4, y, contentWidth - 8, 14, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT NO:', leftMargin + 8, y + 6);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('courier', 'bold');
  doc.text(receipt.receiptNumber, leftMargin + 36, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DATE:', pageWidth / 2 + 10, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(receipt.date), pageWidth / 2 + 25, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT MODE:', leftMargin + 8, y + 11);
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.paymentMethod.toUpperCase(), leftMargin + 40, y + 11);

  doc.setTextColor(100, 116, 139);
  doc.text('STATUS:', pageWidth / 2 + 10, y + 11);
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text('VERIFIED & RECEIVED', pageWidth / 2 + 28, y + 11);

  // Member Particulars Box
  y += 19;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(leftMargin + 4, y, contentWidth - 8, 6, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('MEMBER DETAILS (کوائف ممبر)', leftMargin + 8, y + 4.5);

  y += 6;
  doc.setFillColor(255, 255, 255);
  doc.rect(leftMargin + 4, y, contentWidth - 8, 22, 'FD');

  doc.setFontSize(8.5);
  // Column 1
  doc.setTextColor(100, 116, 139);
  doc.text('Member ID:', leftMargin + 8, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.text(receipt.memberId, leftMargin + 36, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Member Name:', leftMargin + 8, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.memberName, leftMargin + 36, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text("Father's Name:", leftMargin + 8, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(member?.fatherName || '-', leftMargin + 36, y + 18);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Mobile Contact:', pageWidth / 2 + 10, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(member?.mobile || '-', pageWidth / 2 + 40, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Received By:', pageWidth / 2 + 10, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(receipt.recordedBy || 'Administrator', pageWidth / 2 + 40, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Period Covered:', pageWidth / 2 + 10, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.relevantPeriod || (receipt.paymentCategory === 'annual_monthly' ? 'Multi-Year' : 'Current Period'), pageWidth / 2 + 40, y + 18);

  // Fee Allocations Table
  y += 27;
  doc.setFillColor(6, 78, 59);
  doc.rect(leftMargin + 4, y, contentWidth - 8, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', leftMargin + 8, y + 5);
  doc.text('FEE CATEGORY & DESCRIPTION', leftMargin + 18, y + 5);
  doc.text('PERIOD / ALLOCATION', pageWidth / 2 + 10, y + 5);
  doc.text('AMOUNT (PKR)', rightMargin - 8, y + 5, { align: 'right' });

  y += 7;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');

  if (receipt.paymentCategory === 'annual_monthly') {
    doc.setFillColor(255, 255, 255);
    doc.rect(leftMargin + 4, y, contentWidth - 8, 14, 'FD');
    doc.setFontSize(8.5);
    doc.text('1', leftMargin + 8, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text('Annual Monthly Fee (سالانہ ماہانہ فیس)', leftMargin + 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Period: ${receipt.relevantPeriod || 'Multi-Year'} (${receipt.allocations?.length || 0} Months Covered)`, leftMargin + 18, y + 11);
    doc.text(receipt.notes ? `Note: ${receipt.notes}` : 'Lump-sum multi-year monthly fee payment', pageWidth / 2 + 10, y + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`PKR ${receipt.amountReceived.toLocaleString()}`, rightMargin - 8, y + 8, { align: 'right' });
    y += 14;
  } else if (receipt.allocations && receipt.allocations.length > 0) {
    receipt.allocations.forEach((alloc, idx) => {
      const rowHeight = 9;
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(leftMargin + 4, y, contentWidth - 8, rowHeight, 'FD');
      doc.setFontSize(8.5);
      doc.text(`${idx + 1}`, leftMargin + 8, y + 6);
      doc.setFont('helvetica', 'bold');
      doc.text(alloc.title, leftMargin + 18, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(receipt.relevantPeriod || '-', pageWidth / 2 + 10, y + 6);
      doc.setFont('helvetica', 'bold');
      doc.text(`PKR ${alloc.amount.toLocaleString()}`, rightMargin - 8, y + 6, { align: 'right' });
      y += rowHeight;
    });
  } else {
    // Single general payment
    const rowHeight = 10;
    doc.setFillColor(255, 255, 255);
    doc.rect(leftMargin + 4, y, contentWidth - 8, rowHeight, 'FD');
    doc.setFontSize(8.5);
    doc.text('1', leftMargin + 8, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`Payment: ${receipt.paymentCategory.replace(/_/g, ' ').toUpperCase()}`, leftMargin + 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.relevantPeriod || '-', pageWidth / 2 + 10, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`PKR ${receipt.amountReceived.toLocaleString()}`, rightMargin - 8, y + 6, { align: 'right' });
    y += rowHeight;
  }

  // Total Summary Row
  doc.setFillColor(241, 245, 249);
  doc.rect(leftMargin + 4, y, contentWidth - 8, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL RECEIVED (کل وصول شدہ رقم):', leftMargin + 8, y + 6);
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(10.5);
  doc.text(`PKR ${receipt.amountReceived.toLocaleString()}`, rightMargin - 8, y + 6.5, { align: 'right' });

  // Amount In Words & Remaining Balance Box
  y += 13;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.rect(leftMargin + 4, y, contentWidth - 8, 16, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in Words:', leftMargin + 8, y + 6);
  doc.setFont('helvetica', 'italic');
  doc.text(amountToWordsEnglish(receipt.amountReceived), leftMargin + 38, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Remaining Member Balance:', leftMargin + 8, y + 12);
  doc.setFont('helvetica', 'bold');
  const balColor = remainingBalance > 0 ? [180, 83, 9] : [5, 150, 105];
  doc.setTextColor(balColor[0], balColor[1], balColor[2]);
  doc.text(formatCurrency(remainingBalance), leftMargin + 56, y + 12);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`(All dues as of ${formatDate(receipt.date)})`, leftMargin + 85, y + 12);

  // Notes Section if any
  if (receipt.notes) {
    y += 18;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(leftMargin + 4, y, contentWidth - 8, 9, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Notes / Remarks:', leftMargin + 8, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.notes, leftMargin + 38, y + 5.5);
  } else {
    y += 14;
  }

  // Official Signatures Section
  y += 24;
  const sigCol1X = leftMargin + 30;
  const sigCol2X = rightMargin - 30;

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(sigCol1X - 25, y, sigCol1X + 25, y);
  doc.line(sigCol2X - 25, y, sigCol2X + 25, y);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Treasurer / Finance Secretary', sigCol1X, y + 4.5, { align: 'center' });
  doc.text('General Secretary / President', sigCol2X, y + 4.5, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('(خزانچی - مہر و دستخط)', sigCol1X, y + 8.5, { align: 'center' });
  doc.text('(صدر / جنرل سیکرٹری - مجاز دستخط)', sigCol2X, y + 8.5, { align: 'center' });

  // Bottom Notice
  const bottomY = 276;
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Official computer-generated receipt issued by ${settings.orgName} (Reg. K/2018 DSW(4347)).`,
    pageWidth / 2,
    bottomY,
    { align: 'center' }
  );
}

/**
 * Downloads a payment receipt PDF.
 * Uses html2canvas for rich Urdu font fidelity when possible,
 * with instant fallback to vector jsPDF.
 * Implements Android Chrome compatibility and robust popup-blocker handling.
 */
export async function downloadReceiptPdf(options: GeneratePdfOptions): Promise<PdfGenerationResult> {
  const fileName = `Receipt_${options.receipt.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let renderedViaCanvas = false;
    const element = typeof document !== 'undefined' && options.elementId ? document.getElementById(options.elementId) : null;

    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        if (canvas && canvas.width > 0 && canvas.height > 0) {
          const imgData = canvas.toDataURL('image/png');
          const pageWidth = 210;
          const pageHeight = 297;
          const margin = 10;
          const maxImgWidth = pageWidth - margin * 2;
          const maxImgHeight = pageHeight - margin * 2;
          const imgHeight = (canvas.height * maxImgWidth) / canvas.width;
          const finalHeight = Math.min(imgHeight, maxImgHeight);

          doc.addImage(imgData, 'PNG', margin, margin, maxImgWidth, finalHeight);
          renderedViaCanvas = true;
        }
      } catch (canvasError) {
        console.warn('html2canvas capture skipped/failed, generating vector PDF:', canvasError);
      }
    }

    if (!renderedViaCanvas) {
      generateVectorReceipt(doc, options);
    }

    // Set PDF document metadata
    doc.setProperties({
      title: `Payment Receipt - ${options.receipt.receiptNumber}`,
      subject: `Official Receipt for ${options.receipt.memberName} - ${options.settings.registrationNumber || 'K/2018 DSW(4347)'}`,
      author: options.settings.orgName,
      keywords: 'Receipt, Payment, Anjuman, Chamhatti, Khala Butt, Karachi',
      creator: options.settings.orgName,
    });

    const pdfBlob = doc.output('blob');
    let blobUrl = '';
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      blobUrl = URL.createObjectURL(pdfBlob);
    }

    // Attempt direct browser download
    if (typeof document !== 'undefined' && blobUrl) {
      try {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 8000);
      } catch (clickErr) {
        console.warn('Standard download link click warning:', clickErr);
      }
    }

    return {
      success: true,
      blobUrl,
      fileName,
    };
  } catch (err: any) {
    console.error('downloadReceiptPdf critical failure:', err);
    return {
      success: false,
      fileName,
      error: err?.message || 'Failed to generate PDF document. Please try again.',
    };
  }
}
