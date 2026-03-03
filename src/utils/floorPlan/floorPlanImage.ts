/**
 * 平面圖圖片上傳和處理相關功能
 */
import * as pdfjsLib from 'pdfjs-dist';

// 讓 Vite 幫你處理 worker 檔案 URL（新版 pdfjs 使用 pdf.worker.mjs）
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

export const processPdfFirstPageToImage = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1); // 只取第一頁

  const viewport = page.getViewport({ scale: 2.0 }); // 放大以提高解析度
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas context is not available');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas,
  };
  await page.render(renderContext).promise;

  return canvas.toDataURL('image/png');
};

/**
 * 根據檔案類型處理檔案，支援圖片和 PDF
 * @param file
 * @returns
 */
export const processPlanFile = (file: File): Promise<string> => {
  if (file.type.startsWith('image/')) {
    return processImageFile(file);
  }
  if (file.type === 'application/pdf') {
    return processPdfFirstPageToImage(file);
  }
  return Promise.reject(new Error('Unsupported file type'));
};

export interface ImageDimensions {
  containerWidth: number;
  containerHeight: number;
  imageWidth: number;
  imageHeight: number;
}

export interface ScaleResult {
  initialScale: number;
}

/**
 * 計算圖片適應螢幕的初始縮放比例
 */
export const calculateInitialScale = (dimensions: ImageDimensions): ScaleResult => {
  const { containerHeight, imageHeight } = dimensions;

  // 需求：初始化時圖片高度為父層容器高
  const scaleY = containerHeight / imageHeight;
  // 仍然避免放大超過 100%
  const initialScale = Math.min(scaleY, 1);

  return { initialScale };
};

/**
 * 驗證檔案是否為支援的格式 (圖片或 PDF)
 */
export const isSupportedPlanFile = (file: File): boolean => {
  return file.type.startsWith('image/') || file.type === 'application/pdf';
};
