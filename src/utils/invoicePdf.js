import { jsPDF } from 'jspdf';

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const safeText = (value, fallback = '') => {
  const text = `${value || ''}`.trim();
  return text || fallback;
};

const getInitials = (name) => {
  const text = safeText(name, 'B');
  return text
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
};

const getImageFormat = (image) => {
  const match = /^data:image\/(png|jpe?g|webp);/i.exec(image || '');
  if (!match) return 'PNG';
  if (match[1].toLowerCase().startsWith('jp')) return 'JPEG';
  return match[1].toUpperCase();
};

const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 5) => {
  const lines = doc.splitTextToSize(safeText(text), maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN');
};

export const downloadInvoicePdf = (bill, settings = {}) => {
  if (!bill) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const businessName = safeText(settings.bakeryName || settings.businessName, 'Business Name');
  const businessPhone = safeText(settings.phone || settings.whatsappNumber);
  const businessAddress = safeText(settings.address);
  const businessEmail = safeText(settings.email);
  const businessWebsite = safeText(settings.website);
  const businessGst = safeText(settings.gst);
  const businessWhatsapp = safeText(settings.whatsappNumber);
  const footerMessage = safeText(settings.messageFooter, 'Thank you for your business.');
  const invoiceNumber = safeText(bill.billNumber, 'DRAFT');
  const invoiceDate = bill.createdAt ? new Date(bill.createdAt) : new Date();
  const gstRate = Number(bill.gstRate || 0);
  const taxLabel = safeText(bill.taxLabel, gstRate > 0 ? `GST (${gstRate}%)` : 'Tax');
  const subtotal = Number(bill.subtotal ?? bill.items?.reduce((sum, item) => sum + Number(item.total || 0), 0) ?? 0);
  const discount = Number(bill.discount || 0);
  const tax = Number(bill.tax || 0);
  const total = Number(bill.total ?? subtotal - discount + tax);
  const paidStatus = safeText(bill.status || bill.paymentStatus, 'Paid');

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 297, 'F');
  doc.setFillColor(34, 25, 17);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setFillColor(247, 242, 236);
  doc.rect(0, 40, pageWidth, 7, 'F');

  if (settings.logo) {
    try {
      doc.addImage(settings.logo, getImageFormat(settings.logo), margin, 9, 22, 22, undefined, 'FAST');
    } catch {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, 9, 22, 22, 3, 3, 'F');
      doc.setTextColor(34, 25, 17);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(getInitials(businessName), margin + 11, 22, { align: 'center' });
    }
  } else {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 9, 22, 22, 3, 3, 'F');
    doc.setTextColor(34, 25, 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(getInitials(businessName), margin + 11, 22, { align: 'center' });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text(businessName, margin + 28, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const businessLines = [
    businessAddress,
    businessPhone && `Phone: ${businessPhone}`,
    businessWhatsapp && businessWhatsapp !== businessPhone && `WhatsApp: ${businessWhatsapp}`,
    businessEmail && `Email: ${businessEmail}`,
    businessWebsite && `Website: ${businessWebsite}`,
    businessGst && `GSTIN: ${businessGst}`
  ].filter(Boolean);
  doc.text(businessLines.slice(0, 4), margin + 28, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('INVOICE', pageWidth - margin, 16, { align: 'right' });
  doc.setFontSize(9.5);
  doc.text(invoiceNumber, pageWidth - margin, 25, { align: 'right' });
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 26, 29, 26, 7, 2, 2, 'F');
  doc.setTextColor(34, 25, 17);
  doc.setFontSize(7.5);
  doc.text(paidStatus.toUpperCase(), pageWidth - margin - 13, 33.8, { align: 'center' });

  let y = 58;
  doc.setTextColor(34, 25, 17);
  doc.setDrawColor(232, 224, 216);
  doc.setFillColor(252, 250, 247);
  doc.roundedRect(margin, y - 8, 86, 42, 3, 3, 'FD');
  doc.roundedRect(pageWidth - margin - 72, y - 8, 72, 42, 3, 3, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin + 4, y);
  doc.text('INVOICE DETAILS', pageWidth - margin - 68, y);

  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(safeText(bill.customer?.name, 'Walk-in Customer'), margin + 4, y);
  doc.setFont('helvetica', 'normal');
  if (bill.customer?.phone) doc.text(`Phone: ${bill.customer.phone}`, margin + 4, y + 5);
  if (bill.customer?.email) doc.text(`Email: ${bill.customer.email}`, margin + 4, y + 10);
  if (bill.customer?.address) addWrappedText(doc, `Address: ${bill.customer.address}`, margin + 4, y + 15, 76, 4);
  const customerDates = [
    bill.customer?.birthday && `Birthday: ${formatDate(bill.customer.birthday)}`,
    bill.customer?.anniversary && `Anniversary: ${formatDate(bill.customer.anniversary)}`,
    bill.customer?.specialDay && `Special day: ${formatDate(bill.customer.specialDay)}`
  ].filter(Boolean);
  if (customerDates.length > 0) {
    doc.setFontSize(8);
    addWrappedText(doc, customerDates.join(' | '), margin + 4, y + 29, 76, 4);
    doc.setFontSize(9);
  }

  const detailsX = pageWidth - margin - 68;
  doc.text(`Date: ${invoiceDate.toLocaleDateString('en-IN')}`, detailsX, y);
  doc.text(`Time: ${invoiceDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, detailsX, y + 5);
  doc.text(`Payment: ${safeText(bill.paymentMethod, 'Cash')}`, detailsX, y + 10);
  doc.text(`Invoice No: ${invoiceNumber}`, detailsX, y + 15);
  if (businessGst) doc.text(`GSTIN: ${businessGst}`, detailsX, y + 20);

  y = 108;
  doc.setFillColor(34, 25, 17);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('S.No.', margin + 3, y + 6.5);
  doc.text('Description', margin + 18, y + 6.5);
  doc.text('Qty', pageWidth - 84, y + 6.5, { align: 'right' });
  doc.text('Rate', pageWidth - 54, y + 6.5, { align: 'right' });
  doc.text('Amount', pageWidth - margin - 3, y + 6.5, { align: 'right' });

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(34, 25, 17);
  (bill.items || []).forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 24;
    }
    if (index % 2 === 0) {
      doc.setFillColor(252, 250, 247);
      doc.rect(margin, y - 5, pageWidth - (margin * 2), 9, 'F');
    }
    doc.setDrawColor(232, 224, 216);
    doc.line(margin, y + 5, pageWidth - margin, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(index + 1), margin + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.text(safeText(item.name, 'Item'), margin + 18, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity || 0), pageWidth - 84, y, { align: 'right' });
    doc.text(money(item.price), pageWidth - 54, y, { align: 'right' });
    doc.text(money(item.total), pageWidth - margin - 3, y, { align: 'right' });
    y += 10;
  });

  y = Math.max(y + 10, 168);
  const totalsX = pageWidth - 82;
  const valueX = pageWidth - margin;
  const row = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, totalsX, y);
    doc.text(value, valueX, y, { align: 'right' });
    y += 7;
  };

  doc.setFillColor(252, 250, 247);
  doc.roundedRect(totalsX - 6, y - 9, valueX - totalsX + 6, tax > 0 ? 39 : 32, 3, 3, 'F');
  doc.setDrawColor(232, 224, 216);
  doc.roundedRect(totalsX - 6, y - 9, valueX - totalsX + 6, tax > 0 ? 39 : 32, 3, 3, 'S');
  row('Subtotal', money(subtotal));
  if (discount > 0) row('Discount', `- ${money(discount)}`);
  if (tax > 0) row(taxLabel, money(tax));
  doc.setFillColor(34, 25, 17);
  doc.roundedRect(totalsX - 3, y - 4.5, valueX - totalsX + 3, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', totalsX, y + 2);
  doc.text(money(total), valueX - 3, y + 2, { align: 'right' });
  doc.setTextColor(34, 25, 17);

  y += 20;
  if (bill.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, y);
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(doc, bill.notes, margin, y + 6, pageWidth - (margin * 2), 5);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 98, 88);
  doc.setDrawColor(232, 224, 216);
  doc.line(margin, 274, pageWidth - margin, 274);
  const footerLines = doc.splitTextToSize(footerMessage, pageWidth - (margin * 2));
  doc.text(footerLines.slice(0, 2), pageWidth / 2, 282, { align: 'center' });

  const fileName = `${invoiceNumber.replace(/[^\w-]+/g, '-')}.pdf`;
  doc.save(fileName);
};
