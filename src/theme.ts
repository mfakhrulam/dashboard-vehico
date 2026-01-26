import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#ecfdf5' },
          100: { value: '#d1fae5' },
          200: { value: '#a7f3d0' },
          300: { value: '#6ee7b7' },
          400: { value: '#34d399' },
          500: { value: '#10b981' },
          600: { value: '#059669' },
          700: { value: '#047857' },
          800: { value: '#065f46' },
          900: { value: '#064e3b' },
        },
        stone: {
          50: { value: '#fafaf9' },
          100: { value: '#f5f5f4' },
          200: { value: '#e7e5e4' },
          300: { value: '#d6d3d1' },
          400: { value: '#a8a29e' },
          500: { value: '#78716c' },
          600: { value: '#57534e' },
          700: { value: '#44403c' },
          800: { value: '#292524' },
          900: { value: '#1c1917' },
        },
        warning: {
          500: { value: '#ea580c' },
        },
        danger: {
          500: { value: '#dc2626' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: { base: '{colors.brand.600}', _dark: '{colors.brand.400}' } },
          contrast: { value: { base: 'white', _dark: '{colors.stone.900}' } },
          fg: { value: { base: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
          muted: { value: { base: '{colors.brand.100}', _dark: '{colors.brand.800}' } },
          subtle: { value: { base: '{colors.brand.50}', _dark: '{colors.brand.900}' } },
          emphasized: { value: { base: '{colors.brand.200}', _dark: '{colors.brand.700}' } },
          focusRing: { value: { base: '{colors.brand.500}', _dark: '{colors.brand.400}' } },
        },
        bg: {
          value: { base: '{colors.stone.50}', _dark: '{colors.stone.900}' },
        },
        surface: {
          value: { base: 'white', _dark: '{colors.stone.800}' },
        },
        text: {
          value: { base: '{colors.stone.800}', _dark: '{colors.stone.100}' },
        },
        textMuted: {
          value: { base: '{colors.stone.600}', _dark: '{colors.stone.400}' },
        },
        border: {
          value: { base: '{colors.stone.200}', _dark: '{colors.stone.700}' },
        },
        warning: {
          value: '{colors.warning.500}',
        },
        danger: {
          value: '{colors.danger.500}',
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'bg',
      color: 'text',
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
