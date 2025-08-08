import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env['GEMINI_API_KEY']),
        'process.env.GEMINI_API_KEY': JSON.stringify(env['GEMINI_API_KEY']),
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Expose environment variables to the client
      envPrefix: 'VITE_',
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
            }
          }
        },
        sourcemap: mode === 'development',
        minify: mode === 'production',
        target: 'es2020',
      },
      server: {
        port: 3000,
        host: true,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
      }
    };
});
