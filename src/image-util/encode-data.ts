/* eslint-disable no-bitwise */
type Dimension = `${number}${'px' | '%'}`;

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

type EncodingArea = VerticalPosition & HorizontalPosition;

export async function encodeDataInCanvas(
  canvas: HTMLCanvasElement,
  data: unknown,
  areaOptions: EncodingArea,
) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('[encodeDataInCanvas]: Could not get canvas context');

  // convert data to json, then compress it
  const compressedData = await compressData(data);
  // Determine the exact area in the image
  const encodingArea = getAreaFromCanvas(canvas, areaOptions);
  // Get the pixels from the area
  const imagePixels = getPixelsFromCanvasArea(context, encodingArea);
  // Figure out how many bits we need to store per pixel
  const bpp = Math.ceil((compressedData.length * 8) / imagePixels.length);

  // Convert JSON data to per-pixel differences to encode into image
  const pixelDiffs = dataToPixelDiffs(compressedData, bpp);
  // Encode our data into the pixels from the target area
  const encodedPixels = addPixelDiffsToImageData(imagePixels, pixelDiffs, bpp);
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

export async function decodeDataFromImage<T>(
  canvas: HTMLCanvasElement,
  reference: HTMLCanvasElement,
  areaOptions: EncodingArea,
  referenceAreaOptions?: EncodingArea,
): Promise<T> {
  const context = canvas.getContext('2d');
  const referenceContext = reference.getContext('2d');
  if (!context || !referenceContext)
    throw new Error('[encodeDataInCanvas]: Could not get canvas context');

  // Determine the exact area in the image
  const encodingArea = getAreaFromCanvas(canvas, areaOptions);
  // Get the pixels from the area
  const imagePixels = getPixelsFromCanvasArea(context, encodingArea);
  // Determine the area for the reference image
  const referenceEncodingArea = getAreaFromCanvas(reference, referenceAreaOptions ?? areaOptions);
  // Get the pixels from the area in the reference image
  const referencePixels = getPixelsFromCanvasArea(referenceContext, referenceEncodingArea);
  // The number of pixels should be equal
  if (imagePixels.length !== referencePixels.length)
    throw new Error('Cannot decode data from Image, encoding areas do not match in size');
  // Get the diffPixels
  const diffPixels = getPixelReferenceDiffs(imagePixels, referencePixels);
  // Compute pixels back to bytes
  const bytes = getBytesFromPixelDiffs(diffPixels);
  // Decompress bytes back to json data
  const data = await decompressData<T>(bytes);
  return data;
}

function getPixelReferenceDiffs(pixels: Pixel[], referencePixels: Pixel[]): Pixel[] {
  const diffs = pixels.map((pixel, index): Pixel => {
    const referencePixel = referencePixels[index];
    return {
      r: pixel.r ^ referencePixel.r,
      g: pixel.g ^ referencePixel.g,
      b: pixel.b ^ referencePixel.b,
    };
  });

  // Eliminate pixels with no difference
  const filtered = diffs.filter((pixel) => Object.values(pixel).some((v) => v !== 0));

  // Remove 1 from every value
  return filtered.map((pixel) => ({
    r: pixel.r - 1,
    g: pixel.g - 1,
    b: pixel.b - 1,
  }));
}

function getChannelBits(value: number, numBits: number): number[] {
  return value
    .toString(2)
    .padStart(numBits, '0')
    .slice(0, numBits) // Num bits might be 0, and the value 0 would have length 1
    .split('')
    .map(Number);
}

function getBytesFromPixelDiffs(pixelDiffs: Pixel[]): Uint8Array {
  const bits: number[] = [];
  const [noiseDiffPixel, ...diffPixels] = pixelDiffs;
  for (const pixel of diffPixels) {
    bits.push(...getChannelBits(pixel.r, noiseDiffPixel.r));
    bits.push(...getChannelBits(pixel.g, noiseDiffPixel.g));
    bits.push(...getChannelBits(pixel.b, noiseDiffPixel.b));
  }

  const numBytes = Math.ceil(bits.length / 8);
  const bytes = new Array(numBytes)
    .fill(0)
    .map((_, index) => parseInt(bits.slice(index * 8, (index + 1) * 8).join(''), 2));

  return Uint8Array.from(bytes);
}

/**
 * All internal functions used to accomplish the above "encodeDataInCanvas" function
 */

async function compressData(jsData: unknown) {
  const jsonString = JSON.stringify(jsData);
  const stream = new Blob([jsonString], { type: 'application/json' })
    .stream()
    .pipeThrough(new CompressionStream('gzip'));

  const blob = await new Response(stream).blob();
  const arrayBuffer = await blob.arrayBuffer();
  const result = new Uint8Array(arrayBuffer);
  return result;
}

async function decompressData<T>(data: Uint8Array): Promise<T> {
  const blob = new Blob([data], { type: 'application/json' });
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  const responseBlob = await new Response(stream).blob();
  const json = await responseBlob.text();
  return JSON.parse(json) as T;
}

interface Pixel {
  r: number;
  g: number;
  b: number;
}

function getBppc(bpp: number): Pixel {
  const r = Math.ceil(bpp / 3);
  const g = Math.ceil((bpp - r) / 2);
  const b = bpp - r - g;
  return { r, g, b };
}

function dataToPixelDiffs(data: Uint8Array, bpp: number): Pixel[] {
  // Convert data to pixel-channel offsets (3 channels per pixel)
  const bits = Array.from(data)
    .map((byte) => byte.toString(2).padStart(8, '0').split('').map(Number))
    .flat();

  const bppc = getBppc(bpp);

  const numPixels = Math.ceil(bits.length / bpp);
  const pixels = new Array(numPixels).fill(null).map((_, pixelIndex): Pixel => {
    const start = pixelIndex * bpp;
    const r = parseInt(bits.slice(start, start + bppc.r).join(''), 2);
    const g = parseInt(bits.slice(start + bppc.r, start + bppc.r + bppc.g).join(''), 2);
    const b = parseInt(bits.slice(start + bppc.r + bppc.g, start + bpp).join(''), 2);
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
  options: EncodingArea,
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

function getAreaFromCanvas(canvas: HTMLCanvasElement, options: EncodingArea): Area {
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
  return channel ^ (data + 1);
}

function addPixelDiffsToImageData(imagePixels: Pixel[], pixelDiffs: Pixel[], bpp: number): Pixel[] {
  // Prepend a pixel to tell the decoder the noise ratio
  const noiseDiffPixel = getBppc(bpp);
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
