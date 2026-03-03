module.exports = function (api) {
  const isTest = api.env("test");
  api.cache(() => isTest);
  const config = {
    presets: ["babel-preset-expo"],
    plugins: [],
  };

  if (!isTest) {
    config.plugins.push([
      "module-resolver",
      {
        root: ["."],
        alias: {
          "@": "./src",
          "@native": "./native",
        },
      },
    ]);
  }

  if (isTest) {
    config.plugins.push("babel-plugin-transform-import-meta");
    config.plugins.push([
      "transform-define",
      {
        "import.meta.env.DEV": false,
        "import.meta.env.PROD": true,
        "import.meta.env.VITE_ENABLE_RUNTIME_LOGGING": "false",
      },
    ]);
  }

  return config;
};
