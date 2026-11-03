/**
 * Asset loader and background removal preprocessor
 * Cleans white/checkerboard backgrounds from user-supplied image assets
 * so they blend seamlessly into the HTML5 canvas game world.
 */

export interface GameAssets {
  bird: CanvasImageSource;
  tree: CanvasImageSource;
  building: CanvasImageSource;
  cloud: CanvasImageSource;
  isReady: boolean;
}

function processTransparentImage(src: string, isCheckerboard: boolean = false): Promise<HTMLCanvasElement | HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.naturalWidth || img.width;
        offCanvas.height = img.naturalHeight || img.height;
        const ctx = offCanvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(img);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (isCheckerboard) {
            // Remove faux checkerboard background: white (255,255,255) and light grey (215-245)
            const isGreyOrWhite = (r > 215 && g > 215 && b > 215 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15);
            if (isGreyOrWhite) {
              data[i + 3] = 0; // Transparent
            }
          } else {
            // Remove pure white or near-white background
            if (r > 240 && g > 240 && b > 240) {
              data[i + 3] = 0; // Transparent
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(offCanvas);
      } catch {
        resolve(img);
      }
    };

    img.onerror = () => {
      resolve(img);
    };
  });
}

class AssetManager {
  private birdImg: CanvasImageSource | null = null;
  private treeImg: CanvasImageSource | null = null;
  private buildingImg: CanvasImageSource | null = null;
  private cloudImg: CanvasImageSource | null = null;
  private ready: boolean = false;
  private loadPromise: Promise<void> | null = null;

  public async preload(): Promise<void> {
    if (this.ready) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const [bird, tree, building, cloud] = await Promise.all([
        processTransparentImage('/assets/aistudio/Screenshot_2026-11-01_135323-removebg-preview_0282861d.png', false),
        processTransparentImage('/assets/aistudio/Screenshot_2026-11-01_140039_dee9a895.png', true),
        processTransparentImage('/assets/aistudio/Screenshot_2026-11-01_140532_fee7ffbc.png', false),
        processTransparentImage('/assets/aistudio/Screenshot_2026-11-01_174012-removebg-preview_b7b9a2e3.png', false),
      ]);

      this.birdImg = bird;
      this.treeImg = tree;
      this.buildingImg = building;
      this.cloudImg = cloud;
      this.ready = true;
    })();

    return this.loadPromise;
  }

  public getAssets(): GameAssets {
    return {
      bird: this.birdImg || new Image(),
      tree: this.treeImg || new Image(),
      building: this.buildingImg || new Image(),
      cloud: this.cloudImg || new Image(),
      isReady: this.ready,
    };
  }
}

export const assetManager = new AssetManager();
