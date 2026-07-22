'use client';

// Client-side PDF export: rasterizes a DOM node and paginates it onto A4 pages.
// Runs entirely in the browser (no backend round-trip) so it works with mocked/local data.
export async function downloadElementAsPdf(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element || typeof window === 'undefined') return;

  // html2canvas-pro (not html2canvas) — the original library can't parse the
  // lab()/oklch() color functions Tailwind v4 emits and throws mid-render,
  // silently killing the export. The -pro fork adds modern CSS color support.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}
