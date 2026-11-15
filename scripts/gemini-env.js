export function updateGeminiEnv(content, apiKey, model) {
  if (!/^[A-Za-z0-9_.-]{10,512}$/.test(apiKey)) throw Error('API key không hợp lệ. Dán lại key đầy đủ từ Google AI Studio.');
  if (!/^gemini-[A-Za-z0-9.-]{1,90}$/.test(model)) throw Error('Tên mô hình Gemini không hợp lệ.');
  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/).filter(line => !/^\s*(?:export\s+)?(?:CHAT_ENGINE|GEMINI_API_KEY|GEMINI_MODEL)\s*=/.test(line));
  while (lines.at(-1) === '') lines.pop();
  return [...lines,'','CHAT_ENGINE=gemini','GEMINI_API_KEY='+apiKey,'GEMINI_MODEL='+model,''].join(newline);
}
