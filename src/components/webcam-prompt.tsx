'use client';

import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useState } from "react";
import WebcamFeed from "./webcam-feed";

export default function WebcamPrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleStartWebcam = async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          facingMode: 'environment'
        }
      });
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full transition-all duration-500 ease-in-out">
      <h1 
        className={`text-4xl font-bold tracking-tight transition-all duration-500 ${
          stream ? 'transform -translate-y-16' : ''
        }`}
      >
        Kick Ups Counter
      </h1>
      
      {!stream && (
        <p className="text-muted-foreground max-w-[500px] text-center transition-opacity duration-500">
          Use your webcam to count your kick ups! Position yourself in view of the camera
          and start juggling. Our AI will track your progress.
        </p>
      )}

      {!stream ? (
        <Button
          size="lg"
          onClick={handleStartWebcam}
          disabled={isLoading}
          className="mt-4 cursor-pointer transition-all duration-200 hover:scale-105"
        >
          {isLoading ? (
            <span className="animate-pulse">Accessing Camera...</span>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </>
          )}
        </Button>
      ) : (
        <div className="w-full transition-all duration-500 ease-in-out flex flex-col items-center justify-center">
          <WebcamFeed stream={stream} />
        </div>
      )}
    </div>
  );
} 