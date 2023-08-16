import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import { type DeepReadonly } from 'ts-essentials';

export default {
  content: ['./index.html', './src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        primary: colors.sky,
        secondary: colors.orange,
      },
    },
  },
  plugins: [typography, forms, containerQueries],
} as const satisfies DeepReadonly<Config>;
