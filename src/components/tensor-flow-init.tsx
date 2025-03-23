'use client';

import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export default function TensorFlowInit({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        setIsInitialized(true);
        console.log('TensorFlow.js initialized successfully');
      } catch (error) {
        console.error('Error initializing TensorFlow.js:', error);
      }
    };

    initializeTensorFlow();
  }, []);

  if (!isInitialized) {
    return <></>;
  }

  return <>{children}</>;
}