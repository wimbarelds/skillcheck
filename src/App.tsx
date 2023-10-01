import { useCallback, useEffect, useRef, useState } from 'react';

import tailwindConfig from '../tailwind.config';
import { Category } from './components/Category';
import { baseSkills } from './data/base-skills';
import { compressCategories, decompressCategories } from './data/data-tools';
import { formatResult } from './data/format-result';
import { initSkills } from './data/init-skills';
import { decodeDataFromImage, encodeDataInCanvas } from './image-util/encode-data';
import { drawResult } from './image-util/generate-image';
import { createReferenceCanvas } from './image-util/reference-helper';
import { loadFromImgur, saveToImgur } from './image-util/imgur-helpers';
import { CompressedSkillCategory, SkillCategory } from './types/DataTypes';
import { ModalOutlet, ModalProvider, useShowModal } from './hooks/modal';
import { Header } from './components/Header';

const { theme } = tailwindConfig;
const localStorageKey = 'skillcheck-cache';

const encodingArea = {
  bottom: '0px',
  left: '0px',
  width: '100%',
  height: '16px',
} as const;

function App() {
  const [categories, setCategories] = useState(() => initSkills(baseSkills, localStorageKey));

  const isInitial = useRef(true);
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
    } else {
      window.localStorage.setItem(localStorageKey, JSON.stringify(categories));
    }
  }, [categories, isInitial]);

  const createExport = useCallback(async () => {
    const results = formatResult(categories);
    const canvas = drawResult(results, {
      backgroundColor: theme.extend.colors.primary[900],
      cardColor: theme.extend.colors.primary[950],
      textColor: '#FFFFFF',
    });
    // Convert expert/dont know etc into numbers to rduce data length
    const compressedData = compressCategories(categories);
    await encodeDataInCanvas(canvas, compressedData, encodingArea);
    const resultId = process.env.MOCK_UPLOAD_RESULTID || (await saveToImgur(canvas));
    const url = `https://i.imgur.com/${resultId}.png`;

    console.log({ resultId, url });
  }, [categories]);

  const doImport = useCallback(async (imgurId: string) => {
    const image = await loadFromImgur(imgurId);
    const referenceCanvas = createReferenceCanvas(
      image.width,
      image.height,
      theme.extend.colors.primary['900'],
    );
    const compressedCategories = await decodeDataFromImage<CompressedSkillCategory[]>(
      image,
      referenceCanvas,
      encodingArea,
    );
    setCategories(decompressCategories(compressedCategories));
  }, []);

  return (
    <ModalProvider>
      <form className="container mx-auto flex flex-col px-2 pb-4">
        <Header importFn={doImport} exportFn={createExport} />
        <main>
          <div className="columns-md gap-4">
            {categories.map((category) => (
              <Category key={category.name} category={category} setCategories={setCategories} />
            ))}
          </div>
        </main>
      </form>
      <ModalOutlet />
    </ModalProvider>
  );
}

export default App;
