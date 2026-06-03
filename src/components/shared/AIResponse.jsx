import { parseMarkdown } from '../../utils/parseMarkdown';

export default function AIResponse({ content, className = '' }) {
  if (!content) return null;

  return (
    <div
      className={`ai-response-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}
