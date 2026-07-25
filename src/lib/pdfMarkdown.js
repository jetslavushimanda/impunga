import { parseMarkdownLines } from './markdownRuns';

// Renders **bold**/*italic*/bullet markdown as real jsPDF formatting
// (font switching + manual word-wrap) instead of printing literal
// asterisk characters. Shared by Pitch Deck and Business Plan PDF export.
//
// Returns the yPos after the block, so callers can keep placing more
// content (section headers, tables, etc.) below it.
export function renderMarkdownBlock(doc, text, opts = {}) {
  const {
    startY,
    leftMargin = 20,
    rightEdge = 190,
    bulletIndent = 5,
    lineHeight = 5,
    pageBottom = 280,
    fontSize = 10,
    font = 'helvetica',
  } = opts;

  let yPos = startY;
  doc.setFontSize(fontSize);

  const ensureRoom = () => {
    if (yPos > pageBottom) {
      doc.addPage();
      yPos = 20;
    }
  };

  parseMarkdownLines(text).forEach(({ bullet, heading, runs }) => {
    const isBlank = runs.length === 1 && runs[0].text === '';
    if (isBlank) {
      yPos += lineHeight * 0.6;
      return;
    }

    ensureRoom();
    const indent = bullet ? leftMargin + bulletIndent : leftMargin;
    let xPos = indent;

    if (bullet) {
      doc.setFont(font, 'normal');
      doc.text('•', leftMargin, yPos);
    }
    if (heading) doc.setFontSize(fontSize + 2);

    runs.forEach(run => {
      doc.setFont(font, run.bold ? 'bold' : run.italic ? 'italic' : 'normal');
      const tokens = run.text.split(/(\s+)/);
      tokens.forEach(token => {
        if (token === '') return;
        const width = doc.getTextWidth(token);
        if (token.trim() !== '' && xPos + width > rightEdge) {
          yPos += lineHeight;
          ensureRoom();
          xPos = indent;
        }
        doc.text(token, xPos, yPos);
        xPos += width;
      });
    });

    if (heading) doc.setFontSize(fontSize);
    yPos += lineHeight;
  });

  return yPos;
}
