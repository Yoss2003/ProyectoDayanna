export function say(message: string): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "es-PE";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
