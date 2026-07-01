import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(process.cwd(), "index.html"),
                cart: resolve(process.cwd(), "cart.html"),
                "design-doc": resolve(process.cwd(), "design-doc.html"),
            },
        },
    },
});
