/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Source Sans Pro', '-apple-system', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      serif: ['Noto Serif TC', '-apple-system', 'serif'],
    },
    backgroundSize: {
      auto: 'auto',
      cover: 'cover',
      contain: 'contain',
      'wrapper-size': '7%,5%,7%,7%,7%,7%,7%,5%,7%,7%,7%,7%',
      'banner-size-md': '6%,36%,9%,4%',
      'banner-size': '11%,72%,22%,7%',
    },
    borderWidth: {
      DEFAULT: '1px',
      0: '0',
      2: '2px',
      3: '3px',
      4: '4px',
      6: '6px',
    },
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          tertiary: 'var(--color-brand-tertiary)',
        },
        black: {
          100: 'var(--color-black-100)',
          200: 'var(--color-black-200)',
          300: 'var(--color-black-300)',
          400: 'var(--color-black-400)',
          500: 'var(--color-black-500)',
          900: 'var(--color-black-900)',
        },
        primary: {
          light: 'var(--color-primary-light)',
          blue: 'var(--color-primary-blue)',
          purple: 'var(--color-primary-purple)',
          'purple-50': 'var(--color-primary-purple-50)',
          brand: 'var(--color-primary-brand)',
          DEFAULT: 'var(--va-primary)',
        },
        secondary: {
          'purple-a': 'var(--color-secondary-purple-a)',
          'purple-b': 'var(--color-secondary-purple-b)',
          'blue-a': 'var(--color-secondary-blue-a)',
          'blue-b': 'var(--color-secondary-blue-b)',
          'green-a': 'var(--color-secondary-green-a)',
          'green-b': 'var(--color-secondary-green-b)',
          yellow: 'var(--color-secondary-yellow)',
          red: 'var(--color-secondary-red)',
          green: 'var(--color-secondary-green-b)',
          DEFAULT: 'var(--va-secondary)',
        },
        pink: {
          500: '#c386ae',
          700: '#da8bdc',
        },
        success: 'var(--va-success)',
        info: 'var(--va-info)',
        danger: 'var(--va-danger)',
        warning: 'var(--va-warning)',
        focus: 'var(--va-focus)',
        'background-primary': 'var(--va-background-primary)',
        'background-secondary': 'var(--va-background-secondary)',
        'background-element': 'var(--va-background-element)',
        'background-card-primary': 'var(--va-background-card-primary)',
        'background-card-secondary': 'var(--va-background-card-secondary)',
        'background-border': 'var(--va-background-border)',
        'text-primary': 'var(--va-text-primary)',
        'text-inverted': 'var(--va-text-inverted)',
      },
      stroke: (theme) => theme('colors'),
      boxShadow: (theme) => ({
        'pink-500': `6px 6px 0 theme('colors.pink.500')`,
      }),
      fill: (theme) => theme('colors'),
      backgroundImage: {},
      backgroundPosition: {
        'wrapper-top-left':
          '6% 100px, 4% 958px, 4% 1816px, 96% 529px, 96% 1125px, 96% 1721px, 4% 2674px, 4% 3532px, 4% 4390px, 96% 2317px, 96% 2913px, 96% 3509px',
        'banner-position-lg': '16% 37%, 50% 100%, 77% 30%, 72% 490px',
        'banner-position-md': '16% 37%, 50% 50%, 77% 30%, 72% 490px',
        'banner-position': '5% 135px, 50% 50%, 94% 99px, 85% 70%',
      },
      spacing: {
        '4x': '4rem', // 根據設計稿的 4x Grid/Spacing
      },
      borderRadius: {
        '4x': '4rem', // 根據設計稿的 4x Corner Radius
      },
    },
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1194px',
      xl: '1440px',
      '2xl': '1600px',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
