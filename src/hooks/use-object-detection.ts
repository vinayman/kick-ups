'use client';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useEffect, useState } from 'react';

export function useObjectDetection() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // Using a lighter model for better performance
        });
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading COCO-SSD model:', error);
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, []);

  const detectObjects = async (video: HTMLVideoElement) => {
    if (!model || !video) return [];

    try {
      const predictions = await model.detect(video);
      return predictions;
    } catch (error) {
      console.error('Error detecting objects:', error);
      return [];
    }
  };

  return { detectObjects, isModelLoading };
} 