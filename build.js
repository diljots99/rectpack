// build.js
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["index.js"], // entry point of your app
  bundle: true,
  minify: true,
  outfile: "dist/rectpackbin.min.js",
  platform: "browser", // or "browser" for front-end projects
  target: "es2017", // adjust based on your target environment
}).catch(() => process.exit(1));
