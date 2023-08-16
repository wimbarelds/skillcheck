export function Tooltip({ text }: { text: string }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-black bg-white px-2 text-black shadow-md group-hover:block group-focus-within:[&:not(body:has([role=radiogroup]:hover)_&)]:block">
      <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-black bg-white" />
      {text}
    </span>
  );
}
