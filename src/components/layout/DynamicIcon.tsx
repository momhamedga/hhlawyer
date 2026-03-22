'use client';

import { useEffect } from "react";

export default function DynamicFavicon() {
  useEffect(() => {
    // التأكد من وجود الـ Link Tag في الـ Head
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    let step = 0;

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, 32, 32);

      // 1. حساب النبض (Pulse)
      const pulse = 0.6 + Math.sin(step) * 0.4;
      const opacity = (Math.sin(step) + 1) / 2;

      // 2. رسم هالة النيون الخلفية
      const glow = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      glow.addColorStop(0, `rgba(212, 175, 55, ${0.2 * opacity})`);
      glow.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 32, 32);

      // 3. رسم حرف H (البراند)
      ctx.font = 'bold 22px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // ظل نيون للحرف
      ctx.shadowBlur = 8 * pulse;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      
      ctx.fillStyle = `rgba(212, 175, 55, ${pulse})`;
      ctx.fillText('H', 16, 17);

      // 4. نقطة الحالة (Active Status Dot)
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(26, 8, 2.5 * opacity, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();

      // تحديث الأيقونة
      link.href = canvas.toDataURL('image/png');

      step += 0.05; // سرعة النبض
      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return null;
}