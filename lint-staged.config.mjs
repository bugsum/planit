const config = {
  "*.{ts,tsx,js,mjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{json,md,css,yml,yaml}": "prettier --write",
};

export default config;
