"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { updateCredits } from "@/lib/actions/user.actions";
import { creditFee } from "@/constants";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

type Props = {
  userId: string;
  creditBalance: number;
};

const ImageAnalyzerForm = ({ userId, creditBalance }: Props) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 10MB", className: "error-toast" });
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !selectedFile) {
      toast({ title: "No image selected", description: "Please upload an image first", className: "error-toast" });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      await updateCredits(userId, creditFee);

      const base64 = selectedImage.split(",")[1];
      const mimeType = selectedFile.type || "image/jpeg";

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze-image",
          imageBase64: base64,
          mimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setAnalysis(data.analysis);
      toast({ title: "Analysis Complete! 🔍", description: "Gemini AI has analyzed your image", className: "success-toast" });
    } catch (error: any) {
      toast({ title: "Analysis Failed", description: error.message || "Please try again", className: "error-toast" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatAnalysis = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("##") || line.match(/^\d\./)) {
        return (
          <p key={i} className="font-bold text-dark-600 mt-4 mb-1 text-base">
            {line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={i} className="text-dark-400 mb-1">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-dark-600">{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-dark-400 mb-1 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="space-y-8">
      {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}

      {/* Upload Area */}
      <div className="space-y-3">
        <label className="text-dark-600 font-semibold text-base">
          Upload Image to Analyze
        </label>

        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-64 rounded-[16px] border-2 border-dashed border-purple-300 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-all"
          >
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-dark-600 font-semibold text-lg">Click to upload image</p>
            <p className="text-dark-400 text-sm mt-2">Supports JPG, PNG, WEBP (max 10MB)</p>
            <p className="text-purple-500 text-sm mt-1">Powered by Google Gemini Vision AI</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-[16px] overflow-hidden border-2 border-purple-200/20 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Selected for analysis"
                className="w-full max-h-96 object-contain bg-gray-50"
              />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-dark-400 text-center">
              📁 {selectedFile?.name} ({((selectedFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !selectedImage}
        className="submit-button w-full"
      >
        {isAnalyzing ? (
          <span className="flex items-center gap-3">
            <span className="animate-spin text-xl">⟳</span>
            Gemini AI is analyzing... Please wait
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🔍 Analyze Image (1 Credit)
          </span>
        )}
      </Button>

      {/* Analysis Result */}
      {analysis && (
        <div className="space-y-4">
          <div className="flex-between">
            <h3 className="h3-bold text-dark-600">🤖 Gemini AI Analysis</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysis);
                toast({ title: "Copied!", description: "Analysis copied to clipboard" });
              }}
              className="text-purple-500 hover:text-purple-700 text-sm font-medium transition-colors"
            >
              📋 Copy
            </button>
          </div>

          <div className="rounded-[16px] border-2 border-purple-200/20 bg-white p-6 shadow-lg space-y-2">
            {formatAnalysis(analysis)}
          </div>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full rounded-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            🔄 Analyze Another Image
          </Button>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-[16px] border-2 border-purple-200/20 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <h4 className="font-semibold text-dark-600 mb-3">🔍 What Gemini AI Can Tell You</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-dark-400">
          <p>📸 Overall description of the image</p>
          <p>🎯 Main subject and focus</p>
          <p>🌈 Colors, mood and atmosphere</p>
          <p>📍 Setting and background details</p>
          <p>🔍 All key objects in the scene</p>
          <p>💡 Unique and interesting details</p>
          <p>🎨 Photography style and technique</p>
          <p>⭐ Image quality rating</p>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzerForm;
