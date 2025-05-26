import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    plugins: [react()],
    baseURL: import.meta.env.VITE_API_BASE_URL + 'api/v1',
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