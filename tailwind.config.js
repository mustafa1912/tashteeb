/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.js',
    './plugins/**/*.js',
    './utils/**/*.js',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Anchor Brand Colors
        navy: {
          50: '#EBF1F4',
          100: '#C9D8DF',
          500: '#12394A',
          700: '#0B232E',
          DEFAULT: '#12394A'
        },
        teal: {
          50: '#E3F1F4',
          100: '#BDE0E7',
          500: '#0F5C6E',
          700: '#0A3F4C',
          DEFAULT: '#0F5C6E'
        },
        // Vivid Egyptian Paint Palette
        terracotta: {
          50: '#FDF1EB',
          100: '#F9D6C7',
          500: '#D8572A',
          700: '#9F3D1A',
          DEFAULT: '#D8572A'
        },
        saffron: {
          50: '#FEF8EC',
          100: '#FDE8B8',
          500: '#F4B223',
          700: '#B8800D',
          DEFAULT: '#F4B223'
        },
        sky: {
          50: '#F1F7FB',
          100: '#D4E8F4',
          500: '#6FB1D9',
          700: '#3F86B0',
          DEFAULT: '#6FB1D9'
        },
        sage: {
          50: '#F3F9F5',
          100: '#D9EFE3',
          500: '#7DBE9A',
          700: '#4F926E',
          DEFAULT: '#7DBE9A'
        },
        clay: {
          50: '#FDF6F4',
          100: '#F9E3DF',
          500: '#E8A598',
          700: '#C46E5D',
          DEFAULT: '#E8A598'
        },
        lilac: {
          50: '#F6F4FB',
          100: '#E4DEF3',
          500: '#A58FD6',
          700: '#7356B2',
          DEFAULT: '#A58FD6'
        },

        // Aliased Primary and Accent for Backwards-Compatibility
        primary: {
          DEFAULT: '#0F5C6E',
          hover: '#0A3F4C',
          pressed: '#072E38',
          tint: '#E3F1F4',
          deep: '#12394A'
        },
        accent: {
          DEFAULT: '#D8572A',
          hover: '#B5431D',
          tint: '#FDF1EB',
          dark: '#E8A598'
        },

        // Surfaces & Neutrals
        cream: '#FFF8EC',
        plaster: '#F6EFE3',
        paper: '#FFFFFF',
        bg: '#FAF8F4',
        surface: '#FFFFFF',
        sand: '#F3EFE8',
        border: '#E6DCCB',
        ink: {
          DEFAULT: '#1C2B33',
          secondary: '#4F5F67',
          muted: '#8C999F'
        },

        // Semantic
        success: {
          DEFAULT: '#2E8B57',
          tint: '#E5F4EC'
        },
        danger: {
          DEFAULT: '#D64545',
          tint: '#FBE9E9'
        },
        warning: {
          DEFAULT: '#E0A21B',
          tint: '#FDF4DC'
        },
        info: {
          DEFAULT: '#2F7DD1',
          tint: '#E6F0FB'
        },

        // Category & Chart Palette
        chart: {
          1: '#0F5C6E',
          2: '#D8572A',
          3: '#F4B223',
          4: '#6FB1D9',
          5: '#7DBE9A',
          6: '#E8A598',
          7: '#A58FD6'
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"El Messiri"', 'system-ui', 'sans-serif'],
        'display-ar': ['"El Messiri"', '"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"IBM Plex Sans Arabic"', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif']
      },
      fontSize: {
        xs: ['12px', { lineHeight: '18px', letterSpacing: '0' }],
        'ar-xs': ['13px', { lineHeight: '20px', letterSpacing: '0' }],
        sm: ['14px', { lineHeight: '21px', letterSpacing: '0' }],
        base: ['16px', { lineHeight: '25px', letterSpacing: '0' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0' }],
        xl: ['20px', { lineHeight: '29px', letterSpacing: '0' }],
        '2xl': ['24px', { lineHeight: '33px', letterSpacing: '0' }],
        '3xl': ['32px', { lineHeight: '41px', letterSpacing: '0' }],
        '4xl': ['40px', { lineHeight: '49px', letterSpacing: '0' }],
        '5xl': ['52px', { lineHeight: '60px', letterSpacing: '0' }]
      },
      borderRadius: {
        card: '14px',
        'card-lg': '18px',
        control: '10px',
        pill: '999px',
        chip: '6px'
      },
      boxShadow: {
        card: '0 4px 16px rgba(28, 43, 51, 0.06)',
        elevated: '0 12px 32px rgba(28, 43, 51, 0.10)',
        focus: '0 0 0 2px #FAF8F4, 0 0 0 4px #0F5C6E',
        swatch: '0 8px 24px rgba(18, 57, 74, 0.12)'
      },
      spacing: {
        touch: '44px',
        section: '96px',
        'section-mobile': '64px'
      },
      maxWidth: {
        shell: '1320px'
      }
    }
  },
  plugins: []
}
