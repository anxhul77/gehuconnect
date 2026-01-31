export default function truncateText(text:string,maxLength: number = 180){
    const length =text.length;
    if (!text) return { text: "", truncated: false };

  if (text.length <= maxLength) {
    return { text, truncated: false };
  }

  return {
    text: text.slice(0, maxLength).trimEnd() + "…",
    truncated: true,
  };

}