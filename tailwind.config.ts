import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        sand: "#efe7db",
        ivory: "#fbf8f3",
        amber: "#b78a3d",
      },
      boxShadow: {
        panel: "0 16px 32px rgba(16, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
