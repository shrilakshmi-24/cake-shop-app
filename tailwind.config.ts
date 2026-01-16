import type { Config } from "tailwindcss";

import colors from 'tailwindcss/colors';

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: colors.rose,
            }
        },
    },
    plugins: [],
};
export default config;
