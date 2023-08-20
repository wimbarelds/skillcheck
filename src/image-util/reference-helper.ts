export function createReferenceCanvas(
  width: number,
  height: number,
  background: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const referenceContext = canvas.getContext('2d');
  if (!referenceContext) throw new Error('Failed to create reference context');
  referenceContext.fillStyle = background;
  referenceContext.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}
