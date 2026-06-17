/**
 * Strip markdown formatting from AI-generated text for clean PDF output.
 * Removes **bold**, *italic*, # headings, - bullets, and normalizes whitespace.
 */
export function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')        // *italic* → italic
    .replace(/^#{1,6}\s*/gm, '')        // # heading → heading
    .replace(/^[-•]\s*/gm, '• ')        // normalize bullets
    .replace(/`([^`]+)`/g, '$1')        // `code` → code
    .replace(/\n{3,}/g, '\n\n')         // collapse extra newlines
    .trim();
}
