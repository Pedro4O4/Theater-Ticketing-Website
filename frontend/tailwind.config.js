/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/pages/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {

                primary: {
                    DEFAULT: '#6a3093',
                    light: '#9d4edd',
                    dark: '#4c216e'
                },
                secondary: {
                    DEFAULT: '#ff9e00',
                    light: '#ffca80',
                    dark: '#e58e00'
                },
                accent: {
                    teal: '#2ec4b6',
                    pink: '#ff6b97',
                    purple: '#7b2cbf'
                },
                dark: '#1b1b2f',
                light: '#f9fafc'
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
            },

            fontFamily: {
                sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
                heading: ['Playfair Display', 'serif']
            },
            animation: {
                'float': 'float 8s ease-in-out infinite',
                'gradient': 'gradient 15s ease infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0)' },
                    '50%': { transform: 'translateY(-20px) rotate(5deg)' },
                },
                gradient: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                }
            }
        }
    },
    plugins: [],
}