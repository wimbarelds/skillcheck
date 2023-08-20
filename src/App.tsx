import { useCallback, useEffect, useRef, useState } from 'react';

import tailwindConfig from '../tailwind.config';
import { Category } from './components/Category';
import { baseSkills } from './data/base-skills';
import { compressCategories } from './data/data-tools';
import { formatResult } from './data/format-result';
import { initSkills } from './data/init-skills';
import { decodeDataFromImage, encodeDataInCanvas } from './image-util/encode-data';
import { drawResult } from './image-util/generate-image';
import { createReferenceCanvas } from './image-util/reference-helper';
import { loadFromImgur, saveToImgur } from './image-util/imgur-helpers';
import { SkillCategory } from './types/DataTypes';

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
    const resultId = await saveToImgur(canvas);
    const url = `https://i.imgur.com/${resultId}.png`;

    console.log({ resultId, url });
  }, [categories]);

  const doImport = useCallback(async () => {
    const id: string = prompt('imgur') ?? '';
    const image = await loadFromImgur(id);
    const referenceCanvas = createReferenceCanvas(
      image.width,
      image.height,
      theme.extend.colors.primary['900'],
    );
    const categories = await decodeDataFromImage<SkillCategory[]>(
      image,
      referenceCanvas,
      encodingArea,
    );
    setCategories(categories);
  }, []);

  return (
    <form className="container mx-auto flex flex-col px-2 pb-4">
      <header className="flex gap-1">
        <h1 className="my-2 flex-1 bg-[url('/check_box_white.svg')] bg-[length:10_10] bg-left bg-no-repeat pl-14 text-3xl font-bold">
          Skillcheck
        </h1>
        <button
          type="button"
          className="my-2 rounded-md bg-primary-600 px-4 transition-colors hover:bg-primary-500"
          onClick={doImport}
        >
          Import
        </button>
        <button
          type="button"
          className="my-2 rounded-md bg-primary-600 px-4 transition-colors hover:bg-primary-500"
          onClick={createExport}
        >
          Export
        </button>
      </header>
      <main>
        <div className="columns-md gap-4">
          {categories.map((category) => (
            <Category key={category.name} category={category} setCategories={setCategories} />
          ))}
        </div>
      </main>
    </form>
  );
}

export default App;
