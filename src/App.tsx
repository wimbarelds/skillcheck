import { useCallback, useEffect, useRef, useState } from 'react';

import tailwindConfig from '../tailwind.config';
import { Category } from './components/Category';
import { baseSkills } from './data/base-skills';
import { compressCategories } from './data/data-tools';
import { formatResult } from './data/format-result';
import { initSkills } from './data/init-skills';
import { encodeDataInCanvas } from './image-util/encode-data';
import { drawResult } from './image-util/generate-image';
import { uploadToImgur } from './image-util/imgur-upload';

const { theme } = tailwindConfig;
const localStorageKey = 'skillcheck-cache';

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
    encodeDataInCanvas(canvas, compressedData, {
      bottom: '0px',
      left: '0px',
      width: '100%',
      height: '16px',
      noise: 'medium',
    });
    const resultId = await uploadToImgur(canvas);
    const url = `https://i.imgur.com/${resultId}.png`;
    // eslint-disable-next-line no-console
    console.log({ resultId, url });
  }, [categories]);

  return (
    <form className="container mx-auto flex flex-col px-2 pb-4">
      <header className="flex gap-1">
        <h1 className="my-2 flex-1 bg-[url('/check_box_white.svg')] bg-[length:10_10] bg-left bg-no-repeat pl-14 text-3xl font-bold">
          Skillcheck
        </h1>
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
