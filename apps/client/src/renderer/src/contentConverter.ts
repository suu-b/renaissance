// Convert plain text to editor format
export function convertTextToEditorFormat(text: string): Array<{ type: string; children: Array<{ text: string }> }> {
  const paragraphs = text.split('\n\n')
  return paragraphs.map(para => ({
    type: "paragraph",
    children: [{ text: para }]
  }))
}
