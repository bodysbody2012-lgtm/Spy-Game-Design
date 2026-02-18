import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { NeonButton } from "./ui-components";

export function AudioController() {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    bgmRef.current = new Audio("/audio/bgm.mp3");
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.3;

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (!bgmRef.current) return;
    
    if (isMuted) {
      bgmRef.current.play().catch(e => console.log("Audio play blocked", e));
      setIsMuted(false);
    } else {
      bgmRef.current.pause();
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <NeonButton
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-xl"
      >
        {isMuted ? <VolumeX className="h-6 w-6 text-gray-400" /> : <Volume2 className="h-6 w-6 text-primary animate-pulse" />}
      </NeonButton>
    </div>
  );
}

export const playSFX = (type: "click" | "win" | "lose") => {
  const sfx = new Audio(`/audio/${type}.mp3`);
  sfx.volume = 0.5;
  sfx.play().catch(() => {});
};
