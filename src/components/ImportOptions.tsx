interface Props {
  importFn: (imageId: string) => Promise<void>;
}

export function ImportOptions({ importFn }: Props) {
  return (
    <>
      <button type="button">From Imgur URL</button>
      <button type="button">From file</button>
    </>
  );
}
