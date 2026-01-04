const fs = require("fs");

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg["lint-staged"] = {
  "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"],
  "*.{js,jsx,ts,tsx}": ["eslint --fix"],
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("Added top-level lint-staged config to package.json");
