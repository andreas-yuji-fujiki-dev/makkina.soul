import { useEffect, useRef } from "react";
import "@styles/landing.css";

export function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // body tem padding global (ver theme.css) — pra landing ocupar exatamente
  // 100dvh/100dvw sem sobra de scroll, zera isso enquanto ela estiver montada.
  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let reversing = false;
    let lastReverseStepAt = 0;

    const stepBack = () => {
      if (!reversing) return;

      if (video.currentTime <= 0) {
        reversing = false;
        void video.play().catch((error: unknown) => {
          console.error("Não foi possível reiniciar o vídeo da landing:", error);
        });
        return;
      }

      const now = performance.now();
      const elapsed = Math.max(1 / 30, (now - lastReverseStepAt) / 1000);
      lastReverseStepAt = now;
      const nextTime = Math.max(0, video.currentTime - elapsed);

      if (nextTime === 0) {
        video.currentTime = 0;
        return;
      }

      video.currentTime = nextTime;
    };

    const reverseVideo = () => {
      video.pause();
      if (!Number.isFinite(video.duration)) {
        console.error("Não foi possível retroceder o vídeo: duração indisponível.");
        return;
      }
      reversing = true;
      lastReverseStepAt = performance.now();
      stepBack();
    };

    const continueReverse = () => {
      if (reversing) stepBack();
    };

    video.addEventListener("ended", reverseVideo);
    video.addEventListener("seeked", continueReverse);
    return () => {
      video.removeEventListener("ended", reverseVideo);
      video.removeEventListener("seeked", continueReverse);
    };
  }, []);

  return (
    <div className="landing">
      <div className="landing-art">
        <video
          ref={videoRef}
          src="/landing-crown.mp4"
          autoPlay
          muted
          playsInline
          aria-hidden="true"
        />
      </div>

        <div className="landing-text">
          <span className="landing-title">macchina.soul</span>
          <a className="landing-link" href="/self-manager">
            self.manager
          </a>
        </div>
    </div>
  );
}
