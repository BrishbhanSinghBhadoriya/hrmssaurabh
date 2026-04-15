"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Camera, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal";
import type { AxiosError } from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const router = useRouter();
  const { login } = useAuth();

  const startCamera = async () => {
    try {
      setCapturedImage(null);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  // Use effect to handle camera stream when isCameraActive changes
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const initCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera init error:", err);
          toast.error("Could not access camera.");
          setIsCameraActive(false);
        }
      }
    };
    
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  // Initial camera start
   useEffect(() => {
     startCamera();
   }, []);

   const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast.error("Video stream not ready. Please wait a moment.");
        return;
      }
      
      // Use natural video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image if it's the front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        
        setIsCameraActive(false);
      }
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!capturedImage) {
      toast.error("Please capture your photo for security verification");
      if (!isCameraActive) startCamera();
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(username, password, capturedImage);
      if (success) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      } 
    } catch (error) {
      console.error("💥 Login error:", error);
      const axiosErr = error as AxiosError<{ message?: string }>; 
      toast.error(axiosErr?.response?.data?.message || (error as any)?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center "
      style={{ backgroundImage: "url('/bg.jpg')" }} 
    >
      <Card className="w-full max-w-md shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm dark:bg-black">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto rounded-full overflow-hidden w-20 h-20 mb-4 shadow-md">
            <img
              src="/gcrg.jpeg"
              alt="Company Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome to HRMS
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-white">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Photo verification required</p>
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="mt-3 flex gap-2">
              {!isCameraActive && !capturedImage && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={startCamera}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" /> Start Camera
                </Button>
              )}
              
              {isCameraActive && (
                <Button 
                  type="button" 
                  variant="default" 
                  size="sm" 
                  onClick={captureImage}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Camera className="h-4 w-4" /> Capture Photo
                </Button>
              )}
              
              {capturedImage && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={retakeImage}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Retake
                </Button>
              )}
              
              {capturedImage && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="space-y-2 dark:space-y-2 dark:p-0 h-auto text-sm font-medium  ">
              <Label className="dark:text-primary" htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="dark:text-white"
                
                required
              />
            </div>
            <div className="space-y-2 dark:p-0 h-auto text-sm font-medium text-primary">
              <Label className="dark:text-primary font-medium" htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="dark:text-white"
              />
            </div>
            <div className="flex items-center justify-end px-1">
              <ForgotPasswordModal>
                <Button variant="link" className="p-0 h-auto text-sm font-medium text-primary hover:underline">
                  Forgot Password?
                </Button>
              </ForgotPasswordModal>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
