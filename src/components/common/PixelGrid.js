import React, { useEffect, useRef } from 'react';
import './PixelGrid.css';

const PixelGrid = ({ colors }) => {
  const canvasRef = useRef(null);
  
  // Default colors if none provided
  const defaultColors = {
    primary: '#11465d',
    secondary: '#fcdd5abb',
    background: '#0a2c3d'
  };
  
  // Use provided colors or defaults
  const themeColors = colors || defaultColors;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full size of parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Pixel grid properties
    const pixelSize = 16;
    const cols = Math.ceil(canvas.width / pixelSize);
    const rows = Math.ceil(canvas.height / pixelSize);
    
    // Create pixel grid with random heights
    const pixels = [];
    for (let i = 0; i < cols; i++) {
      pixels[i] = [];
      for (let j = 0; j < rows; j++) {
        pixels[i][j] = {
          x: i * pixelSize,
          y: j * pixelSize,
          height: Math.random(),
          speed: 0.5 + Math.random() * 4.5,
          offset: Math.random() * Math.PI * 2
        };
      }
    }
    
    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = themeColors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw pixels
      const time = Date.now() / 1000;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const pixel = pixels[i][j];
          
          // Calculate wave effect
          const wave = Math.sin(time * pixel.speed + pixel.offset) * 0.5 + 0.5;
          const height = pixel.height * wave;
          
          // Determine color based on height
          if (height > 0.7) {
            ctx.fillStyle = themeColors.secondary;
          } else if (height > 0.4) {
            ctx.fillStyle = themeColors.primary;
          } else {
            // Skip drawing the lowest pixels for a sparse effect
            continue;
          }
          
          // Draw pixel
          ctx.fillRect(pixel.x, pixel.y, pixelSize - 1, pixelSize - 1);
        }
      }
      
      // Continue animation
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [themeColors]);
  
  return (
    <div className="pixel-grid-container">
      <canvas ref={canvasRef} className="pixel-grid-canvas"></canvas>
    </div>
  );
};

export default PixelGrid;
