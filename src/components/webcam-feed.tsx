'use client';

import { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { usePoseDetection } from '@/hooks/use-pose-detection';
import KickCounter from './kick-counter';

interface WebcamFeedProps {
  stream: MediaStream;
}

export default function WebcamFeed({ stream }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const {
    detectPose,
    isModelLoading,
    kickCount,
    resetCount
  } = usePoseDetection();

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
      const poses = await detectPose(video);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw skeleton
      poses.forEach(pose => {
        drawSkeleton(ctx, pose);
      });

      animationFrameId = requestAnimationFrame(detectFrame);
    };

    detectFrame();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVideoPlaying, isModelLoading, detectPose]);

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
      <KickCounter
        count={kickCount}
        onReset={resetCount}
      />
      {isModelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="text-sm text-white">Loading AI model...</div>
        </div>
      )}
    </div>
  );
}

function drawSkeleton(ctx: CanvasRenderingContext2D, pose: poseDetection.Pose) {
  // Draw points
  pose.keypoints.forEach(keypoint => {
    if (keypoint.score && keypoint.score > 0.3) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#00FF00';
      ctx.fill();
    }
  });

  // Draw lines between connected joints
  const connections = [
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['left_shoulder', 'left_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['right_shoulder', 'right_hip'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
    ['left_shoulder', 'right_shoulder'],
    ['left_hip', 'right_hip']
  ];

  connections.forEach(([from, to]) => {
    const fromPoint = pose.keypoints.find(kp => kp.name === from);
    const toPoint = pose.keypoints.find(kp => kp.name === to);

    if (fromPoint && toPoint && fromPoint.score && toPoint.score &&
        fromPoint.score > 0.3 && toPoint.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.lineTo(toPoint.x, toPoint.y);
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
} 