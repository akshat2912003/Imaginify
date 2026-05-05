"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";
import { updateCredits } from "@/lib/actions/user.actions";
import { creditFee } from "@/constants";

const EXAMPLE_PROMPTS = [
  "A majestic lion sitting on a rock during golden sunset in African savanna",
  "A futuristic city with flying cars and neon lights at night, cyberpunk style",
  "A cozy coffee shop in Paris with rain outside the window, warm lighting",
  "An astronaut riding a horse on the moon, ultra realistic photo",
  "A beautiful Indian woman in traditional saree standing in a blooming garden",
  "A dragon made of fire flying over a medieval castle at dusk",
];

type Props = {
  userId: string;
  creditBalance: number;
};

const TextToImageForm = ({ userId, creditBalance }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<"image" | "description" | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", description: "Describe what image you want to generate", className: "error-toast" });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setImageDescription(null);

    try {
      // Deduct credit
      await updateCredits(userId, creditFee);

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "text-to-image", prompt }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to generate image");

      if (data.type === "image") {
        setResponseType("image");
        setGeneratedImage(`data:${data.mimeType};base64,${data.imageBase64}`);
        toast({ title: "Image Generated! ✨", description: "Your AI image is ready!", className: "success-toast" });
      } else if (data.type === "description") {
        setResponseType("description");
        setImageDescription(data.description);
        toast({ title: "Description Ready!", description: "Gemini described your image concept", className: "success-toast" });
      }
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Please try again", className: "error-toast" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = `imaginify-generated-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}

      {/* Prompt Input */}
      <div className="space-y-3">
        <label className="text-dark-600 font-semibold text-base">
          Describe your image
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A beautiful sunset over the Taj Mahal with golden colors, ultra realistic photography..."
          className="w-full min-h-[120px] rounded-[16px] border-2 border-purple-200/20 shadow-sm shadow-purple-200/15 text-dark-600 p-4 text-base focus:outline-none focus:border-purple-400 resize-none"
          rows={4}
        />
        <p className="text-sm text-dark-400">
          💡 Tip: Be specific! Include style, mood, colors, and setting for best results.
        </p>
      </div>

      {/* Example Prompts */}
      <div className="space-y-3">
        <p className="text-dark-600 font-semibold text-sm">✨ Try these example prompts:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((exPrompt) => (
            <button
              key={exPrompt}
              onClick={() => setPrompt(exPrompt)}
              className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-600 px-3 py-2 rounded-full transition-all border border-purple-200 text-left"
            >
              {exPrompt.substring(0, 45)}...
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="submit-button w-full"
      >
        {isGenerating ? (
          <span className="flex items-center gap-3">
            <span className="animate-spin text-xl">⟳</span>
            Generating with Gemini AI... Please wait
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🎨 Generate Image (1 Credit)
          </span>
        )}
      </Button>

      {/* Generated Image Result */}
      {responseType === "image" && generatedImage && (
        <div className="space-y-4">
          <div className="flex-between">
            <h3 className="h3-bold text-dark-600">Generated Image ✨</h3>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 text-purple-500 hover:text-purple-700 font-medium text-sm transition-colors"
            >
              ⬇️ Download
            </button>
          </div>
          <div className="rounded-[16px] overflow-hidden border-2 border-purple-200/20 shadow-lg">
            <img
              src={generatedImage}
              alt="AI Generated"
              className="w-full object-contain"
            />
          </div>
          <p className="text-sm text-dark-400 text-center">
            Prompt: <span className="text-purple-500 italic">"{prompt}"</span>
          </p>
        </div>
      )}

      {/* Description Result (fallback when Imagen not available) */}
      {responseType === "description" && imageDescription && (
        <div className="space-y-4">
          <h3 className="h3-bold text-dark-600">🤖 AI Image Concept</h3>
          <div className="rounded-[16px] border-2 border-purple-200/20 bg-purple-50 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎨</span>
              <p className="font-semibold text-purple-600">Your prompt: "{prompt}"</p>
            </div>
            <div className="prose text-dark-600 whitespace-pre-line leading-relaxed">
              {imageDescription}
            </div>
            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <p className="text-sm text-purple-700">
                💡 <strong>Note:</strong> Full image generation requires Google Imagen API access (currently in limited preview). 
                Above is Gemini's detailed description of what your image would look like.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-[16px] border-2 border-purple-200/20 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <h4 className="font-semibold text-dark-600 mb-3">🤖 Powered by Google Gemini AI</h4>
        <ul className="space-y-2 text-sm text-dark-400">
          <li>✅ Describe any scene, object, or concept</li>
          <li>✅ Supports realistic photos, artwork, illustrations</li>
          <li>✅ Works best with detailed, specific prompts</li>
          <li>✅ Each generation costs 1 credit</li>
          <li>✅ Download your generated images</li>
        </ul>
      </div>
    </div>
  );
};

export default TextToImageForm;
