module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Worklets lo inyecta `babel-preset-expo` automáticamente; no duplicar.
  };
};
