import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const logoWrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const stage = stageRef.current;
    const logoWrap = logoWrapRef.current;
    
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const N = 70;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!reduceMotion) {
        pts.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx.strokeStyle = `rgba(88,182,231,${(1 - d / 130) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(164,205,237,0.7)';
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(tick);
    };
    
    tick();

    const handleMouseMove = (e) => {
      if (!reduceMotion && logoWrap) {
        const rect = stage.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        logoWrap.style.transform = `translate(-50%,-50%) translate(${relX * -18}px, ${relY * -18}px)`;
      }
    };

    if (!reduceMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="animated-bg-stage" ref={stageRef}>
      <canvas id="animated-bg-net" ref={canvasRef}></canvas>
      <div className="animated-bg-glow"></div>

      <div className="animated-bg-logo-wrap" ref={logoWrapRef}>
        <svg viewBox="0 0 405 269" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ISITCom logo">
          <circle className="animated-bg-ping p1" cx="281" cy="70" r="20" />
          <circle className="animated-bg-ping p2" cx="281" cy="70" r="20" />
          <circle className="animated-bg-ping p3" cx="281" cy="70" r="20" />

          <path d="M 7.00,236.00 L 20.00,249.00 L 35.00,252.00 L 36.00,254.00 L 117.00,254.00 L 117.00,242.00 L 37.00,241.00 L 25.00,234.00 L 17.00,224.00 L 12.00,212.00 L 13.00,41.00 L 19.00,28.00 L 32.00,16.00 L 47.00,12.00 L 333.00,12.00 L 344.00,16.00 L 370.00,16.00 L 361.00,7.00 L 346.00,1.00 L 34.00,1.00 L 19.00,7.00 L 7.00,19.00 L 2.00,35.00 L 2.00,220.00 Z" fill="#0080C7" />
          <path d="M 326.00,178.00 L 328.00,240.00 L 337.00,256.00 L 349.00,264.00 L 397.00,266.00 L 397.00,233.00 L 369.00,233.00 L 360.00,226.00 L 358.00,218.00 L 358.00,178.00 Z M 127.00,175.00 L 127.00,256.00 L 156.00,256.00 L 156.00,175.00 Z M 174.00,124.00 L 173.00,138.00 L 176.00,150.00 L 212.00,202.00 L 213.00,212.00 L 209.00,221.00 L 204.00,225.00 L 167.00,226.00 L 167.00,256.00 L 205.00,256.00 L 219.00,253.00 L 235.00,241.00 L 241.00,230.00 L 244.00,217.00 L 241.00,192.00 L 231.00,173.00 L 208.00,143.00 L 204.00,132.00 L 205.00,124.00 Z M 127.00,124.00 L 127.00,153.00 L 156.00,153.00 L 156.00,124.00 Z M 320.00,124.00 L 320.00,153.00 L 401.00,153.00 L 401.00,120.00 L 328.00,120.00 Z" fill="#0060B1" />
          <path d="M 299.00,132.00 L 262.00,140.00 L 262.00,260.00 L 299.00,260.00 Z M 388.00,34.00 L 383.00,36.00 L 387.00,41.00 L 379.00,67.00 L 382.00,72.00 L 386.00,71.00 L 382.00,66.00 L 390.00,41.00 L 390.00,35.00 Z M 372.00,34.00 L 366.00,37.00 L 369.00,42.00 L 362.00,71.00 L 365.00,70.00 L 369.00,52.00 L 376.00,42.00 L 372.00,43.00 Z M 355.00,34.00 L 350.00,37.00 L 352.00,41.00 L 344.00,71.00 L 348.00,71.00 L 351.00,52.00 L 360.00,41.00 L 356.00,45.00 L 354.00,44.00 Z" fill="#0072BD" />
          <path d="M 311.000,70.000 C 311.000,86.569 297.569,100.000 281.000,100.000 C 264.431,100.000 251.000,86.569 251.000,70.000 C 251.000,53.431 264.431,40.000 281.000,40.000 C 297.569,40.000 311.000,53.431 311.000,70.000 Z" fill="#58B6E7" />
          <path d="M 305.000,70.000 C 305.000,83.255 294.255,94.000 281.000,94.000 C 267.745,94.000 257.000,83.255 257.000,70.000 C 257.000,56.745 267.745,46.000 281.000,46.000 C 294.255,46.000 305.000,56.745 305.000,70.000 Z" fill="#7CC1EB" />
          <path d="M 299.000,70.000 C 299.000,79.941 290.941,88.000 281.000,88.000 C 271.059,88.000 263.000,79.941 263.000,70.000 C 263.000,60.059 271.059,52.000 281.000,52.000 C 290.941,52.000 299.000,60.059 299.000,70.000 Z" fill="#A4CDED" />
          <path d="M 293.000,70.000 C 293.000,76.627 287.627,82.000 281.000,82.000 C 274.373,82.000 269.000,76.627 269.000,70.000 C 269.000,63.373 274.373,58.000 281.000,58.000 C 287.627,58.000 293.000,63.373 293.000,70.000 Z" fill="#C3DFF4" />
          <path d="M 287.000,70.000 C 287.000,73.314 284.314,76.000 281.000,76.000 C 277.686,76.000 275.000,73.314 275.000,70.000 C 275.000,66.686 277.686,64.000 281.000,64.000 C 284.314,64.000 287.000,66.686 287.000,70.000 Z" fill="#ECF2F8" />
          <path d="M 283.000,68.500 C 283.000,70.433 281.433,72.000 279.500,72.000 C 277.567,72.000 276.000,70.433 276.000,68.500 C 276.000,66.567 277.567,65.000 279.500,65.000 C 281.433,65.000 283.000,66.567 283.000,68.500 Z" fill="#FFFFFF" />

          <g className="animated-bg-rays">
            <path d="M 394.00,68.00 L 370.00,88.00 L 348.00,101.00 L 297.00,119.00 L 267.00,124.00 L 249.00,122.00 L 237.00,112.00 L 236.00,97.00 L 240.00,88.00 L 236.00,75.00 L 223.00,87.00 L 214.00,100.00 L 210.00,121.00 L 217.00,132.00 L 235.00,138.00 L 265.00,137.00 L 304.00,128.00 L 331.00,117.00 L 356.00,103.00 L 380.00,85.00 Z M 246.00,68.00 L 243.00,70.00 L 245.00,84.00 L 248.00,81.00 Z M 303.00,40.00 L 307.00,44.00 L 311.00,42.00 L 308.00,39.00 Z M 335.00,32.00 L 314.00,37.00 L 318.00,39.00 Z" fill="#F79418" />
            <path d="M 388.00,34.00 L 383.00,36.00 L 387.00,41.00 L 381.00,59.00 L 381.00,65.00 L 379.00,67.00 L 379.00,70.00 L 382.00,72.00 L 386.00,71.00 L 382.00,66.00 L 390.00,41.00 L 390.00,35.00 Z M 372.00,34.00 L 366.00,37.00 L 369.00,39.00 L 362.00,71.00 L 365.00,70.00 L 369.00,52.00 L 376.00,42.00 L 372.00,43.00 Z M 355.00,34.00 L 350.00,37.00 L 352.00,41.00 L 344.00,71.00 L 348.00,71.00 L 351.00,52.00 L 360.00,41.00 L 356.00,45.00 L 354.00,44.00 Z" fill="#0072BD" />
          </g>

          <path d="M 326.000,70.000 C 326.000,94.853 305.853,115.000 281.000,115.000 C 256.147,115.000 236.000,94.853 236.000,70.000 C 236.000,45.147 256.147,25.000 281.000,25.000 C 305.853,25.000 326.000,45.147 326.000,70.000 Z M 321.500,70.000 C 321.500,92.368 303.368,110.500 281.000,110.500 C 258.632,110.500 240.500,92.368 240.500,70.000 C 240.500,47.632 258.632,29.500 281.000,29.500 C 303.368,29.500 321.500,47.632 321.500,70.000 Z" fill="#0072BD" fillRule="evenodd" />
        </svg>
      </div>

      <div className="animated-bg-vignette"></div>
    </div>
  );
}
