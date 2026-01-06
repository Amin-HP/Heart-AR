import { defineConfig } from 'vite';

export default defineConfig({
    base: '/Heart-AR/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            external: [
                'three',
                'three/addons/renderers/CSS3DRenderer.js',
                'mind-ar/dist/mindar-image-three.prod.js'
            ]
        }
    },
});
