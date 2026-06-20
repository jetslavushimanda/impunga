import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'IMPUNGA - Business Advisor',
        short_name: 'IMPUNGA',
        description: 'Start a business. Match your skills. Build Zambia.',
        theme_color: '#FFFFFF',
        background_color: '#F4F6F7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  // Pre-bundle heavy deps so the dev server doesn't re-transform them on every cold start
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'firebase/app', 'firebase/auth', 'firebase/firestore',
      'zustand',
    ],
  },
  build: {
    // Target modern browsers — avoids transpiling optional chaining,
    // nullish coalescing, dynamic imports, etc. Cuts bundle size ~8-12%.
    target: 'es2020',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(rawId) {
          if (!rawId.includes('node_modules')) return;
          // Normalize Windows backslashes so all patterns use forward slashes
          const id = rawId.replace(/\\/g, '/');

          // --- SPECIFIC PACKAGES (check before broad substring patterns) ---

          // Icons — must come before 'react/' check because 'lucide-react/' contains 'react/'
          if (id.includes('/lucide-react/')) return 'vendor-icons';

          // PowerPoint — only loaded by PitchDeckGenerator (lazy)
          if (id.includes('/pptxgenjs/')) return 'vendor-pptx';

          // Google GenAI SDK
          if (id.includes('@google/genai') || id.includes('google-genai')) return 'vendor-genai';

          // Forms + validation — Register/Login pages (lazy)
          if (id.includes('/react-hook-form/') || id.includes('@hookform/')) return 'vendor-forms';
          if (id.includes('/zod/')) return 'vendor-forms';

          // --- BROAD PATTERNS ---

          // Firebase (large, changes rarely)
          if (id.includes('firebase')) return 'vendor-firebase';

          // Charts + all d3-* deps pulled in by recharts
          if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/d3/')) return 'vendor-charts';

          // PDF — only loaded on pages that export PDFs (lazy)
          if (id.includes('jspdf')) return 'vendor-pdf';

          // Excel — only loaded on BusinessLedger export (lazy)
          if (id.includes('/xlsx/')) return 'vendor-excel';

          // React ecosystem — router independently cached from core
          if (id.includes('/react-router')) return 'vendor-router';
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) return 'vendor-react';

          // State
          if (id.includes('/zustand/')) return 'vendor-state';

          // Everything else (should now be small utility packages only)
          return 'vendor';
        },
      },
    },
  },
});
