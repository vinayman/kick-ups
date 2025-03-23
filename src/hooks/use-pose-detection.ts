'use client';

import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseKickDetectionReturn {
  detectPose: (video: HTMLVideoElement) => Promise<poseDetection.Pose[]>;
  isModelLoading: boolean;
  kickCount: number;
  resetCount: () => void;
}

export function usePoseDetection(): UseKickDetectionReturn {
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [kickCount, setKickCount] = useState(0);
  const [isKickInProgress, setIsKickInProgress] = useState(false);
  const KICK_THRESHOLD = 10; // Minimum vertical movement to count as kick (in pixels)
  const COOLDOWN_FRAMES = 5; // Frames to wait before detecting next kick
  const [cooldown, setCooldown] = useState(0);

  // Use refs to persist values between renders
  const lastFootPositionRef = useRef<number | null>(null);
  const debugFrameCount = useRef(0);

  useEffect(() => {
    async function initializeDetector() {
      try {
        await tf.ready();
        const model = poseDetection.SupportedModels.MoveNet;
        const detector = await poseDetection.createDetector(model, {
          modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
          enableSmoothing: true,
        });
        setDetector(detector);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error initializing pose detector:', error);
        setIsModelLoading(false);
      }
    }
    initializeDetector();

    return () => {
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

  const detectPose = useCallback(async (video: HTMLVideoElement) => {
    if (!detector) return [];
    
    const poses = await detector.estimatePoses(video);
    if (poses.length > 0) {
      analyzeKickUp(poses[0]);
    }
    return poses;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detector]);

  const analyzeKickUp = (pose: poseDetection.Pose) => {
    // We'll track both feet to detect kicks from either foot
    const rightAnkle = pose.keypoints.find(kp => kp.name === 'right_ankle');
    const leftAnkle = pose.keypoints.find(kp => kp.name === 'left_ankle');
    
    if (cooldown > 0) {
      setCooldown(prev => prev - 1);
      return;
    }

    if (rightAnkle?.score && rightAnkle.score > 0.3 && leftAnkle?.score && leftAnkle.score > 0.3) {
      const currentFootPosition = Math.min(rightAnkle.y, leftAnkle.y); // Use the higher foot

      // Debug logging every 30 frames
      debugFrameCount.current += 1;
      if (debugFrameCount.current % 30 === 0) {
        console.log('Current foot position:', currentFootPosition);
        console.log('Last foot position:', lastFootPositionRef.current);
      }

      if (lastFootPositionRef.current !== null) {
        const verticalMovement = lastFootPositionRef.current - currentFootPosition;

        // Debug logging for significant movements
        if (Math.abs(verticalMovement) > KICK_THRESHOLD) {
          console.log('Vertical movement:', verticalMovement);
          console.log('Is kick in progress:', isKickInProgress);
        }

        // Detect start of kick (upward movement)
        if (Math.abs(verticalMovement) > KICK_THRESHOLD && !isKickInProgress) {
          console.log('Kick started!');
          setIsKickInProgress(true);
          setKickCount(prev => prev + 1);
        }
        // Detect completion of kick (downward movement after upward movement)
        else if (verticalMovement < -KICK_THRESHOLD && isKickInProgress) {
          console.log('Kick completed!');
          setKickCount(prev => prev + 1);
          setIsKickInProgress(false);
          setCooldown(COOLDOWN_FRAMES);
        }
      }

      lastFootPositionRef.current = currentFootPosition;
    } else {
      // Reset if we lose track of the feet
      lastFootPositionRef.current = null;
    }
  };

  const resetCount = useCallback(() => {
    setKickCount(0);
    lastFootPositionRef.current = null;
    setIsKickInProgress(false);
    setCooldown(0);
  }, []);

  return {
    detectPose,
    isModelLoading,
    kickCount,
    resetCount
  };
}
