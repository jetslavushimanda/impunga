/**
 * Strip markdown formatting from AI-generated text for clean PDF output.
 * Removes **bold**, *italic*, # headings, - bullets, and normalizes whitespace.
 */
export function stripMarkdown(text) {
  if (!text) return '';
  return text
    // Bullet/heading markers must be normalized BEFORE the bold/italic
    // passes below — a leading "* " bullet is otherwise indistinguishable
    // from an opening italic "*", so the italic regex pairs it with the
    // next "*" on the line (e.g. an inline *emphasis*) instead, eating
    // the bullet and leaving a stray trailing asterisk behind.
    .replace(/^#{1,6}\s*/gm, '')        // # heading → heading
    .replace(/^[-*•]\s*/gm, '• ')       // normalize bullets (incl. asterisk bullets)
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')        // *italic* → italic
    .replace(/`([^`]+)`/g, '$1')        // `code` → code
    .replace(/\n{3,}/g, '\n\n')         // collapse extra newlines
    .trim();
}
