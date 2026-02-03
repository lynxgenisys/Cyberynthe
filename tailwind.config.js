/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyan: '#00ffff',
                'cyan-dim': 'rgba(0, 255, 255, 0.2)',
                magenta: '#ff00ff',
                'magenta-dim': 'rgba(255, 0, 255, 0.2)',
                'cyber-black': '#050510',
            },
            fontFamily: {
                mono: ['"Courier New"', 'Courier', 'monospace'],
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            },
            animation: {
                shimmer: 'shimmer 3s infinite linear',
            },
        },
    },
    plugins: [],
}
