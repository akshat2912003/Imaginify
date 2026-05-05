"use client";

import { CldImage, getCldImageUrl } from "next-cloudinary";
import { dataUrl, debounce, download, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

const TransformedImage = ({
  image, type, title, transformationConfig, isTransforming, hasDownload = false, setIsTransforming,
}: TransformedImageProps) => {
  const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const downloadUrl = getCldImageUrl({
      width: displayWidth,
      height: displayHeight,
      src: image?.publicId,
      ...transformationConfig,
    });
    download(downloadUrl, title);
  };

  // For smartcrop, use the dimensions from transformationConfig (the selected ratio)
  const displayWidth = (type === "smartcrop" && transformationConfig?.width)
    ? transformationConfig.width
    : getImageSize(type, image, "width");
  const displayHeight = (type === "smartcrop" && transformationConfig?.height)
    ? transformationConfig.height
    : getImageSize(type, image, "height");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between">
        <h3 className="h3-bold text-dark-600">Transformed</h3>
        {hasDownload && (
          <button className="download-btn text-dark-400 hover:text-purple-500 transition-colors" onClick={downloadHandler}>
            ⬇️ <span className="text-sm">Download</span>
          </button>
        )}
      </div>

      {image?.publicId && transformationConfig ? (
        <div className="relative">
          <CldImage
            width={displayWidth}
            height={displayHeight}
            src={image?.publicId}
            alt={image.title}
            sizes="(max-width: 767px) 100vw, 50vw"
            placeholder={dataUrl as PlaceholderValue}
            className="transformed-image"
            onLoad={() => setIsTransforming && setIsTransforming(false)}
            onError={() => { debounce(() => setIsTransforming && setIsTransforming(false), 8000)(); }}
            {...transformationConfig}
          />
          {isTransforming && (
            <div className="transforming-loader">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin text-4xl">⟳</div>
                <p className="text-white text-sm">Transforming... Please wait</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="transformed-placeholder">
          <p className="p-14-medium text-dark-400/70">Transformed Image</p>
        </div>
      )}
    </div>
  );
};

export default TransformedImage;
