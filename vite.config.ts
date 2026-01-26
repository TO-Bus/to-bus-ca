/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import postcssNesting from "postcss-nesting";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    analyzer(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /umoiq\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "ttc-eta-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // <== 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /ttc.ca\/ttcapi\/routedetail.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "ttc-subway-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // <== 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /tripplanner.yrt.ca.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "yrt-route-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // <== 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
