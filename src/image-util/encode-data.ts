type JSONData = unknown;
type Dimension = `${number}${'px' | '%'}`;

const noiseLevels = ['low', 'medium', 'high'] as const;
type Noise = (typeof noiseLevels)[number];

type AxisPos<T extends string> = { [key in T]: Dimension | Dimension[] };
type SizePos<T extends string> = { [key in T]: Dimension };
type VerticalPosition =
  | (AxisPos<'top'> & AxisPos<'bottom'>)
  | (AxisPos<'top'> & SizePos<'height'>)
  | (AxisPos<'bottom'> & SizePos<'height'>);
type HorizontalPosition =
  | (AxisPos<'left'> & AxisPos<'right'>)
  | (AxisPos<'left'> & SizePos<'width'>)
  | (AxisPos<'right'> & SizePos<'width'>);

type EncodeOptions = VerticalPosition &
  HorizontalPosition & {
    translateX?: Dimension | Dimension[];
    translateY?: Dimension | Dimension[];
    noise: Noise;
  };

export function encodeDataInCanvas(
  canvas: HTMLCanvasElement,
  data: unknown,
  options: EncodeOptions,
) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('[encodeDataInCanvas]: Could not get canvas context');

  // Convert JSON data to per-pixel differences to encode into image
  const pixelDiffs = dataToPixelDiffs(data, options.noise);
  // Determine the exact area in the image
  const encodingArea = getAreaFromCanvas(canvas, options);
  // Get the pixels from the area
  const imagePixels = getPixelsFromCanvasArea(context, encodingArea);
  // Encode our data into the pixels from the target area
  const encodedPixels = addPixelDiffsToImageData(imagePixels, pixelDiffs, options.noise);
  // Convert the resulting pixels back into an ImageData object
  const encodedImageData: ImageData = new ImageData(
    Uint8ClampedArray.from(encodedPixels.map(({ r, g, b }) => [r, g, b, 255]).flat()),
    encodingArea.width,
    encodingArea.height,
    { colorSpace: 'srgb' },
  );
  // Write the resulting ImageData back into our given image
  context.putImageData(encodedImageData, encodingArea.left, encodingArea.top);
}

/**
 * All internal functions used to accomplish the above "encodeDataInCanvas" function
 */

interface Pixel {
  r: number;
  g: number;
  b: number;
}

function dataToPixelDiffs(data: JSONData, noise: Noise): Pixel[] {
  // Convert data to pixel-channel offsets (3 channels per pixel)
  const bppc = 2 ** ['low', 'medium', 'high'].indexOf(noise);
  const jsonString = JSON.stringify(data);
  const bits = Array.from(jsonString)
    .map((char) => char.charCodeAt(0).toString(2).split('').map(Number))
    .flat();

  const numPixels = Math.ceil(bits.length / bppc);
  const pixels = new Array(numPixels).fill(null).map((_, pixelIndex): Pixel => {
    const start = pixelIndex * bppc * 3;
    const r = parseInt(bits.slice(start + bppc * 0, start + bppc * 1).join(''), 2);
    const g = parseInt(bits.slice(start + bppc * 1, start + bppc * 2).join(''), 2);
    const b = parseInt(bits.slice(start + bppc * 2, start + bppc * 3).join(''), 2);
    return { r, g, b };
  });

  return pixels;
}

const opposites = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' } as const;
const sizeKeyForEdge = { left: 'width', right: 'width', top: 'height', bottom: 'height' } as const;

function calculateSize(totalSize: number, dimensions: Dimension | Dimension[]): number {
  const offsets = [dimensions].flat();
  return offsets.reduce((pos, val) => {
    const num = parseFloat(val.replace(/(px|%)/, ''));
    return pos + (val.endsWith('px') ? num : (num / 100) * totalSize);
  }, 0);
}

function getEdgeOffset(
  dimensionSize: number,
  dimensionEdge: 'left' | 'right' | 'top' | 'bottom',
  options: EncodeOptions,
) {
  if (dimensionEdge in options) {
    // TODO: Figure out a way to actually make typescript play nice
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return calculateSize(dimensionSize, options[dimensionEdge]);
  }

  const oppositeEdge = opposites[dimensionEdge];
  const sizeKey = sizeKeyForEdge[dimensionEdge];

  if (!(oppositeEdge in options) || !(sizeKey in options)) {
    throw new Error('Missing some dimension value in options');
  }

  // TODO: Figure out a way to actually make typescript play nice
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const offset = calculateSize(dimensionSize, options[oppositeEdge]);
  // TODO: Figure out a way to actually make typescript play nice
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const size = calculateSize(dimensionSize, options[sizeKey]);

  return dimensionSize - size - offset;
}

interface Area {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

function getAreaFromCanvas(canvas: HTMLCanvasElement, options: EncodeOptions): Area {
  const { width, height } = canvas;

  const top = getEdgeOffset(height, 'top', options);
  const bottom = getEdgeOffset(height, 'bottom', options);
  const left = getEdgeOffset(width, 'left', options);
  const right = getEdgeOffset(width, 'right', options);

  return {
    width: width - left - right,
    height: height - top - bottom,
    top,
    bottom,
    left,
    right,
  };
}

function getPixelsFromCanvasArea(
  context: CanvasRenderingContext2D,
  { top, left, width, height }: Area,
): Pixel[] {
  const { data } = context.getImageData(left, top, width, height, {
    colorSpace: 'srgb',
  });

  const numPixels = Math.ceil(data.length / 4);
  return new Array(numPixels).fill(null).map((_, index) => {
    const [r, g, b] = data.slice(index * 4, index * 4 + 3);
    return { r, g, b };
  });
}

function encodeDataInChannel(channel: number, data: number) {
  // eslint-disable-next-line no-bitwise
  return channel ^ (data + 1);
}

const noiseDiffs: Record<Noise, Pixel> = {
  high: { r: 1, g: 0, b: 0 },
  medium: { r: 0, g: 1, b: 0 },
  low: { r: 0, g: 0, b: 1 },
};

function addPixelDiffsToImageData(
  imagePixels: Pixel[],
  pixelDiffs: Pixel[],
  noise: Noise,
): Pixel[] {
  console.log({ numImagePixels: imagePixels.length, numPixelDiffs: pixelDiffs.length + 1 });
  // Prepend a pixel to tell the decoder the noise ratio
  const noiseDiffPixel = noiseDiffs[noise];
  const data = [noiseDiffPixel, ...pixelDiffs];

  // Return image pixels, map-encoding data into it
  return imagePixels.map((pixel, index) => {
    // If there's no more data, just return the original pixel
    if (index >= data.length) return pixel;
    const dataPixel = data[index];
    return {
      r: encodeDataInChannel(pixel.r, dataPixel.r),
      g: encodeDataInChannel(pixel.g, dataPixel.g),
      b: encodeDataInChannel(pixel.b, dataPixel.b),
    };
  });
}
