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
        primary: {
          DEFAULT: '#0F5C6E',
          hover: '#0B4A59',
          pressed: '#083B47',
          tint: '#E3F1F4',
          deep: '#0D3B47'
        },
        accent: {
          DEFAULT: '#E0662F',
          hover: '#C95A28',
          tint: '#FCEBE1',
          dark: '#F08A5D'
        },
        bg: '#FAF8F4',
        surface: '#FFFFFF',
        sand: '#F3EFE8',
        border: '#E6E0D6',
        ink: {
          DEFAULT: '#1C2B33',
          secondary: '#5B6B73',
          muted: '#8C999F'
        },
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
        chart: {
          1: '#0F5C6E',
          2: '#E0662F',
          3: '#E0A21B',
          4: '#5BA4A4',
          5: '#8C6A4F',
          6: '#A7B8BD',
          7: '#2E8B57'
        }
      },
      fontFamily: {
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
        card: '12px',
        control: '10px',
        pill: '999px'
      },
      boxShadow: {
        card: '0 4px 16px rgba(28, 43, 51, 0.06)',
        elevated: '0 12px 32px rgba(28, 43, 51, 0.10)',
        focus: '0 0 0 2px #FAF8F4, 0 0 0 4px #0F5C6E'
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
