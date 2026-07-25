// Tokenizes AI-generated markdown into structured lines + inline runs,
// so PDF/PPTX export can render real bold/italic and bullets instead of
// printing literal ** and * characters.

const BULLET_RE = /^[-*•]\s+(.*)$/;
const HEADING_RE = /^#{1,6}\s+(.*)$/;
const INLINE_RE = /\*\*(.+?)\*\*|\*(.+?)\*/g;

export function parseMarkdownLines(text) {
  if (!text) return [];
  return text.split('\n').map(rawLine => {
    let line = rawLine.trimEnd();
    let bullet = false;
    let heading = false;

    const bulletMatch = line.match(BULLET_RE);
    if (bulletMatch) {
      bullet = true;
      line = bulletMatch[1];
    } else {
      const headingMatch = line.match(HEADING_RE);
      if (headingMatch) {
        heading = true;
        line = headingMatch[1];
      }
    }

    return { bullet, heading, runs: tokenizeInline(line) };
  });
}

function tokenizeInline(line) {
  const runs = [];
  let lastIndex = 0;
  let match;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(line)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: line.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      runs.push({ text: match[1], bold: true });
    } else {
      runs.push({ text: match[2], italic: true });
    }
    lastIndex = INLINE_RE.lastIndex;
  }
  if (lastIndex < line.length) {
    runs.push({ text: line.slice(lastIndex) });
  }
  if (runs.length === 0) runs.push({ text: '' });
  return runs;
}
