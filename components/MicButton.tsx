"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

// Only one recognition session can run at a time - mirrors the original
// prototype's behavior of stopping whichever field was listening before
// starting a new one.
let activeRecognition: SpeechRecognitionLike | null = null;

function mergeText(existing: string, addition: string) {
  if (!addition) return existing;
  if (!existing) return addition;
  return `${existing} ${addition}`;
}

export default function MicButton({
  value,
  label,
  onResult,
}: {
  value: string;
  label: string;
  onResult: (next: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const ctor = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setSupported(!!ctor);
  }, []);

  if (!supported) return null;

  function handleClick() {
    const ctor = ((window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as new () => SpeechRecognitionLike;

    if (activeRecognition) {
      activeRecognition.stop();
      activeRecognition = null;
    }

    const initial = value.trim();
    const recognition = new ctor();
    activeRecognition = recognition;
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      onResult(mergeText(initial, transcript.trim()));
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      activeRecognition = null;
      setListening(false);
    };

    recognition.start();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Speak ${label}`}
      aria-pressed={listening}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
        listening
          ? "border-[#edc676] bg-[#fff4df] text-[#a35d10]"
          : "border-line bg-panel text-ink hover:border-line-strong hover:bg-panel-soft"
      }`}
    >
      <Mic size={16} />
    </button>
  );
}
