import react from '@vitejs/plugin-react-swc';
import process from 'process';
import { defineConfig, loadEnv, type UserConfigExport } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // eslint-disable-next-line no-console
  console.log(env);
  const base: UserConfigExport = {
    plugins: [react()],
    base: env.BASE_DIR || '/',
    define: {
      'process.env': env,
    },
  };

  if (command === 'serve') {
    return {
      ...base,
      server: {
        port: 3000,
        watch: { usePolling: !!env.WINHOST && env.WINHOST !== 'false' },
      },
    };
  }
  return base;
});
