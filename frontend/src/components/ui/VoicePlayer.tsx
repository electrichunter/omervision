"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoicePlayerProps {
    audioUrl: string;
    title?: string;
}

export function VoicePlayer({ audioUrl, title }: VoicePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
            audioRef.current.currentTime = seekTime;
            setProgress(parseFloat(e.target.value));
        }
    };

    if (!audioUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-12 p-8 rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] backdrop-blur-3xl shadow-premium relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent-blue)]/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Control Button */}
                <button
                    onClick={togglePlay}
                    className="relative group w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl bg-[var(--color-accent-blue)] text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <AnimatePresence mode="wait">
                        {isPlaying ? (
                            <motion.div
                                key="pause"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                            >
                                <Pause size={28} fill="currentColor" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="play"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                            >
                                <Play size={28} className="translate-x-0.5" fill="currentColor" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                                {title || 'Yapay Zeka ile Dinle'}
                            </h4>
                            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                                <Sparkles size={12} className="text-amber-400" />
                                Özel sinirsel seslendirme
                            </p>
                        </div>
                        <button
                            onClick={toggleMute}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative group">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-[var(--color-bg-tertiary)] rounded-full appearance-none cursor-pointer accent-[var(--color-accent-blue)]"
                        />
                        <div
                            className="absolute top-0 left-0 h-1.5 bg-[var(--color-accent-blue)] rounded-full pointer-events-none transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
            />
        </motion.div>
    );
}
