const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Container query breakpoints optimized for form widths
      containers: {
        'xs': '256px',   // Mobile form
        'sm': '384px',   // Small form
        'md': '448px',   // Medium form (when form is ~50% viewport)
        'lg': '576px',   // Large form (when form is ~75% viewport)
        'xl': '672px',   // Extra large form (full width or wide container)
        '2xl': '768px',  // 2XL form
        '3xl': '896px',  // 3XL form
        '4xl': '1024px', // 4XL form
      },
      // Smoother grid transitions between breakpoints
      spacing: {
        'gutter': '1.5rem', // Gap between fields
      }
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
}
