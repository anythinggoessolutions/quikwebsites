import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerate } from "../lib/useGenerate";

/* ─── Progress message sequence (rotates while generating) ─── */
const PROGRESS_MESSAGES = [
  { text: "Analyzing your business...", icon: "🔍" },
  { text: "Designing your layout...", icon: "🎨" },
  { text: "Crafting your copy...", icon: "✍️" },
  { text: "Building premium sections...", icon: "🏗️" },
  { text: "Adding scroll animations...", icon: "✨" },
  { text: "Generating custom images...", icon: "📸" },
  { text: "Adding cinematic effects...", icon: "🎬" },
  { text: "Polishing every detail...", icon: "💎" },
  { text: "Almost there...", icon: "🚀" },
];

/* ─── Roadrunner SVG — matches the QuikWebsites logo silhouette ─── */
function RoadrunnerMascot() {
  return (
    <div className="gen-mascot-wrap">
      <motion.div
        className="gen-mascot"
        animate={{ x: ["-6%", "6%", "-6%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="260"
          height="120"
          viewBox="0 0 260 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tailFade" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* === TAIL — long, thick at base, tapering into speed streaks === */}
          {/* Main tail mass */}
          <path
            d="M 108 42 C 95 40, 75 38, 55 36 C 40 35, 22 35, 4 34
               L 4 38
               C 22 39, 42 40, 58 42 C 75 44, 95 45, 108 48 Z"
            fill="url(#tailFade)"
          />
          {/* Upper speed streak */}
          <path
            d="M 90 38 C 70 34, 45 30, 15 26"
            stroke="url(#tailFade)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Gap streaks in tail */}
          <line x1="62" y1="38" x2="72" y2="39" stroke="#07051a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="70" y1="41" x2="80" y2="42" stroke="#07051a" strokeWidth="1" strokeLinecap="round" />

          {/* === BODY — full chest, leaning forward, upright posture === */}
          <path
            d="
              M 108 28
              C 115 24, 128 20, 140 18
              C 150 16, 158 16, 165 18
              C 172 20, 178 25, 180 30
              C 182 34, 182 38, 180 42
              L 178 46
              C 175 50, 168 54, 160 56
              C 152 58, 140 58, 130 56
              C 120 54, 112 50, 108 46
              Z
            "
            fill="#ffffff"
          />

          {/* === NECK + HEAD — held high, distinct from body === */}
          <path
            d="
              M 168 22
              C 172 18, 178 14, 182 12
              C 186 10, 192 10, 196 12
              C 200 14, 202 18, 202 22
              C 202 26, 200 28, 196 30
              C 192 32, 186 32, 180 30
              C 176 28, 172 26, 168 22
              Z
            "
            fill="#ffffff"
          />

          {/* === CREST — spiky feathers on top of head === */}
          <path d="M 192 12 C 190 6, 192 0, 196 -2" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 195 10 C 196 4, 200 0, 204 -2" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 198 11 C 200 6, 205 4, 208 2" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* === BEAK — long, thick, slightly angled down === */}
          <path
            d="M 202 20 L 240 24 L 202 26 Z"
            fill="#ffffff"
          />

          {/* === EYE === */}
          <circle cx="198" cy="19" r="3" fill="#07051a" />
          <circle cx="199" cy="18.5" r="1" fill="#ffffff" />

          {/* === LEGS — running stride, long thin with feet/toes === */}
          {/* Back leg (left, reaching behind) */}
          <g className="gen-leg-back">
            <path
              d="M 132 56 L 120 78 L 118 82"
              stroke="#ffffff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Back foot toes */}
            <path
              d="M 118 82 L 112 84 M 118 82 L 116 86 M 118 82 L 122 85"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
          {/* Front leg (right, reaching forward) */}
          <g className="gen-leg-front">
            <path
              d="M 155 56 L 168 76 L 172 80"
              stroke="#ffffff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Front foot toes */}
            <path
              d="M 172 80 L 178 80 M 172 80 L 176 83 M 172 80 L 170 84"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </motion.div>

      {/* Ground dust particles */}
      <div className="gen-dust">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="gen-dust-dot"
            animate={{
              x: [0, -30 - i * 12],
              opacity: [0.4, 0],
              scale: [1, 0.2],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Roadrunner Runner Mini-Game (Chrome dino style) ─── */
function RunnerGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    running: false,
    started: false,
    gameOver: false,
    score: 0,
    highScore: 0,
    speed: 4,
    // Bird
    birdY: 0,
    birdVelocity: 0,
    birdOnGround: true,
    // Obstacles
    obstacles: [],
    obstacleTimer: 0,
    // Ground particles
    groundDots: [],
    // Animation
    frameId: null,
    lastTime: 0,
  });

  const CANVAS_W = 800;
  const CANVAS_H = 140;
  const GROUND_Y = 108;
  const BIRD_X = 70;
  const BIRD_W = 36;
  const BIRD_H = 24;
  const GRAVITY = 0.55;
  const JUMP_FORCE = -10;

  // Draw the roadrunner silhouette at a position
  const drawBird = useCallback((ctx, x, y, frame) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    // Body
    ctx.beginPath();
    ctx.ellipse(18, 12, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(34, 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.beginPath();
    ctx.moveTo(40, 2);
    ctx.lineTo(52, 5);
    ctx.lineTo(40, 7);
    ctx.closePath();
    ctx.fill();

    // Crest
    ctx.beginPath();
    ctx.moveTo(33, -1);
    ctx.lineTo(35, -8);
    ctx.moveTo(35, -1);
    ctx.lineTo(38, -7);
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#07051a";
    ctx.beginPath();
    ctx.arc(36, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tail speed lines
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, 10);
    ctx.lineTo(-14, 8);
    ctx.moveTo(2, 13);
    ctx.lineTo(-18, 12);
    ctx.moveTo(2, 16);
    ctx.lineTo(-12, 16);
    ctx.stroke();

    // Legs — alternate based on frame
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    const legPhase = Math.sin(frame * 0.4);
    // Back leg
    ctx.beginPath();
    ctx.moveTo(12, 20);
    ctx.lineTo(8 + legPhase * 5, 30);
    ctx.lineTo(4 + legPhase * 6, 31);
    ctx.stroke();
    // Front leg
    ctx.beginPath();
    ctx.moveTo(22, 20);
    ctx.lineTo(26 - legPhase * 5, 30);
    ctx.lineTo(30 - legPhase * 6, 31);
    ctx.stroke();

    ctx.restore();
  }, []);

  // Draw a cactus obstacle
  const drawCactus = useCallback((ctx, x) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    // Main trunk
    ctx.fillRect(x, GROUND_Y - 30, 6, 30);
    // Left arm
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 16);
    ctx.lineTo(x - 7, GROUND_Y - 16);
    ctx.lineTo(x - 7, GROUND_Y - 24);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(x + 6, GROUND_Y - 10);
    ctx.lineTo(x + 13, GROUND_Y - 10);
    ctx.lineTo(x + 13, GROUND_Y - 20);
    ctx.stroke();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const game = gameRef.current;

    // Initial draw
    const drawStatic = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      // Ground line
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();
      // Bird on ground
      drawBird(ctx, BIRD_X, GROUND_Y - BIRD_H, 0);
      // Prompt text
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Press Space or tap to play while you wait", CANVAS_W / 2, GROUND_Y + 32);
    };
    drawStatic();

    let frame = 0;

    const gameLoop = (timestamp) => {
      if (!game.running) return;

      const dt = Math.min((timestamp - game.lastTime) / 16, 2); // normalize to ~60fps
      game.lastTime = timestamp;
      frame++;

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground line
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      // Ground dots (scrolling)
      if (frame % 8 === 0) {
        game.groundDots.push({ x: CANVAS_W, size: Math.random() * 2 + 1 });
      }
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      game.groundDots = game.groundDots.filter((d) => {
        d.x -= game.speed * dt;
        if (d.x < -5) return false;
        ctx.fillRect(d.x, GROUND_Y + 2 + Math.random() * 6, d.size, d.size);
        return true;
      });

      // Bird physics
      if (!game.birdOnGround) {
        game.birdVelocity += GRAVITY * dt;
        game.birdY += game.birdVelocity * dt;
        if (game.birdY >= GROUND_Y - BIRD_H) {
          game.birdY = GROUND_Y - BIRD_H;
          game.birdVelocity = 0;
          game.birdOnGround = true;
        }
      }

      // Draw bird
      drawBird(ctx, BIRD_X, game.birdY, game.birdOnGround ? frame : 0);

      // Obstacles
      game.obstacleTimer += dt;
      if (game.obstacleTimer > 60 + Math.random() * 40) {
        game.obstacles.push({ x: CANVAS_W + 10 });
        game.obstacleTimer = 0;
      }

      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed * dt;
        if (obs.x < -20) return false;
        drawCactus(ctx, obs.x);

        // Collision detection
        if (
          BIRD_X + BIRD_W - 8 > obs.x &&
          BIRD_X + 8 < obs.x + 6 &&
          game.birdY + BIRD_H > GROUND_Y - 28
        ) {
          game.gameOver = true;
          game.running = false;
        }

        return true;
      });

      // Score
      game.score += 0.1 * dt;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "bold 14px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(Math.floor(game.score).toString().padStart(5, "0"), CANVAS_W - 10, 20);

      if (game.highScore > 0) {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText("HI " + Math.floor(game.highScore).toString().padStart(5, "0"), CANVAS_W - 70, 20);
      }

      // Gradually increase speed
      game.speed = 4 + game.score * 0.02;

      if (game.running) {
        game.frameId = requestAnimationFrame(gameLoop);
      } else if (game.gameOver) {
        // Game over screen
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 16px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", CANVAS_W / 2, GROUND_Y / 2 - 4);
        ctx.font = "12px Inter, system-ui, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText("Press Space or tap to restart", CANVAS_W / 2, GROUND_Y / 2 + 16);
      }
    };

    const jump = () => {
      if (!game.started || game.gameOver) {
        // Start or restart
        game.running = true;
        game.started = true;
        game.gameOver = false;
        if (game.score > game.highScore) game.highScore = game.score;
        game.score = 0;
        game.speed = 4;
        game.birdY = GROUND_Y - BIRD_H;
        game.birdVelocity = 0;
        game.birdOnGround = true;
        game.obstacles = [];
        game.obstacleTimer = 40;
        game.groundDots = [];
        game.lastTime = performance.now();
        game.frameId = requestAnimationFrame(gameLoop);
        return;
      }
      if (game.birdOnGround && game.running) {
        game.birdVelocity = JUMP_FORCE;
        game.birdOnGround = false;
      }
    };

    const handleKey = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    const handleTouch = (e) => {
      // Only respond to taps on the canvas
      if (canvas.contains(e.target)) {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKey);
    canvas.addEventListener("click", jump);
    canvas.addEventListener("touchstart", handleTouch, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("click", jump);
      canvas.removeEventListener("touchstart", handleTouch);
      if (game.frameId) cancelAnimationFrame(game.frameId);
    };
  }, [drawBird, drawCactus]);

  return (
    <motion.div
      className="gen-game-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="gen-game-canvas"
      />
    </motion.div>
  );
}

/* ─── Orbiting dots loader ─── */
function OrbitLoader() {
  return (
    <div className="gen-orbit">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="gen-orbit-dot"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.625,
          }}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ["#00C65A", "#5b50e8", "#FFD60A", "#22d3ee"][i],
            transformOrigin: "0 40px",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Progress bar ─── */
function ProgressBar({ progress }) {
  return (
    <div className="gen-progress-track">
      <motion.div
        className="gen-progress-fill"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

/* ─── Site Preview (iframe) ─── */
function SitePreview({ html, onBack }) {
  const iframeRef = useRef(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!html || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    // Give the iframe content a moment to render
    const timer = setTimeout(() => setIframeLoaded(true), 600);
    return () => clearTimeout(timer);
  }, [html]);

  return (
    <div className="gen-preview-wrap">
      {/* Toolbar */}
      <div className="gen-toolbar">
        <button className="gen-toolbar-back" onClick={onBack}>
          ← Back
        </button>
        <div className="gen-toolbar-center">
          <div className="gen-toolbar-dot green" />
          <span className="gen-toolbar-label">Your Website Preview</span>
        </div>
        <div className="gen-toolbar-actions">
          <motion.button
            className="gen-toolbar-cta"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Go Live — Pick a Plan →
          </motion.button>
        </div>
      </div>

      {/* Browser chrome mockup */}
      <div className="gen-browser">
        <div className="gen-browser-bar">
          <div className="gen-browser-dots">
            <span className="gen-dot red" />
            <span className="gen-dot yellow" />
            <span className="gen-dot green" />
          </div>
          <div className="gen-browser-url">
            <span className="gen-url-lock">🔒</span>
            <span className="gen-url-text">yoursite.quikwebsites.com</span>
          </div>
          <div className="gen-browser-spacer" />
        </div>
        <div className="gen-iframe-wrap">
          <motion.div
            className="gen-iframe-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: iframeLoaded ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <iframe
              ref={iframeRef}
              className="gen-iframe"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </motion.div>
          {!iframeLoaded && (
            <div className="gen-iframe-loading">
              <OrbitLoader />
              <p>Rendering your site...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Generate Page
   ═══════════════════════════════════════════ */
export default function GeneratePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const businessName = searchParams.get("name") || "";
  const businessType = searchParams.get("type") || "business";
  const description = searchParams.get("desc") || "";

  const { generate, status, html, error, isGenerating, result } =
    useGenerate();

  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading | reveal | preview
  const hasStarted = useRef(false);

  const isMock = searchParams.get("mock") === "1";

  // Start generation on mount
  useEffect(() => {
    if (hasStarted.current) return;
    if (!businessName && !description) {
      navigate("/");
      return;
    }
    hasStarted.current = true;

    // Dev mode: skip API call, jump straight to preview with sample HTML
    if (isMock) {
      setProgress(100);
      setTimeout(() => setPhase("reveal"), 500);
      return;
    }

    generate({ businessName, businessType, description });
  }, [businessName, businessType, description, generate, navigate, isMock]);

  // Cycle progress messages
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setMsgIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [phase]);

  // Map SSE status to progress %
  useEffect(() => {
    if (!status) return;
    switch (status.phase) {
      case "starting":
        setProgress(5);
        break;
      case "generating":
        setProgress(15);
        break;
      case "generated":
        setProgress(70);
        setMsgIndex(5); // jump to "Generating custom images..."
        break;
      case "images":
        setProgress(80);
        setMsgIndex(6);
        break;
      case "done":
        setProgress(100);
        setMsgIndex(PROGRESS_MESSAGES.length - 1);
        break;
    }
  }, [status]);

  // Gradually increase progress during generation
  useEffect(() => {
    if (!isGenerating || phase !== "loading") return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 65) return prev; // don't go past 65 until status says "generated"
        return prev + 0.5;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isGenerating, phase]);

  // Trigger reveal when done
  useEffect(() => {
    if (progress === 100 && phase === "loading") {
      // Short delay for the "100%" to register visually
      const timer = setTimeout(() => setPhase("reveal"), 800);
      return () => clearTimeout(timer);
    }
  }, [progress, phase]);

  // After reveal animation, show preview
  useEffect(() => {
    if (phase === "reveal") {
      const timer = setTimeout(() => setPhase("preview"), 1800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const [mockHtml, setMockHtml] = useState("");

  // Load mock HTML in dev mode
  useEffect(() => {
    if (!isMock) return;
    setMockHtml(`<!DOCTYPE html>
<html><head><title>${businessName || "Preview"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0a; color: #fff; }
  .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a0a05, #2a1510); position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(232,86,42,0.15) 0%, transparent 60%); }
  .hero-content { position: relative; text-align: center; max-width: 800px; padding: 40px; }
  .hero h1 { font-size: clamp(36px, 7vw, 72px); font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
  .hero h1 span { color: #e8562a; }
  .hero p { font-size: 18px; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 32px; }
  .hero-btn { display: inline-block; padding: 16px 36px; background: #e8562a; color: #fff; border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none; }
  .section { padding: 100px 40px; max-width: 1200px; margin: 0 auto; }
  .section h2 { font-size: 40px; font-weight: 800; margin-bottom: 16px; }
  .section p { font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.8; max-width: 600px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
  .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; }
  .card h3 { font-size: 20px; margin-bottom: 8px; color: #e8562a; }
  .card p { font-size: 14px; color: rgba(255,255,255,0.5); }
  .contact { background: #111; padding: 80px 40px; text-align: center; }
  .contact h2 { font-size: 36px; margin-bottom: 32px; }
  .contact form { max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
  .contact input, .contact textarea { padding: 14px 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #fff; font-size: 15px; }
  .contact button { padding: 16px; background: #e8562a; color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 16px; cursor: pointer; }
</style></head>
<body>
  <section class="hero">
    <div class="hero-content">
      <h1>Authentic Italian<br><span>Cuisine</span></h1>
      <p>Welcome to ${businessName || "our restaurant"}. We serve handmade pasta, wood-fired pizza, and timeless Italian dishes in the heart of downtown Manhattan since 1998.</p>
      <a href="#menu" class="hero-btn">View Our Menu</a>
    </div>
  </section>
  <section class="section">
    <h2>Our Specialties</h2>
    <p>Every dish tells a story of tradition, passion, and the finest ingredients.</p>
    <div class="grid">
      <div class="card"><h3>Handmade Pasta</h3><p>Fresh pasta made daily using traditional Italian techniques passed down for generations.</p></div>
      <div class="card"><h3>Wood-Fired Pizza</h3><p>Authentic Neapolitan pizza baked in our imported wood-fired oven at 900°F.</p></div>
      <div class="card"><h3>Fine Wine Selection</h3><p>Curated wines from the finest Italian vineyards to complement every meal.</p></div>
    </div>
  </section>
  <section class="section">
    <h2>About Us</h2>
    <p>Since 1998, we've been serving Manhattan with the authentic flavors of Italy. Our chefs bring decades of experience and a deep love for Italian culinary traditions to every plate.</p>
  </section>
  <div class="contact">
    <h2>Reserve a Table</h2>
    <form><input placeholder="Your Name" /><input placeholder="Email" /><input placeholder="Phone" /><textarea placeholder="Special requests..." rows="3"></textarea><button>Make Reservation</button></form>
  </div>
</body></html>`);
  }, [isMock, businessName]);

  const finalHtml = result?.html || html || mockHtml;

  return (
    <div className="gen-page">
      <AnimatePresence mode="wait">
        {/* ═══ LOADING STATE ═══ */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            className="gen-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
          >
            {/* Ambient background */}
            <div className="gen-bg">
              <div className="gen-bg-grid" />
              <div className="gen-bg-orb gen-bg-orb-1" />
              <div className="gen-bg-orb gen-bg-orb-2" />
              <div className="gen-bg-orb gen-bg-orb-3" />
            </div>

            <div className="gen-loading-content">
              {/* Big headline */}
              <motion.h1
                className="gen-headline"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                We're generating your site!
              </motion.h1>

              {/* Progress messages */}
              <div className="gen-messages">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={msgIndex}
                    className="gen-message"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="gen-message-icon">
                      {PROGRESS_MESSAGES[msgIndex].icon}
                    </span>
                    <span className="gen-message-text">
                      {PROGRESS_MESSAGES[msgIndex].text}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress section */}
              <div className="gen-progress-section">
                <div className="gen-progress-info">
                  <span className="gen-building-for">
                    Building{" "}
                    <span className="gen-building-name">
                      {businessName || "your website"}
                    </span>
                  </span>
                  <span className="gen-progress-pct">{Math.round(progress)}%</span>
                </div>
                <ProgressBar progress={progress} />
              </div>

              {/* Mini game */}
              <RunnerGame />

              {/* Time estimate */}
              <motion.p
                className="gen-time-note"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Hang tight — this usually takes 1-5 minutes.
              </motion.p>

              {/* Error state */}
              {error && (
                <motion.div
                  className="gen-error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="gen-error-text">
                    Something went wrong: {error}
                  </p>
                  <button className="gen-error-btn" onClick={handleBack}>
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ REVEAL STATE ═══ */}
        {phase === "reveal" && (
          <motion.div
            key="reveal"
            className="gen-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="gen-reveal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
            >
              <motion.h2
                className="gen-reveal-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Your website is{" "}
                <span className="gen-reveal-green">ready</span>
              </motion.h2>
              <motion.div
                className="gen-reveal-sparkles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                ✦ ✦ ✦
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ PREVIEW STATE ═══ */}
        {phase === "preview" && finalHtml && (
          <motion.div
            key="preview"
            className="gen-preview"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <SitePreview html={finalHtml} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* ═══ PAGE ═══ */
        .gen-page {
          position: fixed;
          inset: 0;
          background: #07051a;
          z-index: 9999;
          overflow: hidden;
        }

        /* ═══ LOADING STATE ═══ */
        .gen-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* Ambient background */
        .gen-bg { position: absolute; inset: 0; overflow: hidden; }
        .gen-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%);
        }
        .gen-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.35;
          animation: genOrbFloat 8s ease-in-out infinite;
        }
        .gen-bg-orb-1 {
          width: 700px; height: 700px;
          background: #5b50e8;
          top: -20%; left: -15%;
          animation-delay: 0s;
        }
        .gen-bg-orb-2 {
          width: 600px; height: 600px;
          background: #00C65A;
          bottom: -15%; right: -15%;
          animation-delay: -3s;
        }
        .gen-bg-orb-3 {
          width: 450px; height: 450px;
          background: #22d3ee;
          top: 35%; left: 55%;
          animation-delay: -5s;
          opacity: 0.2;
        }
        @keyframes genOrbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-30px, 40px) scale(0.92); }
        }

        .gen-loading-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          padding: 32px 24px;
          max-width: 820px;
          width: 100%;
        }

        /* ─ Mascot ─ */
        .gen-mascot-wrap {
          position: relative;
          width: 280px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gen-mascot {
          filter: drop-shadow(0 4px 24px rgba(255,255,255,0.12))
                  drop-shadow(0 0 50px rgba(91,80,232,0.15));
        }
        /* Back leg swings back as front leg swings forward — running stride */
        .gen-leg-back {
          animation: genLegBack 0.35s ease-in-out infinite;
          transform-origin: 132px 56px;
        }
        .gen-leg-front {
          animation: genLegFront 0.35s ease-in-out infinite;
          transform-origin: 155px 56px;
        }
        @keyframes genLegBack {
          0%   { transform: rotate(12deg); }
          50%  { transform: rotate(-12deg); }
          100% { transform: rotate(12deg); }
        }
        @keyframes genLegFront {
          0%   { transform: rotate(-12deg); }
          50%  { transform: rotate(12deg); }
          100% { transform: rotate(-12deg); }
        }
        .gen-dust {
          position: absolute;
          bottom: 6px;
          left: 45%;
          display: flex;
          gap: 4px;
        }
        .gen-dust-dot {
          width: 4px; height: 4px;
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
        }

        /* ─ Headline ─ */
        .gen-headline {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          color: #ffffff;
          text-align: center;
          letter-spacing: -1px;
          line-height: 1.15;
          margin: 0;
        }

        /* ─ Messages ─ */
        .gen-messages {
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gen-message {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .gen-message-icon { font-size: 26px; }
        .gen-message-text {
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
        }

        /* ─ Progress section ─ */
        .gen-progress-section {
          width: 100%;
          max-width: 540px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .gen-progress-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .gen-progress-pct {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #00C65A;
          font-variant-numeric: tabular-nums;
        }

        /* ─ Progress bar ─ */
        .gen-progress-track {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .gen-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #5b50e8, #00C65A);
          border-radius: 3px;
          box-shadow: 0 0 16px rgba(0,198,90,0.4);
        }

        /* ─ Building for ─ */
        .gen-building-for {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.45);
        }
        .gen-building-name {
          color: #00C65A;
          font-weight: 600;
        }

        /* ─ Time note ─ */
        .gen-time-note {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.25);
          text-align: center;
          line-height: 1.5;
        }

        /* ─ Runner game ─ */
        .gen-game-wrap {
          width: 100%;
          max-width: 800px;
          margin-top: 4px;
        }
        .gen-game-canvas {
          width: 100%;
          height: auto;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          display: block;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        /* ─ Error ─ */
        .gen-error {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .gen-error-text {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #ef4444;
        }
        .gen-error-btn {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 10px 24px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .gen-error-btn:hover { background: rgba(255,255,255,0.15); }

        /* ─ Orbit loader ─ */
        .gen-orbit {
          position: relative;
          width: 80px; height: 80px;
        }

        /* ═══ REVEAL STATE ═══ */
        .gen-reveal {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07051a;
        }
        .gen-reveal-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .gen-reveal-text {
          font-family: 'Sora', sans-serif;
          font-size: clamp(32px, 6vw, 56px);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -1px;
        }
        .gen-reveal-green {
          color: #00C65A;
          text-shadow: 0 0 40px rgba(0,198,90,0.5);
        }
        .gen-reveal-sparkles {
          font-size: 24px;
          color: #00C65A;
          letter-spacing: 12px;
        }

        /* ═══ PREVIEW STATE ═══ */
        .gen-preview {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: #0a0a12;
        }
        .gen-preview-wrap {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Toolbar */
        .gen-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #111119;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          gap: 16px;
        }
        .gen-toolbar-back {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .gen-toolbar-back:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .gen-toolbar-center {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gen-toolbar-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
        }
        .gen-toolbar-dot.green { background: #00C65A; box-shadow: 0 0 8px rgba(0,198,90,0.5); }
        .gen-toolbar-label {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }
        .gen-toolbar-actions { display: flex; gap: 8px; }
        .gen-toolbar-cta {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(91,80,232,0.4);
          transition: opacity 0.2s;
        }
        .gen-toolbar-cta:hover { opacity: 0.9; }

        /* Browser chrome */
        .gen-browser {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin: 16px 20px 20px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: #1a1a24;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .gen-browser-bar {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          background: #1e1e2a;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 12px;
        }
        .gen-browser-dots {
          display: flex; gap: 6px;
        }
        .gen-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }
        .gen-dot.red { background: #ff5f56; }
        .gen-dot.yellow { background: #ffbd2e; }
        .gen-dot.green { background: #27c93f; }
        .gen-browser-url {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.3);
          padding: 6px 12px;
          border-radius: 8px;
          max-width: 400px;
          margin: 0 auto;
        }
        .gen-url-lock { font-size: 11px; }
        .gen-url-text {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        .gen-browser-spacer { width: 52px; }

        .gen-iframe-wrap {
          flex: 1;
          position: relative;
          background: #fff;
        }
        .gen-iframe-reveal {
          width: 100%;
          height: 100%;
        }
        .gen-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        .gen-iframe-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: #07051a;
        }
        .gen-iframe-loading p {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 860px) {
          .gen-loading-content { max-width: 95vw; padding: 24px 16px; }
          .gen-game-wrap { max-width: 100%; }
          .gen-message-text { font-size: 17px; }
          .gen-progress-section { max-width: 90%; }
        }
        @media (max-width: 640px) {
          .gen-toolbar { padding: 10px 12px; }
          .gen-toolbar-cta { font-size: 12px; padding: 8px 14px; }
          .gen-toolbar-label { display: none; }
          .gen-browser { margin: 8px 8px 8px; border-radius: 10px; }
          .gen-browser-url { display: none; }
          .gen-browser-spacer { display: none; }
          .gen-message-text { font-size: 15px; }
          .gen-message-icon { font-size: 20px; }
          .gen-loading-content { gap: 20px; }
          .gen-headline { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}
