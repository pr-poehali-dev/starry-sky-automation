import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface Module {
  id: string;
  name: string;
  x: number;
  y: number;
  isActive: boolean;
}

interface StarFieldProps {
  modules: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  onModuleClick?: (id: string) => void;
}

const StarField = ({ modules, onModuleClick }: StarFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stars] = useState<Star[]>(() => 
    Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2,
      opacity: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
    }))
  );

  const [modulePositions] = useState<Module[]>(() => {
    const positions: Module[] = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.3;

    modules.forEach((module, index) => {
      const angle = (index / modules.length) * Math.PI * 2;
      positions.push({
        ...module,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });

    return positions;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      stars.forEach((star) => {
        star.opacity = 0.3 + Math.sin(time * star.speed) * 0.7;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155, 135, 245, ${star.opacity})`;
        ctx.fill();
      });

      modulePositions.forEach((module, index) => {
        const pulse = Math.sin(time * 2 + index) * 0.3 + 0.7;
        const size = module.isActive ? 8 : 5;

        ctx.beginPath();
        ctx.arc(module.x, module.y, size * pulse, 0, Math.PI * 2);
        
        if (module.isActive) {
          const gradient = ctx.createRadialGradient(
            module.x, module.y, 0,
            module.x, module.y, size * pulse * 2
          );
          gradient.addColorStop(0, 'rgba(217, 70, 239, 1)');
          gradient.addColorStop(0.5, 'rgba(155, 135, 245, 0.6)');
          gradient.addColorStop(1, 'rgba(155, 135, 245, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(module.x, module.y, size, 0, Math.PI * 2);
        ctx.fillStyle = module.isActive 
          ? 'rgba(217, 70, 239, 1)' 
          : 'rgba(155, 135, 245, 0.5)';
        ctx.fill();

        if (module.isActive) {
          ctx.strokeStyle = 'rgba(217, 70, 239, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      modulePositions.forEach((module1, i) => {
        if (!module1.isActive) return;
        
        modulePositions.forEach((module2, j) => {
          if (i >= j || !module2.isActive) return;
          
          const distance = Math.sqrt(
            Math.pow(module1.x - module2.x, 2) + 
            Math.pow(module1.y - module2.y, 2)
          );
          
          if (distance < 300) {
            const opacity = (1 - distance / 300) * 0.3;
            ctx.beginPath();
            ctx.moveTo(module1.x, module1.y);
            ctx.lineTo(module2.x, module2.y);
            ctx.strokeStyle = `rgba(155, 135, 245, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      modulePositions.forEach((module) => {
        const distance = Math.sqrt(
          Math.pow(clickX - module.x, 2) + 
          Math.pow(clickY - module.y, 2)
        );

        if (distance < 20 && onModuleClick) {
          onModuleClick(module.id);
        }
      });
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [modules, modulePositions, stars, onModuleClick]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-pointer"
        style={{ zIndex: 1 }}
      />
      {modulePositions.map((module) => (
        <div
          key={module.id}
          className="absolute pointer-events-none text-xs font-medium text-white/80 whitespace-nowrap"
          style={{
            left: `${module.x}px`,
            top: `${module.y - 25}px`,
            transform: 'translateX(-50%)',
            zIndex: 2,
            textShadow: '0 0 10px rgba(0,0,0,0.8)',
          }}
        >
          {module.name}
        </div>
      ))}
    </>
  );
};

export default StarField;
