interface CompressionStream {
  new (format: 'deflate' | 'gzip');
  get readable(): ReadableStream;
  get writable(): WritableStream;
}

interface DecompressionStream {
  new (format: 'deflate' | 'gzip');
  get readable(): ReadableStream;
  get writable(): WritableStream;
}

interface Window {
  CompressionStream: CompressionStream;
  DecompressionStream: DecompressionStream;
}
