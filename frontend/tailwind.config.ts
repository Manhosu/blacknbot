import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de cores dark mode moderno
        dark: {
          900: '#0A0A0B', // Preto profundo
          800: '#111112', // Cinza muito escuro
          700: '#1A1A1C', // Cinza escuro
          600: '#2A2A2E', // Cinza médio
          500: '#3A3A3F', // Cinza
          400: '#4A4A50', // Cinza claro
          300: '#6A6A70', // Cinza mais claro
          200: '#8A8A90', // Cinza suave
          100: '#ADADB3', // Cinza muito suave
        },
        primary: {
          900: '#0D1B2A', // Azul marinho muito escuro
          800: '#1B263B', // Azul marinho escuro
          700: '#2D3E50', // Azul acinzentado
          600: '#415A77', // Azul médio
          500: '#5577AA', // Azul principal
          400: '#7799DD', // Azul claro
          300: '#99BBFF', // Azul suave
          200: '#BBDDFF', // Azul muito suave
          100: '#E6F2FF', // Azul transparente
        },
        accent: {
          emerald: '#10B981',
          gold: '#F59E0B',
          purple: '#8B5CF6',
          red: '#EF4444',
          orange: '#F97316',
        },
        glass: {
          dark: 'rgba(26, 26, 28, 0.8)',
          darker: 'rgba(17, 17, 18, 0.9)',
          light: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.8s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.7s ease-out forwards',
        'slide-in-right': 'slideInRight 0.7s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounceSoft 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(85, 119, 170, 0.2), 0 0 10px rgba(85, 119, 170, 0.2), 0 0 15px rgba(85, 119, 170, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(85, 119, 170, 0.4), 0 0 20px rgba(85, 119, 170, 0.4), 0 0 30px rgba(85, 119, 170, 0.4)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(85, 119, 170, 0.3)',
        'glow-lg': '0 0 40px rgba(85, 119, 170, 0.4)',
        'dark': '0 10px 25px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 20px 40px rgba(0, 0, 0, 0.6)',
      },
      blur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #0A0A0B 0%, #111112 50%, #1A1A1C 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 50%, #2D3E50 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config; 