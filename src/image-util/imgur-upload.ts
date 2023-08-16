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

export async function uploadToImgur(canvas: HTMLCanvasElement): Promise<string> {
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
