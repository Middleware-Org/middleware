export function getReadingTime(body: string, wordsPerMinute: number = 250): number {
  const wordCount = body.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
}

function removeHtmlTags(body: string): string {
  return body.replace(/<[^>]*>?/g, "");
}

export function getMinText(body: string, wordsPerMinute: number = 250): string {
  const plainText = removeHtmlTags(body);
  const minutes = getReadingTime(plainText, wordsPerMinute);
  return minutes > 1 ? `${minutes} minuti` : `${minutes} minuto`;
}

export function getExcerpt(str: string, maxLength: number = 100): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
