'use client';

import { useRef, useEffect, useState } from 'react';
import { useObjectDetection } from '@/hooks/useObjectDetection';
import { DetectedObject } from '@tensorflow-models/coco-ssd';

interface WebcamFeedProps {
  stream: MediaStream;
}

export default function WebcamFeed({ stream }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { detectObjects, isModelLoading } = useObjectDetection();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoPlay = () => {
      setIsVideoPlaying(true);
    };

    video.addEventListener('play', handleVideoPlay);
    return () => {
      video.removeEventListener('play', handleVideoPlay);
    };
  }, []);

  useEffect(() => {
    if (!isVideoPlaying || isModelLoading) return;

    let animationFrameId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const detectFrame = async () => {
      // Get predictions
      const predictions = await detectObjects(video);
      
      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw predictions
      predictions.forEach((prediction: DetectedObject) => {
        const [x, y, width, height] = prediction.bbox;
        
        // Draw bounding box
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label
        ctx.fillStyle = '#00FF00';
        ctx.font = '16px Arial';
        ctx.fillText(
          `${prediction.class} ${Math.round(prediction.score * 100)}%`,
          x,
          y > 10 ? y - 5 : 10
        );
      });

      animationFrameId = requestAnimationFrame(detectFrame);
    };

    detectFrame();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVideoPlaying, isModelLoading, detectObjects]);

  return (
    <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-black/5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        width={640}
        height={360}
      />
      {isModelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="text-sm text-white">Loading AI model...</div>
        </div>
      )}
    </div>
  );
} 