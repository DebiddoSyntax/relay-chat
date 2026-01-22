export function formatAIReply(text: string) {
  // Convert Markdown-style headings to <h3>
  let formatted = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  // Convert bold markers **text** to <strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert italic markers *text* to <em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert bullet points starting with '* ' into <ul><li>
  // First, wrap all bullets in <ul>
  formatted = formatted.replace(/(?:\n)?(\* .+(?:\n\* .+)*)/g, (match) => {
    const items = match.trim().split('\n').map(line => `<li>${line.replace(/^\* /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Wrap paragraphs (lines separated by 2+ newlines) in <p>
  formatted = formatted.replace(/(?:\n\s*\n)+/g, '</p><p>');
  formatted = '<p>' + formatted + '</p>';

  return formatted;
}