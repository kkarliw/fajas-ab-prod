import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

// Best full-body group photos (white background works well as side panels, not bg)
import heroA from "@/assets/Fajas AB/fotos grupales/_A9A4843.jpg"; // 2 models full body curtains bg
import heroB from "@/assets/Fajas AB/fotos grupales/_A9A4578.jpg"; // 3 models elegant bg
import heroC from "@/assets/Fajas AB/fotos grupales/_A9A4988.jpg"; // 3 models curtains full body
import heroD from "@/assets/Fajas AB/fotos grupales/_A9A4562.jpg"; // 3 models wall full body

type SlideType = {
  imgLeft?: string;
  imgRight?: string;
  isVideo?: boolean;
  videoPc?: string;
  videoMobile?: string;
  eyebrow: string;
  headline1: string;
  headline2: string;
  sub: string;
};

const slides: SlideType[] = [
  {
    imgLeft: heroA,
    imgRight: heroB,
    eyebrow: "Una segunda piel",
    headline1: "LUJO QUE",
    headline2: "moldea",
    sub: "Diseñado para sentirse perfecto. Hecho en Colombia.",
  },
  {
    imgLeft: heroC,
    imgRight: heroD,
    eyebrow: "Colección 2025",
    headline1: "SILUETAS",
    headline2: "perfectas",
    sub: "Tecnología colombiana de compresión con diseño editorial.",
  },
  {
    isVideo: true,
    videoPc: "/videos/Hero%20pc.mp4",
    videoMobile: "/videos/Hero%20responsive.mp4",
    eyebrow: "Estilo & Control",
    headline1: "SIENTE EL",
    headline2: "lujo",
    sub: "Compresión premium diseñada para moldear con total comodidad.",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const videoPcRef = useRef<HTMLVideoElement | null>(null);
  const videoMobileRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Manage video playback programmatically to prevent background CPU/battery usage
  useEffect(() => {
    const isVideoSlide = slides[current].isVideo;
    if (isVideoSlide) {
      if (isMobile) {
        void videoMobileRef.current?.play().catch(() => {});
      } else {
        void videoPcRef.current?.play().catch(() => {});
      }
    } else {
      videoPcRef.current?.pause();
      videoMobileRef.current?.pause();
    }
  }, [current, isMobile]);

  const getSlideDuration = useCallback((slideIndex: number) => {
    const slide = slides[slideIndex];
    if (slide.isVideo) {
      return isMobile ? 15000 : 12000; // Increased duration so video doesn't cut off too quickly
    }
    return 6000; // standard image slide duration
  }, [isMobile]);

  const goTo = (idx: number) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 450);
  };

  useEffect(() => {
    const duration = getSlideDuration(current);
    timerRef.current = setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((p) => (p + 1) % slides.length);
        setAnimating(false);
      }, 450);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, getSlideDuration]);

  const s = slides[current];

  return (
    <section
      aria-label="Colección destacada"
      className="relative w-full overflow-hidden border-b border-hairline bg-[#1a1510]"
    >
      {/* Background container: images split-panel or video */}
      <div className="relative h-[80vh] min-h-[540px] max-h-[900px] w-full">
        {/* Render split-panels for slide 0 and 1 */}
        {slides.map((slide, index) => {
          if (slide.isVideo) return null;
          const isActive = index === current;
          const opacityClass = isActive && !animating ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none";
          const isFirstSlide = index === 0;
          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full grid grid-cols-1 md:grid-cols-2 transition-opacity duration-500 ease-in-out transform-gpu ${opacityClass}`}
              style={{ willChange: "opacity" }}
            >
              {/* Left panel */}
              <div className="relative overflow-hidden col-span-1">
                <img
                  src={slide.imgLeft}
                  alt="Modelos FAJAS AB"
                  loading={isFirstSlide ? "eager" : "lazy"}
                  fetchpriority={isFirstSlide ? "high" : "low"}
                  width="800"
                  height="1200"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60 pointer-events-none" />
              </div>

              {/* Right panel */}
              <div className="relative overflow-hidden hidden md:block">
                <img
                  src={slide.imgRight}
                  alt="Modelos FAJAS AB"
                  loading={isFirstSlide ? "eager" : "lazy"}
                  fetchpriority={isFirstSlide ? "high" : "low"}
                  width="800"
                  height="1200"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60 pointer-events-none" />
              </div>
            </div>
          );
        })}

        {/* Video slide - lazy loaded to prevent initial page load freeze */}
        <div
          className={`absolute inset-0 w-full h-full overflow-hidden bg-[#1a1510] transition-opacity duration-500 ease-in-out transform-gpu ${
            current === 2 && !animating ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
          style={{ willChange: "opacity" }}
        >
          {/* PC video */}
          {!isMobile && (
            <video
              ref={videoPcRef}
              src="https://res.cloudinary.com/v75tv7wk/video/upload/f_auto,q_auto/v1/fajasab-hero/f0qk0yqswjkndcr6xlcz.mp4"
              poster="https://res.cloudinary.com/v75tv7wk/video/upload/w_1200,f_auto,q_auto/v1/fajasab-hero/f0qk0yqswjkndcr6xlcz.jpg"
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Mobile video */}
          {isMobile && (
            <video
              ref={videoMobileRef}
              src="https://res.cloudinary.com/v75tv7wk/video/upload/f_auto,q_auto/v1/fajasab-hero/fe0l5bi8qaltt15oxfgw.mp4"
              poster="https://res.cloudinary.com/v75tv7wk/video/upload/w_800,f_auto,q_auto/v1/fajasab-hero/fe0l5bi8qaltt15oxfgw.jpg"
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70 pointer-events-none" />
        </div>
      </div>

      {/* Thin center divider (only for image slides) */}
      <div
        className={`absolute inset-y-0 left-1/2 w-px bg-white/15 pointer-events-none hidden md:block transition-opacity duration-500 ${
          s.isVideo ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Centered text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none z-20">
        <div
          className={`text-center max-w-[780px] transition-all duration-500 ${animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
        >
          <p className="uppercase tracking-[0.32em] text-[10px] sm:text-[11px] text-white/70 font-body mb-5">
            {s.eyebrow}
          </p>
          <h1 className="font-display font-light text-white leading-[0.93] tracking-[0.01em] text-[42px] sm:text-[72px] md:text-[92px] lg:text-[112px]"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            {s.headline1} <span className="italic text-[#d4af7a]">{s.headline2}</span>
          </h1>
          <p className="mt-5 font-body text-[13px] sm:text-[14px] text-white/80 max-w-sm mx-auto leading-relaxed"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            {s.sub}
          </p>
          <div className="mt-9 flex flex-row items-center justify-center gap-3 sm:gap-4 pointer-events-auto">
            <Link
              to="/shop"
              className="bg-white text-[#1a1510] uppercase tracking-[0.22em] text-[11px] sm:text-[12px] font-bold px-6 sm:px-10 py-4 inline-flex items-center gap-1.5 sm:gap-2 hover:bg-[#d4af7a] hover:text-white transition-all duration-300"
            >
              Ver colección →
            </Link>
            <Link
              to="/shop?cat=Fajas"
              className="border border-white/50 text-white uppercase tracking-[0.22em] text-[11px] sm:text-[12px] font-bold px-5 sm:px-8 py-4 inline-flex items-center gap-1.5 sm:gap-2 hover:border-white hover:bg-white/10 transition-all duration-300"
            >
              Fajas
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom: slide dots + scroll hint */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-3 pointer-events-auto z-20">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-0.5 transition-all duration-500 ${i === current ? "w-10 bg-white" : "w-4 bg-white/35 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
