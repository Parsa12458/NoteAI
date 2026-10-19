import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { appleSpring } from "../utils/cn";

export const MinimalAudioPlayer = ({
  audioUrl,
  title = "صوت ضبط‌شده جلسه",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const effectiveUrl =
    audioUrl ||
    "https://actions.google.com/sounds/v1/ambiences/outdoor_water_fountain.ogg";

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioUrl]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      className={`p-4 rounded-3xl apple-glass-card flex flex-col gap-3 ${className}`}
    >
      <audio
        ref={audioRef}
        src={effectiveUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[240px]">
          {title}
        </span>
        <span className="font-mono text-2xs" dir="ltr">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <motion.button
          onClick={togglePlay}
          whileTap={{ scale: 0.94 }}
          transition={appleSpring}
          className="w-10 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" strokeWidth={1.5} />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={1.5} />
          )}
        </motion.button>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          title="شروع مجدد"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>

        {/* Waveform Scrubber Slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-black/[0.08] dark:bg-white/[0.12] rounded-full appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
          />
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Volume2 className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
};
