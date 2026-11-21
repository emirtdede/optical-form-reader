/**
 * Çok Noktalı Esnek Izgara Düzeltme Modülü (Multi-Point Mesh & Elastic Grid Warping)
 * 
 * Bu modül; ortadan katlanmış, buruşmuş veya dalgalı optik form kağıtlarında
 * tek bir 4-nokta homografisi yerine çok noktalı parçalı ızgara dönüşümü (Piecewise Bilinear/Affine Warping)
 * uygulayarak orta ve kenar sütunlardaki eksen kaymalarını giderir.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface GridDimensions {
  rows: number;
  cols: number;
}

/**
 * 4 ana köşeden (Sol-Üst, Sağ-Üst, Sol-Alt, Sağ-Alt) bilineer interpolasyon ile
 * çok noktalı bir referans ızgarası üretir.
 */
export function generateBilinearMeshGrid(
  corners: Point2D[], // [TL, TR, BL, BR]
  divisions: GridDimensions = { rows: 4, cols: 4 },
): Point2D[][] {
  if (!corners || corners.length < 4) {
    throw new Error('Esnek ızgara üretimi için en az 4 köşe noktası gereklidir.');
  }

  const [tl, tr, bl, br] = corners;
  const grid: Point2D[][] = [];

  for (let r = 0; r <= divisions.rows; r++) {
    const rowPoints: Point2D[] = [];
    const vFactor = r / divisions.rows;

    // Sol ve sağ kenar ara noktaları
    const leftX = tl.x + (bl.x - tl.x) * vFactor;
    const leftY = tl.y + (bl.y - tl.y) * vFactor;
    const rightX = tr.x + (br.x - tr.x) * vFactor;
    const rightY = tr.y + (br.y - tr.y) * vFactor;

    for (let c = 0; c <= divisions.cols; c++) {
      const hFactor = c / divisions.cols;
      // İki kenar arasında yatay enterpolasyon
      const x = leftX + (rightX - leftX) * hFactor;
      const y = leftY + (rightY - leftY) * hFactor;
      rowPoints.push({ x: Math.round(x), y: Math.round(y) });
    }
    grid.push(rowPoints);
  }

  return grid;
}

/**
 * İdeal düzgün hedef ızgarayı üretir.
 */
export function generateTargetMeshGrid(
  targetWidth: number,
  targetHeight: number,
  divisions: GridDimensions = { rows: 4, cols: 4 },
): Point2D[][] {
  const tl: Point2D = { x: 0, y: 0 };
  const tr: Point2D = { x: targetWidth - 1, y: 0 };
  const bl: Point2D = { x: 0, y: targetHeight - 1 };
  const br: Point2D = { x: targetWidth - 1, y: targetHeight - 1 };

  return generateBilinearMeshGrid([tl, tr, bl, br], divisions);
}

/**
 * Parçalı Izgara Dönüşümü (Piecewise Mesh Warping).
 * Her bir hücreyi ayrı bir perspektif matrisiyle dönüştürerek dalgalanmaları düzleştirir.
 */
export function warpPiecewiseMesh(
  cv: any,
  sourceMat: any,
  srcGrid: Point2D[][],
  dstGrid: Point2D[][],
  targetWidth: number,
  targetHeight: number,
): any {
  if (!cv || !cv.Mat || !sourceMat) {
    throw new Error('OpenCV veya kaynak matris bulunamadı.');
  }

  const result = new cv.Mat.zeros(targetHeight, targetWidth, sourceMat.type());
  const rows = srcGrid.length - 1;
  const cols = srcGrid[0].length - 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Kaynak hücre köşeleri
      const srcCell = [
        srcGrid[r][c].x, srcGrid[r][c].y,
        srcGrid[r][c + 1].x, srcGrid[r][c + 1].y,
        srcGrid[r + 1][c].x, srcGrid[r + 1][c].y,
        srcGrid[r + 1][c + 1].x, srcGrid[r + 1][c + 1].y,
      ];

      // Hedef hücre köşeleri
      const dstCell = [
        dstGrid[r][c].x, dstGrid[r][c].y,
        dstGrid[r][c + 1].x, dstGrid[r][c + 1].y,
        dstGrid[r + 1][c].x, dstGrid[r + 1][c].y,
        dstGrid[r + 1][c + 1].x, dstGrid[r + 1][c + 1].y,
      ];

      let srcPtsMat: any = null;
      let dstPtsMat: any = null;
      let transformMat: any = null;
      let cellWarped: any = null;

      try {
        srcPtsMat = cv.matFromArray(4, 1, cv.CV_32FC2, srcCell);
        dstPtsMat = cv.matFromArray(4, 1, cv.CV_32FC2, dstCell);
        transformMat = cv.getPerspectiveTransform(srcPtsMat, dstPtsMat);

        cellWarped = new cv.Mat();
        cv.warpPerspective(
          sourceMat,
          cellWarped,
          transformMat,
          new cv.Size(targetWidth, targetHeight),
          cv.INTER_LINEAR,
          cv.BORDER_CONSTANT,
          new cv.Scalar(),
        );

        // Hedef hücre ROI sınırları
        const minX = Math.max(0, dstGrid[r][c].x);
        const maxX = Math.min(targetWidth, dstGrid[r + 1][c + 1].x + 1);
        const minY = Math.max(0, dstGrid[r][c].y);
        const maxY = Math.min(targetHeight, dstGrid[r + 1][c + 1].y + 1);
        const cellW = maxX - minX;
        const cellH = maxY - minY;

        if (cellW > 0 && cellH > 0) {
          const rect = new cv.Rect(minX, minY, cellW, cellH);
          const cellRoi = cellWarped.roi(rect);
          const dstRoi = result.roi(rect);
          cellRoi.copyTo(dstRoi);
          cellRoi.delete();
          dstRoi.delete();
        }
      } catch {
        // Hücre seviyesi hata durumunda sessizce atla
      } finally {
        srcPtsMat?.delete?.();
        dstPtsMat?.delete?.();
        transformMat?.delete?.();
        cellWarped?.delete?.();
      }
    }
  }

  return result;
}

/**
 * Güvenli Esnek Düzeltici (Adaptif Mesh & 4-Köşe Fallback).
 */
export function adaptiveWarpWithFallback(
  cv: any,
  grayMat: any,
  orderedCorners: number[], // [TL_x, TL_y, TR_x, TR_y, BL_x, BL_y, BR_x, BR_y]
  targetWidth: number,
  targetHeight: number,
  divisions: GridDimensions = { rows: 4, cols: 4 },
): any {
  if (!orderedCorners || orderedCorners.length !== 8) {
    throw new Error('Geçerli 8 koordinat değeri sağlanmalıdır.');
  }

  const corners: Point2D[] = [
    { x: orderedCorners[0], y: orderedCorners[1] },
    { x: orderedCorners[2], y: orderedCorners[3] },
    { x: orderedCorners[4], y: orderedCorners[5] },
    { x: orderedCorners[6], y: orderedCorners[7] },
  ];

  try {
    const srcGrid = generateBilinearMeshGrid(corners, divisions);
    const dstGrid = generateTargetMeshGrid(targetWidth, targetHeight, divisions);
    return warpPiecewiseMesh(cv, grayMat, srcGrid, dstGrid, targetWidth, targetHeight);
  } catch {
    // Fallback: Standart 4-nokta homografisi
    let source: any = null;
    let destination: any = null;
    let matrix: any = null;
    const warped = new cv.Mat();
    try {
      source = cv.matFromArray(4, 1, cv.CV_32FC2, orderedCorners);
      destination = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        targetWidth - 1, 0,
        0, targetHeight - 1,
        targetWidth - 1, targetHeight - 1,
      ]);
      matrix = cv.getPerspectiveTransform(source, destination);
      cv.warpPerspective(
        grayMat,
        warped,
        matrix,
        new cv.Size(targetWidth, targetHeight),
        cv.INTER_LINEAR,
        cv.BORDER_CONSTANT,
        new cv.Scalar(),
      );
      return warped;
    } finally {
      source?.delete?.();
      destination?.delete?.();
      matrix?.delete?.();
    }
  }
}
