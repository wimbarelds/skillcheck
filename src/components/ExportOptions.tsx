interface Props {
  exportFn: () => void;
}

export function ExportOptions({ exportFn }: Props) {
  const buttonClasses =
    'rounded-md border border-solid border-white bg-primary-700 px-2 text-white hover:bg-primary-600';
  return (
    <div className="flex min-w-[300px] flex-col gap-2">
      <h3 className="text-xl font-bold">As image (PNG)</h3>
      <div className="flex gap-2">
        <button type="button" className={buttonClasses}>
          Download
        </button>
        <button type="button" className={buttonClasses} onClick={exportFn}>
          Upload to Imgur
        </button>
      </div>
      <h3 className="text-xl font-bold">As PDF</h3>
      <p>To be added.</p>
      <h3 className="text-xl font-bold">As HTML</h3>
      <p>To be added.</p>
    </div>
  );
}
