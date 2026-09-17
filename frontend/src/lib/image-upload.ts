/**
 * Utility functions for local image drag-and-drop and file upload processing.
 * Converts local files to optimized Base64 data URLs that can be stored in the database
 * and rendered anywhere across the application immediately without external dependencies.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  fileName: string;
  fileSizeFormatted: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function processImageFile(
  file: File,
  maxDimension: number = 512
): Promise<ProcessedImageResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select or drop a valid image file (PNG, JPG, WEBP, GIF, SVG).");
  }

  // Preserve SVGs and GIFs directly to avoid rasterizing animations or vector clarity
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    const rawDataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl: rawDataUrl,
      fileName: file.name,
      fileSizeFormatted: formatFileSize(file.size),
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file from disk."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Square center-crop and resize for optimal avatar presentation
          const minSide = Math.min(width, height);
          const targetSize = Math.min(minSide, maxDimension);

          const canvas = document.createElement("canvas");
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            // Fallback to raw data url if canvas 2d is unavailable
            resolve({
              dataUrl: reader.result as string,
              fileName: file.name,
              fileSizeFormatted: formatFileSize(file.size),
            });
            return;
          }

          // Center crop calculation
          const sx = (width - minSide) / 2;
          const sy = (height - minSide) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);

          // Use WebP if supported, fallback to JPEG
          let outputDataUrl: string;
          try {
            outputDataUrl = canvas.toDataURL("image/webp", 0.88);
            if (!outputDataUrl.startsWith("data:image/webp")) {
              outputDataUrl = canvas.toDataURL("image/jpeg", 0.88);
            }
          } catch {
            outputDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          }

          resolve({
            dataUrl: outputDataUrl,
            fileName: file.name,
            fileSizeFormatted: formatFileSize(Math.round((outputDataUrl.length * 3) / 4)),
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read local file."));
    reader.readAsDataURL(file);
  });
}
