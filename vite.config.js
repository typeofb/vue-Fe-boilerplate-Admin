import {fileURLToPath, URL} from 'node:url';
import {extname} from 'node:path';
import {defineConfig, loadEnv} from 'vite';
import Vue from '@vitejs/plugin-vue';
import Vuetify, {transformAssetUrls} from 'vite-plugin-vuetify';

// 모든 SFC <style lang="scss"> 에 변수/믹스인 자동 주입 (node_modules, vuetify 설정 파일 제외)
const scssAdditionalData = (source, filename) => {
    if (filename.includes('node_modules') || filename.includes('vuetify-settings')) return source;
    return `@use "@/assets/scss/abstracts" as *;\n${source}`;
};

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isProd = mode === 'production';

    return {
        plugins: [
            Vue({
                template: {transformAssetUrls},
            }),
            Vuetify({
                autoImport: true,
                styles: {
                    configFile: 'src/assets/scss/vuetify-settings.scss',
                },
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
            extensions: ['.js', '.json', '.mjs', '.vue'],
        },
        css: {
            preprocessorOptions: {
                // quietDeps / silenceDeprecations: Vuetify 3.7 내부 Sass deprecation 경고 숨김
                scss: {
                    api: 'modern-compiler',
                    quietDeps: true,
                    silenceDeprecations: ['if-function'],
                    additionalData: scssAdditionalData,
                },
                sass: {api: 'modern-compiler', quietDeps: true, silenceDeprecations: ['if-function']},
            },
        },
        server: {
            port: Number(env.VITE_PORT) || 8610,
            open: false,
            proxy: env.VITE_PROXY_TARGET
                ? {
                      // /api/users → {VITE_PROXY_TARGET}/users
                      // 백엔드 경로에 /api 가 포함되어 있다면 rewrite 를 제거하세요.
                      '/api': {
                          target: env.VITE_PROXY_TARGET,
                          changeOrigin: true,
                          rewrite: (path) => path.replace(/^\/api/, ''),
                      },
                  }
                : undefined,
        },
        preview: {
            port: Number(env.VITE_PORT) || 8610,
        },
        esbuild: {
            // 운영 빌드에서 console.log / debugger 제거 (console.warn/error 는 유지)
            pure: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
            drop: isProd ? ['debugger'] : [],
        },
        build: {
            target: 'es2020',
            sourcemap: !isProd,
            assetsDir: 'assets',
            chunkSizeWarningLimit: 1500,
            rollupOptions: {
                output: {
                    // 확장자별 폴더 + 해시 파일명
                    assetFileNames: (assetInfo) => {
                        const name = assetInfo.names?.[0] ?? assetInfo.name ?? '';
                        let extType = extname(name).slice(1) || 'misc';
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) extType = 'img';
                        return `assets/${extType}/[name]-[hash][extname]`;
                    },
                    // 자주 바뀌지 않는 라이브러리를 별도 청크로 분리 (캐시 효율)
                    manualChunks: (id) => {
                        if (!id.includes('node_modules')) return;
                        return id.includes('vuetify') ? 'vendor-vuetify' : 'vendor';
                    },
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                },
            },
        },
    };
});
