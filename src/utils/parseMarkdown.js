export function parseMarkdown(text) {
  if (!text) return '';

  let html = text
    .replace(/^### (.+)$/gm, '<h3 class="ai-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="ai-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="ai-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="ai-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="ai-italic">$1</em>')
    .replace(/^[\*\-] (.+)$/gm, '<li class="ai-li">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ai-oli">$1</li>')
    .replace(/^---+$/gm, '<hr class="ai-hr">')
    .replace(/\n\n/g, '</p><p class="ai-p">')
    .replace(/\n/g, '<br/>');

  html = html.replace(
    /(<li class="ai-li">[\s\S]*?<\/li>)+/g,
    '<ul class="ai-ul">$&</ul>'
  );

  html = html.replace(
    /(<li class="ai-oli">[\s\S]*?<\/li>)+/g,
    '<ol class="ai-ol">$&</ol>'
  );

  return '<p class="ai-p">' + html + '</p>';
}
