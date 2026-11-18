import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BriefingCmsConfig, TabId } from '../config/briefingConfig';
import { FortifaiLogo } from './FortifaiLogo';

interface ExecutiveWalkthroughTabProps {
  config: BriefingCmsConfig['walkthrough'];
  bookDemoUrl: string;
  onSelectTab: (tab: TabId) => void;
}

function isDirectVideoFile(url: string): boolean {
  const clean = url.split('?')[0].split('#')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v')
  );
}

function buildAutoplayEmbedUrl(baseUrl: string, shouldAutoplay: boolean): string {
  if (!shouldAutoplay) return baseUrl;
  try {
    const parsed = new URL(baseUrl);
    if (!parsed.searchParams.has('autoplay')) {
      parsed.searchParams.set('autoplay', '1');
    }
    return parsed.toString();
  } catch {
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}autoplay=1`;
  }
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const rem = total % 60;
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

export const ExecutiveWalkthroughTab: React.FC<
  ExecutiveWalkthroughTabProps
> = ({ config, bookDemoUrl, onSelectTab }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Native HTML5 <video> state when a direct .mp4/.webm URL is provided
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerCardRef = useRef<HTMLElement | null>(null);
  const [isPlayingMp4, setIsPlayingMp4] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isNativeVideo = useMemo(
    () => isDirectVideoFile(config.trupeerEmbedUrl),
    [config.trupeerEmbedUrl]
  );

  const activeEmbedSrc = useMemo(
    () => buildAutoplayEmbedUrl(config.trupeerEmbedUrl, hasStarted),
    [config.trupeerEmbedUrl, hasStarted]
  );

  useEffect(() => {
    setIframeLoaded(false);
    setHasStarted(false);
    setIsPlayingMp4(false);
    setCurrentTime(0);
  }, [config.trupeerEmbedUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) setIsFullScreen(false);
        else if (isTheaterMode) setIsTheaterMode(false);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullScreen, isTheaterMode]);

  const handleLaunchWalkthrough = () => {
    setHasStarted(true);
    if (isNativeVideo && videoRef.current) {
      void videoRef.current.play().catch(() => {
        // Ignore autoplay restriction if user interacts directly with controls
      });
      setIsPlayingMp4(true);
    }
  };

  const handleResetToCover = () => {
    if (isNativeVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlayingMp4(false);
    setHasStarted(false);
  };

  const handleSelectChapter = (idx: number) => {
    setActiveChapterIdx(idx);
    const chapter = config.chapters[idx];
    if (!hasStarted) {
      setHasStarted(true);
    }
    if (isNativeVideo && videoRef.current && chapter) {
      videoRef.current.currentTime = chapter.timestampSec;
      void videoRef.current.play().catch(() => {});
      setIsPlayingMp4(true);
    }
  };

  const toggleMp4PlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play().catch(() => {});
      setIsPlayingMp4(true);
    } else {
      videoRef.current.pause();
      setIsPlayingMp4(false);
    }
  };

  const cyclePlaybackSpeed = () => {
    const nextSpeed: 1 | 1.25 | 1.5 =
      playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const toggleFullScreen = async () => {
    if (!isFullScreen) {
      setIsFullScreen(true);
      if (playerCardRef.current && playerCardRef.current.requestFullscreen) {
        try {
          await playerCardRef.current.requestFullscreen();
        } catch {
          // Graceful fixed-viewport fallback inside sandboxed iframes
        }
      }
    } else {
      setIsFullScreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore
        }
      }
    }
  };

  const activeChapter =
    config.chapters[activeChapterIdx] ?? config.chapters[0];

  return (
    <div
      className={`mx-auto transition-all duration-300 px-4 sm:px-6 pt-4 pb-10 space-y-4 ${
        isTheaterMode ? 'max-w-[1340px]' : 'max-w-[1120px]'
      }`}
    >
      {/* Clean Editorial Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-[5px] px-2 py-0.5 fortifai-pill uppercase">
              {config.durationBadge}
            </span>
            <span className="hidden md:inline-block font-mono-tabular text-[10px] font-medium text-[#64748B]">
              · 100% CUSTOMER VPC · DETERMINISTIC ASSURANCE
            </span>
          </div>
          <h1 className="text-[21px] sm:text-[22px] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66]">
            {config.headline}
          </h1>
          <p className="text-[13px] font-normal leading-[1.52] text-[#4B5B6E]">
            {config.subtitle}
          </p>
        </div>
      </header>

      {/* Crisp #FFFFFF Video Stage Card */}
      <section
        ref={playerCardRef}
        aria-label="Interactive Product Walkthrough Video"
        className={
          isFullScreen
            ? 'fixed inset-0 z-50 bg-[#FFFFFF] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto'
            : 'w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-3.5 fortifai-card-shadow'
        }
      >
        {/* Top Utility & Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6699CC] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E5A8A]" />
            </span>
            <span className="font-mono-tabular text-[10.5px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase truncate">
              FORTIFAI SARA · LIVE PLATFORM WALKTHROUGH
            </span>
            {activeChapter && (
              <span className="hidden md:inline-flex items-center rounded-[5px] px-2 py-0.5 fortifai-pill">
                STAGE {activeChapter.code} · {activeChapter.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasStarted && (
              <button
                type="button"
                onClick={handleResetToCover}
                className="inline-flex items-center gap-1 rounded-[6px] bg-[#F8FAFC] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-2 py-1 text-[11.5px] font-medium text-[#4B5B6E] hover:text-[#163B66] transition-colors cursor-pointer"
                title="Return to Fortifai executive cover screen"
              >
                <RotateCcw className="w-3 h-3 text-[#2E5A8A]" />
                <span className="hidden sm:inline">Cover</span>
              </button>
            )}

            {!isFullScreen && (
              <button
                type="button"
                onClick={() => setIsTheaterMode((prev) => !prev)}
                className={`hidden lg:inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-1 text-[11.5px] font-medium transition-colors cursor-pointer ${
                  isTheaterMode
                    ? 'bg-[#E8F0F8] border-[#6699CC]/50 text-[#163B66]'
                    : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E5E7EB] text-[#4B5B6E] hover:text-[#163B66]'
                }`}
                title="Expand player width for boardroom presentation"
              >
                <Monitor className="w-3 h-3 text-[#2E5A8A]" />
                <span>{isTheaterMode ? 'Standard View' : 'Theater View'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleFullScreen}
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#F8FAFC] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-2 py-1 text-[11.5px] font-medium text-[#163B66] transition-colors cursor-pointer"
              title="Toggle Fortifai full-screen presentation mode"
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3 h-3 text-[#2E5A8A]" />
                  <span>Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3 text-[#2E5A8A]" />
                  <span className="hidden sm:inline">Full Screen</span>
                </>
              )}
            </button>

            <a
              href={config.trupeerEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11.5px] font-medium text-[#2E5A8A] hover:text-[#163B66] hover:underline whitespace-nowrap pl-1 transition-colors"
            >
              {config.openExternalLabel}
            </a>
          </div>
        </div>

        {/* 16:9 Architectural Video Viewport */}
        <div
          className={`relative w-full aspect-video rounded-[12px] overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB] ${
            isFullScreen ? 'flex-1 max-h-[calc(100vh-195px)] mx-auto' : ''
          }`}
        >
          {/* ENGINE A: Direct Clean MP4/WebM Native Fortifai Player (Zero 3rd-Party Branding) */}
          {isNativeVideo ? (
            <div className="relative h-full w-full bg-[#0D1520] flex flex-col justify-between">
              <video
                ref={videoRef}
                src={config.trupeerEmbedUrl}
                playsInline
                onClick={toggleMp4PlayPause}
                onTimeUpdate={(e) => {
                  const t = e.currentTarget.currentTime;
                  setCurrentTime(t);
                  const matchedIdx = config.chapters.reduce(
                    (acc, ch, i) => (t >= ch.timestampSec ? i : acc),
                    0
                  );
                  if (matchedIdx !== activeChapterIdx) {
                    setActiveChapterIdx(matchedIdx);
                  }
                }}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onPlay={() => setIsPlayingMp4(true)}
                onPause={() => setIsPlayingMp4(false)}
                className="h-full w-full object-contain cursor-pointer"
              />

              {/* Custom Fortifai Daylight-Navy Native Control Bar */}
              {hasStarted && (
                <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-[#0D1520]/90 via-[#0D1520]/65 to-transparent px-4 pt-6 pb-3 flex items-center gap-3 text-[#FFFFFF]">
                  <button
                    type="button"
                    onClick={toggleMp4PlayPause}
                    className="h-8 w-8 rounded-full bg-[#FFFFFF]/15 hover:bg-[#FFFFFF]/25 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    aria-label={isPlayingMp4 ? 'Pause video' : 'Play video'}
                  >
                    {isPlayingMp4 ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>

                  <span className="font-mono-tabular text-[11px] text-[#E2E8F0] shrink-0">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>

                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setCurrentTime(next);
                      if (videoRef.current) {
                        videoRef.current.currentTime = next;
                      }
                    }}
                    aria-label="Seek walkthrough timeline"
                    className="flex-1 h-1.5 accent-[#6699CC] cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={cyclePlaybackSpeed}
                    className="rounded-[6px] bg-[#FFFFFF]/15 hover:bg-[#FFFFFF]/25 px-2 py-1 font-mono-tabular text-[11px] font-medium cursor-pointer shrink-0"
                    title="Playback speed"
                  >
                    {playbackSpeed}x
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="h-8 w-8 rounded-full bg-[#FFFFFF]/15 hover:bg-[#FFFFFF]/25 flex items-center justify-center cursor-pointer shrink-0"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ENGINE B: Preloaded Interactive Embed Stream + Subtle Corner Stamp Shield */
            <>
              {hasStarted && !iframeLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#F8FAFC] px-6 text-center">
                  <div className="h-6 w-6 rounded-full border-2 border-[#6699CC] border-t-transparent animate-spin" />
                  <p className="font-mono-tabular text-[11px] font-medium tracking-[0.05em] text-[#2E5A8A]">
                    STREAMING EXECUTIVE WALKTHROUGH…
                  </p>
                </div>
              )}

              <iframe
                key={activeEmbedSrc}
                src={activeEmbedSrc}
                title={config.headline}
                onLoad={() => setIframeLoaded(true)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className={`relative z-10 h-full w-full border-0 transition-transform duration-300 ${
                  config.maskCornerStamp ? 'scale-[1.012]' : ''
                }`}
              />

              {/* Subtle Fortifai Corner Stamp Shield (Masks top-right third-party badge without blocking video controls) */}
              {hasStarted && config.maskCornerStamp && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1.5 rounded-[7px] bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E5E7EB] px-2.5 py-1 shadow-[0_4px_14px_rgba(13,21,32,0.08)]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E5A8A] shrink-0" />
                  <span className="font-mono-tabular text-[10.5px] font-medium tracking-[0.04em] text-[#163B66]">
                    FORTIFAI SARA · VERIFIED TOUR
                  </span>
                </div>
              )}
            </>
          )}

          {/* BESPOKE FORTIFAI V2.0 DAYLIGHT EXECUTIVE COVER STAGE (Hides 3rd-Party Start Screen) */}
          {!hasStarted && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleLaunchWalkthrough}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLaunchWalkthrough();
                }
              }}
              aria-label={config.coverPlayLabel}
              className="group absolute inset-0 z-30 sara-dot-stage flex flex-col justify-between p-5 sm:p-8 cursor-pointer select-none"
            >
              {/* Top Brand & Sovereign Assurance Strip */}
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#FFFFFF]/95 border border-[#E5E7EB] px-3 py-1.5 shadow-[0_2px_10px_rgba(13,21,32,0.04)]">
                  <FortifaiLogo height={20} />
                  <span className="hidden sm:inline-block h-3.5 w-[1px] bg-[#E5E7EB]" />
                  <span className="hidden sm:inline-block font-mono-tabular text-[10.5px] font-medium tracking-[0.04em] text-[#2E5A8A]">
                    SARA COCKPIT BRIEFING
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#FFFFFF]/95 border border-[#E5E7EB] px-2.5 py-1 font-mono-tabular text-[10.5px] font-medium text-[#163B66] shadow-[0_2px_10px_rgba(13,21,32,0.04)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E5A8A]" />
                  <span>0% DATA EGRESS · IN-VPC</span>
                </span>
              </div>

              {/* Centerpiece Play Invitation */}
              <div className="my-auto mx-auto max-w-[600px] text-center space-y-3 px-2">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 fortifai-pill">
                  {config.durationBadge}
                </span>

                <h2 className="text-[clamp(18px,2.2vw,25px)] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66] text-balance">
                  {config.coverHeadline}
                </h2>

                <div className="pt-0.5 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2.5 rounded-full bg-[#163B66] group-hover:bg-[#2E5A8A] text-[#FFFFFF] pl-2.5 pr-5 py-2 text-[13px] font-medium shadow-[0_12px_30px_rgba(22,59,102,0.22)] group-hover:scale-[1.02] transition-all duration-200">
                    <span className="h-8 w-8 rounded-full bg-[#FFFFFF]/15 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </span>
                    <span>{config.coverPlayLabel}</span>
                  </span>
                </div>
              </div>

              {/* Bottom Architectural 4-Step Preview Bar */}
              <div className="hidden md:grid grid-cols-4 gap-2">
                {config.chapters.slice(0, 4).map((ch) => (
                  <div
                    key={ch.code}
                    className="rounded-[8px] bg-[#FFFFFF]/92 backdrop-blur-sm border border-[#E5E7EB] px-2.5 py-1.5 flex items-center gap-2 shadow-[0_2px_10px_rgba(13,21,32,0.03)]"
                  >
                    <span className="rounded-[4px] px-1.5 py-0.5 fortifai-pill shrink-0">
                      {ch.code}
                    </span>
                    <span className="text-[11.5px] font-medium text-[#163B66] truncate">
                      {ch.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Integrated 4-Stage Walkthrough Chapter Strip */}
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {config.chapters.map((chapter, idx) => {
            const isSelected = activeChapterIdx === idx;
            return (
              <button
                key={`${chapter.code}-${idx}`}
                type="button"
                onClick={() => handleSelectChapter(idx)}
                className={`rounded-[8px] border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#F4F8FC] border-[#6699CC]/65 shadow-[0_2px_10px_rgba(22,59,102,0.04)]'
                    : 'bg-[#F8FAFC]/70 hover:bg-[#F8FAFC] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-[4px] px-1.5 py-0.5 font-mono-tabular text-[10px] font-medium ${
                      isSelected
                        ? 'bg-[#163B66] text-[#FFFFFF]'
                        : 'bg-[#E8F0F8] text-[#2E5A8A]'
                    }`}
                  >
                    {chapter.code}
                  </span>
                  {isNativeVideo && (
                    <span className="font-mono-tabular text-[10px] text-[#64748B]">
                      {formatSeconds(chapter.timestampSec)}
                    </span>
                  )}
                </div>
                <div className="mt-1.5">
                  <h3 className="text-[12.5px] font-medium text-[#163B66] leading-[1.3]">
                    {chapter.title}
                  </h3>
                  <p className="mt-0.5 text-[11.5px] leading-[1.42] text-[#4B5B6E] line-clamp-2">
                    {chapter.detail}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3 Compact #FFFFFF Hairline Metric Cards */}
      <section
        aria-label="Key Platform Guarantees"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {config.metrics.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] fortifai-card-shadow px-4 py-3 flex items-start justify-between gap-3"
          >
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-[21px] font-medium leading-none tracking-[-0.03em] text-[#163B66]">
                  {item.metric}
                </span>
                <span className="text-[13px] font-medium leading-[1.3] text-[#163B66]">
                  {item.label}
                </span>
              </div>
              {item.sublabel && (
                <p className="mt-1 text-[11.5px] text-[#4B5B6E]">
                  {item.sublabel}
                </p>
              )}
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6699CC] shrink-0 mt-0.5" />
          </div>
        ))}
      </section>

      {/* Quiet 1-Line Executive Continuation Bar */}
      <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] fortifai-card-shadow px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <p className="text-[12.5px] text-[#4B5B6E]">
          {config.nextStepPrompt}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('architecture')}
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#F8FAFC] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#163B66] whitespace-nowrap transition-colors cursor-pointer"
          >
            <span>02 · Architecture &amp; Security</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#2E5A8A]" />
          </button>

          <a
            href={bookDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-[7px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors"
          >
            <span>Book Live Walkthrough</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
};
