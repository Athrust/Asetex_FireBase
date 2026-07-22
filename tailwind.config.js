/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#635bff',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        navy: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#0a0f1d',
          950: '#050811',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px -1px rgba(15, 23, 42, 0.15), 0 2px 4px -1px rgba(15, 23, 42, 0.10), 0 0 0 1px rgba(15, 23, 42, 0.06)',
        'card': '0 10px 25px -3px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.08)',
        'elevated': '0 20px 40px -6px rgba(15, 23, 42, 0.22), 0 8px 18px -4px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.10)',
        '3d': '0 12px 28px -4px rgba(15, 23, 42, 0.20), 0 4px 8px -2px rgba(15, 23, 42, 0.14), 0 2px 0 0 rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
