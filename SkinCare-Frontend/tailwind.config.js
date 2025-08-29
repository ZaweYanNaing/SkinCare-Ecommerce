/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '7.5': '1.875rem',
        '15': '3.75rem',
        '65': '16.25rem',
        '275': '68.75rem',
      },
      borderWidth: {
        '1': '1px',
      },
      minWidth: {
        '65': '16.25rem',
        '275': '68.75rem',
      },
      size: {
        '4.5': '1.125rem',
      }
    },
  },
  plugins: [],
};
