function canvasToBase64(canvas: HTMLCanvasElement): string {
  const [, dataUrl] = canvas.toDataURL().split(',');
  return dataUrl;
}

class UploadError extends Error {
  detail: unknown;

  constructor(message: string, detail?: unknown) {
    super(message);
    this.detail = detail;
  }
}

export async function saveToImgur(canvas: HTMLCanvasElement): Promise<string> {
  const formdata = new FormData();
  formdata.append('type', 'base64');
  formdata.append('image', canvasToBase64(canvas));

  const response = await fetch(`https://api.imgur.com/3/image`, {
    method: 'POST',
    headers: { Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}` },
    body: formdata,
  });

  if (response.ok) {
    const { data } = (await response.json()) as { data: { id: string } };
    return data.id;
  }

  throw new UploadError('Imgur response: Not OK', {
    response,
    json: await response.json(),
  });
}

export async function loadFromImgur(id: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to load from imgur, failed to read context from canvas.');

  const response = await fetch(`https://i.imgur.com/${id}.png`);
  const imageBlob = await response.blob();
  const imageBitmap = await createImageBitmap(imageBlob);
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  context.drawImage(imageBitmap, 0, 0);

  return canvas;
}
