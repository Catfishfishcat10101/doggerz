/** @format */

const COMMAND_KEYWORDS = Object.freeze({
  sit: ["sit", "sit down"],
  stay: ["stay", "wait"],
  down: ["down", "lie down", "lay down"],
  come: ["come", "come here"],
  heel: ["heel", "with me"],
  rollOver: ["roll over", "rollover"],
  speak: ["speak", "bark"],
  shake: ["shake", "paw"],
  highFive: ["high five", "highfive"],
  wave: ["wave"],
  spin: ["spin", "turn around"],
  jump: ["jump"],
  bow: ["bow", "take a bow"],
  playDead: ["play dead", "dead"],
  fetch: ["fetch", "go fetch"],
  dance: ["dance"],
});

function normalizeText(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function mapTranscriptToCommand(transcript) {
  const normalized = normalizeText(transcript);
  if (!normalized) return "";

  for (const [commandId, keywords] of Object.entries(COMMAND_KEYWORDS)) {
    if (keywords.some((phrase) => normalized.includes(phrase))) {
      return commandId;
    }
  }
  return "";
}

class VoiceCommandHandler {
  constructor(options = {}) {
    this.lang = String(options.lang || "en-US");
    this.interimResults = Boolean(options.interimResults);
    this.maxAlternatives = Math.max(
      1,
      Math.min(5, Number(options.maxAlternatives || 3))
    );
    this.onCommand =
      typeof options.onCommand === "function" ? options.onCommand : null;
    this.onTranscript =
      typeof options.onTranscript === "function" ? options.onTranscript : null;
    this.onError =
      typeof options.onError === "function" ? options.onError : null;
    this.onStatusChange =
      typeof options.onStatusChange === "function"
        ? options.onStatusChange
        : null;
    this.recognition = null;
    this.listening = false;
  }

  isSupported() {
    return Boolean(getSpeechRecognitionCtor());
  }

  start() {
    if (!this.isSupported()) {
      this._emitError({
        code: "unsupported",
        message: "Speech recognition is unavailable on this device.",
      });
      return false;
    }
    if (!this.recognition) this._createRecognition();
    if (!this.recognition || this.listening) return this.listening;
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      this._emitError({
        code: "start_failed",
        message: error?.message || "Failed to start voice recognition.",
        error,
      });
      return false;
    }
  }

  stop() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch {
      // Ignore stop errors caused by state races.
    }
  }

  destroy() {
    this.stop();
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onend = null;
      this.recognition.onerror = null;
      this.recognition.onresult = null;
      this.recognition = null;
    }
    this.listening = false;
    this._emitStatus("idle");
  }

  _createRecognition() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = this.lang;
    recognition.continuous = false;
    recognition.interimResults = this.interimResults;
    recognition.maxAlternatives = this.maxAlternatives;

    recognition.onstart = () => {
      this.listening = true;
      this._emitStatus("listening");
    };

    recognition.onend = () => {
      this.listening = false;
      this._emitStatus("idle");
    };

    recognition.onerror = (event) => {
      this._emitError({
        code: String(event?.error || "recognition_error"),
        message: String(event?.message || "Voice recognition failed."),
        event,
      });
    };

    recognition.onresult = (event) => {
      const candidates = [];
      const results = event?.results || [];
      for (let i = event?.resultIndex || 0; i < results.length; i += 1) {
        const result = results[i];
        if (!result) continue;
        for (let j = 0; j < result.length; j += 1) {
          const alt = result[j];
          if (alt?.transcript) candidates.push(String(alt.transcript));
        }
      }
      const transcript = candidates.find(Boolean) || "";
      const normalized = normalizeText(transcript);
      if (this.onTranscript && transcript) {
        this.onTranscript({
          transcript,
          normalized,
          candidates,
        });
      }
      const commandId = mapTranscriptToCommand(transcript);
      if (!commandId) {
        this._emitError({
          code: "unmatched_command",
          message: "No known command found in voice transcript.",
          transcript,
        });
        return;
      }
      if (this.onCommand) {
        this.onCommand({
          commandId,
          transcript,
          normalized,
          candidates,
        });
      }
    };

    this.recognition = recognition;
  }

  _emitError(payload) {
    if (this.onError) this.onError(payload);
  }

  _emitStatus(status) {
    if (this.onStatusChange) this.onStatusChange(status);
  }
}

export function createVoiceCommandHandler(options = {}) {
  return new VoiceCommandHandler(options);
}

export default VoiceCommandHandler;
