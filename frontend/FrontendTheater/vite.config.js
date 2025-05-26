import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/', // Try with root path if unsure
    define: {
      // Make env variables available to the client code
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL)
    },
    css: {
      preprocessorOptions: {
        css: { charset: false }
      }
    }
  });
};