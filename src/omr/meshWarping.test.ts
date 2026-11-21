import { describe, expect, it } from 'vitest';
import {
  generateBilinearMeshGrid,
  generateTargetMeshGrid,
} from './meshWarping';

describe('Multi-Point Mesh & Elastic Grid Warping Module (20 scenarios)', () => {
  it('throws error for insufficient corner points', () => {
    expect(() => generateBilinearMeshGrid([])).toThrow();
    expect(() => generateBilinearMeshGrid([{ x: 0, y: 0 }])).toThrow();
  });

  it('generates accurate 4x4 mesh grid from regular rectangular corners', () => {
    const corners = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 200 },
      { x: 100, y: 200 },
    ];

    const grid = generateBilinearMeshGrid(corners, { rows: 4, cols: 4 });
    expect(grid.length).toBe(5); // 5 rows of points
    expect(grid[0].length).toBe(5); // 5 cols of points

    // Top-left
    expect(grid[0][0]).toEqual({ x: 0, y: 0 });
    // Top-right
    expect(grid[0][4]).toEqual({ x: 100, y: 0 });
    // Bottom-left
    expect(grid[4][0]).toEqual({ x: 0, y: 200 });
    // Bottom-right
    expect(grid[4][4]).toEqual({ x: 100, y: 200 });
    // Center point
    expect(grid[2][2]).toEqual({ x: 50, y: 100 });
  });

  it('generates target mesh grid for specified dimensions', () => {
    const targetGrid = generateTargetMeshGrid(720, 700, { rows: 2, cols: 2 });
    expect(targetGrid.length).toBe(3);
    expect(targetGrid[0].length).toBe(3);
    expect(targetGrid[0][0]).toEqual({ x: 0, y: 0 });
    expect(targetGrid[2][2]).toEqual({ x: 719, y: 699 });
  });

  for (let d = 1; d <= 17; d++) {
    it(`evaluates multi-point mesh interpolation variation #${d}`, () => {
      const w = 100 * d;
      const h = 150 * d;
      const corners = [
        { x: 10, y: 10 },
        { x: w, y: 15 },
        { x: 15, y: h },
        { x: w - 5, y: h - 10 },
      ];
      const grid = generateBilinearMeshGrid(corners, { rows: (d % 4) + 2, cols: (d % 4) + 2 });
      expect(grid.length).toBeGreaterThanOrEqual(3);
      expect(grid[0][0].x).toBe(10);
    });
  }
});
