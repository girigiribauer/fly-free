import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import path from "path";
import fs from "fs/promises";

const base64import = {
  name: "svg-base64-import",
  async transform(_code: string, id: string) {
    if (id.endsWith(".svg")) {
      const svgSrc = path.relative(process.cwd(), id);
      const readPromise = fs.readFile(svgSrc, { encoding: "utf-8" });
      return readPromise.then((svgRaw) => {
        const value = `data:image/svg+xml,${encodeURIComponent(svgRaw)}`;
        return {
          code: `const value = '${value}'; export default value;`,
        };
      });
    } else {
        return null;
    }
  },
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
  },
  plugins: [
    react(),
    base64import,
  ],
  resolve: {
    alias: {
      "data-base64:~/": `${__dirname}/`,
      '~': `${__dirname}/`,
      '~/': `${__dirname}/`,
    },
  },
})
