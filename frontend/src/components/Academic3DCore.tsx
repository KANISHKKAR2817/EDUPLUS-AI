import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const Academic3DCore: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for 3D interactive tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let rotationX = 0;
    let rotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      targetRotationY = (x / width) * 1.2;
      targetRotationX = -(y / height) * 1.2;
    };

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);

    // 1. Generate 3D Geodesic / Icosahedron Nodes (Student Data Nodes)
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      return [x / len, y / len, z / len];
    });

    // Subdivide edges for academic network density
    const edges: [number, number][] = [];
    for (let i = 0; i < baseVertices.length; i++) {
      for (let j = i + 1; j < baseVertices.length; j++) {
        const dist = Math.hypot(
          baseVertices[i][0] - baseVertices[j][0],
          baseVertices[i][1] - baseVertices[j][1],
          baseVertices[i][2] - baseVertices[j][2]
        );
        // Connect adjacent vertices in icosahedron (dist ~ 1.05)
        if (dist < 1.2) {
          edges.push([i, j]);
        }
      }
    }

    // 2. Generate floating academic particle field
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: (Math.random() - 0.5) * 2.8,
      y: (Math.random() - 0.5) * 2.8,
      z: (Math.random() - 0.5) * 2.8,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.004 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    let angle = 0;

    const render = () => {
      angle += 0.012;

      // Smooth lerp mouse rotation
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.32;
      const isDark = resolvedTheme === 'dark';

      // Colors based on active theme
      const primaryColor = isDark ? '#22d3ee' : '#2563eb';   // Cyan / Blue
      const secondaryColor = isDark ? '#a78bfa' : '#7c3aed'; // Violet
      const edgeColor = isDark ? 'rgba(96, 165, 250, 0.28)' : 'rgba(37, 99, 235, 0.24)';
      const coreGlow = isDark ? 'rgba(34, 211, 238, 0.15)' : 'rgba(37, 99, 235, 0.12)';

      // 3. Draw Ambient Glow Backdrop behind core
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius * 1.4);
      glowGrad.addColorStop(0, coreGlow);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Helper 3D rotation projection
      const project = (x: number, y: number, z: number, scale = 1): [number, number, number] => {
        // Yaw
        const radY = angle + rotationY;
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Pitch
        const radX = 0.4 + rotationX;
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective division
        const fov = 3.2;
        const pz = z2 + fov;
        const px = centerX + (x1 / pz) * radius * scale;
        const py = centerY + (y2 / pz) * radius * scale;

        return [px, py, z2];
      };

      // 4. Draw Floating Orbital Ring 1
      ctx.beginPath();
      const ringSteps = 40;
      for (let i = 0; i <= ringSteps; i++) {
        const theta = (i / ringSteps) * Math.PI * 2;
        const rx = Math.cos(theta) * 1.25;
        const ry = Math.sin(theta) * 0.35;
        const rz = Math.sin(theta) * 1.25;
        const [px, py] = project(rx, ry, rz);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = isDark ? 'rgba(167, 139, 250, 0.35)' : 'rgba(124, 58, 237, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Project vertices
      const projectedVertices = baseVertices.map(([vx, vy, vz]) => project(vx, vy, vz));

      // 6. Draw Network Edges
      ctx.lineWidth = 1;
      edges.forEach(([i, j]) => {
        const [x1, y1, z1] = projectedVertices[i];
        const [x2, y2, z2] = projectedVertices[j];
        const avgZ = (z1 + z2) / 2;
        const alpha = Math.max(0.1, (avgZ + 1) * 0.5);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isDark
          ? `rgba(96, 165, 250, ${alpha * 0.5})`
          : `rgba(37, 99, 235, ${alpha * 0.4})`;
        ctx.stroke();
      });

      // 7. Draw Student Data Beacons (Vertices)
      projectedVertices.forEach(([px, py, pz], idx) => {
        const depthAlpha = Math.max(0.2, (pz + 1) * 0.5);
        const nodeSize = 3 + (pz + 1) * 1.5;

        // Glowing outer halo for key nodes
        if (idx % 3 === 0) {
          ctx.beginPath();
          ctx.arc(px, py, nodeSize * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(34, 211, 238, ${depthAlpha * 0.25})`
            : `rgba(37, 99, 235, ${depthAlpha * 0.2})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? primaryColor : secondaryColor;
        ctx.shadowColor = idx % 2 === 0 ? primaryColor : secondaryColor;
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 8. Draw Central Pulsing Core
      const pulse = 1 + Math.sin(angle * 2) * 0.08;
      const [coreX, coreY] = project(0, 0, 0);
      const coreGrad = ctx.createRadialGradient(coreX, coreY, 2, coreX, coreY, 18 * pulse);
      coreGrad.addColorStop(0, isDark ? '#ffffff' : '#38bdf8');
      coreGrad.addColorStop(0.5, isDark ? '#22d3ee' : '#2563eb');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreX, coreY, 18 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 9. Floating Background Constellation Particles
      particles.forEach((p) => {
        p.x += Math.sin(angle + p.phase) * p.speed;
        p.y += Math.cos(angle + p.phase) * p.speed;
        const [px, py, pz] = project(p.x, p.y, p.z);
        const pAlpha = Math.max(0.1, (pz + 1.5) * 0.3);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${pAlpha * 0.6})`
          : `rgba(99, 102, 241, ${pAlpha * 0.5})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resolvedTheme]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center pointer-events-auto select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
