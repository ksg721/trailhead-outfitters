import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(process.cwd(), "index.html"),
                "product-detail": resolve(process.cwd(), "product-detail.html"),
                "design-doc": resolve(process.cwd(), "design-doc.html"),
            },
        },
    },
});
