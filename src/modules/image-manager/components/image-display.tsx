// renderer/components/ImageDisplay.tsx
import { AlertCircle, ImageIcon, ShoppingBagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ImageApiService from "../images-service";

type Props = {
  filename?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  onError?: () => void;
  onLoad?: () => void;
  isProductImage?: boolean;
};

type LoadingStatus = "idle" | "loading" | "success" | "error";

export function ImageDisplay({
  filename,
  alt = "Image",
  className = "w-full h-full object-cover",
  fallbackClassName = "w-24 h-24 text-gray-300",
  onError,
  onLoad,
  isProductImage = false
}: Props) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) {
      setImageData(null);
      setStatus("idle");
      setError(null);
      return;
    }

    loadImage(filename);
  }, [filename]);

  const loadImage = async (filename: string) => {
    try {
      setStatus("loading");
      setError(null);

      const base64Data = await ImageApiService.getAsBase64(filename);

      if (base64Data) {
        setImageData(base64Data);
        setStatus("success");
        onLoad?.();
      } else {
        throw new Error("Image not found");
      }
    } catch (err) {
      console.error("Failed to load image:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load image";
      setError(errorMessage);
      setStatus("error");
      setImageData(null);
      onError?.();
    }
  };

  const handleImageError = () => {
    setStatus("error");
    setError("Failed to display image");
    onError?.();
  };

  const handleImageLoad = () => {
    setStatus("success");
    onLoad?.();
  };

  // No filename provided
  if (!filename) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${fallbackClassName}`}
      >
        {isProductImage ? (
          <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${fallbackClassName}`}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Error state
  if (status === "error") {
    if (isProductImage) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 rounded-lg ${fallbackClassName}`}
        >
          {isProductImage ? (
            <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col items-center justify-center bg-red-50 rounded-lg p-4 ${fallbackClassName}`}
      >
        <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
        <p className="text-xs text-red-600 text-center">{error}</p>
        <button
          onClick={() => filename && loadImage(filename)}
          className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Success state with image
  if (imageData) {
    return (
      <img
        src={imageData}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    );
  }

  // Fallback
  return (
    <div
      className={`flex items-center justify-center bg-gray-100 rounded-lg ${fallbackClassName}`}
    >
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  );
}

export default ImageDisplay;
