import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'node_modules/',
                '__tests__/',
                '.next/',
                'src/**/*.test.{ts,tsx}'
            ]
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
