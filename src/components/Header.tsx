import { useCallback } from 'react';

import tailwindConfig from '../../tailwind.config';
import { useShowModal } from '../hooks/modal';
import { ExportOptions } from './ExportOptions';
import { ImportOptions } from './ImportOptions';

interface HeaderProps {
  exportFn: () => Promise<void>;
  importFn: (imageId: string) => Promise<void>;
}

const { theme } = tailwindConfig;

export function Header({ exportFn, importFn }: HeaderProps) {
  const showModal = useShowModal();

  // const createExport = useCallback(async () => {
  //   const results = formatResult(categories);
  //   const canvas = drawResult(results, {
  //     backgroundColor: theme.extend.colors.primary[900],
  //     cardColor: theme.extend.colors.primary[950],
  //     textColor: '#FFFFFF',
  //   });
  //   // Convert expert/dont know etc into numbers to rduce data length
  //   const compressedData = compressCategories(categories);
  //   await encodeDataInCanvas(canvas, compressedData, encodingArea);
  //   const resultId = process.env.MOCK_UPLOAD_RESULTID || (await saveToImgur(canvas));
  //   const url = `https://i.imgur.com/${resultId}.png`;

  //   console.log('moo', showModal);
  //   showModal({
  //     title: 'Hello',
  //     children: (
  //       <div>
  //         <a href={url} target="_blank">
  //           Open image
  //         </a>
  //         <button>Done</button>
  //       </div>
  //     ),
  //   });

  //   console.log({ resultId, url });
  // }, [categories]);

  // const doImport = useCallback(async () => {
  //   const id: string = prompt('imgur') ?? '';
  //   const image = await loadFromImgur(id);
  //   const referenceCanvas = createReferenceCanvas(
  //     image.width,
  //     image.height,
  //     theme.extend.colors.primary['900'],
  //   );
  //   const compressedCategories = await decodeDataFromImage<CompressedSkillCategory[]>(
  //     image,
  //     referenceCanvas,
  //     encodingArea,
  //   );
  //   setCategories(decompressCategories(compressedCategories));
  // }, []);

  const showImportOptions = useCallback(() => {
    showModal({
      title: '',
      children: <ImportOptions importFn={importFn} />,
    });
  }, [showModal, importFn]);

  const showExportOptions = useCallback(() => {
    showModal({
      title: 'Export results',
      children: <ExportOptions exportFn={exportFn} />,
    });
  }, [showModal, exportFn]);

  return (
    <header className="flex gap-1">
      <h1 className="my-2 flex-1 bg-[url('/check_box_white.svg')] bg-[length:10_10] bg-left bg-no-repeat pl-14 text-3xl font-bold">
        Skillcheck
      </h1>
      <button
        type="button"
        className="my-2 rounded-md bg-primary-600 px-4 transition-colors hover:bg-primary-500"
        onClick={showImportOptions}
      >
        Import
      </button>
      <button
        type="button"
        className="my-2 rounded-md bg-primary-600 px-4 transition-colors hover:bg-primary-500"
        onClick={showExportOptions}
      >
        Export
      </button>
    </header>
  );
}
