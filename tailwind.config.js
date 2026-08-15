/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        metis: {
          orange: '#FF6B00',
          'orange-hover': '#EA580C',
          'orange-light': '#FFF7ED',
          'orange-glow': 'rgba(255, 107, 0, 0.15)',
          charcoal: '#0F172A',
          surface: '#1E293B',
          card: '#0F172A',
          muted: '#64748B',
          'soft-gray': '#F8FAFC',
          border: '#334155',
        },
        trade: {
          profit: '#10B981',
          'profit-bg': 'rgba(16, 185, 129, 0.12)',
          loss: '#EF4444',
          'loss-bg': 'rgba(239, 68, 68, 0.12)',
          warning: '#F59E0B',
          'warning-bg': 'rgba(245, 158, 11, 0.12)',
          frozen: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['GeistMono', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavy: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'orange-glow': '0 0 25px -5px rgba(255, 107, 0, 0.4)',
        'profit-glow': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'loss-glow': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
