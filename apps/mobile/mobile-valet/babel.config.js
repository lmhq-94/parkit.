module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // `babel-preset-expo` ya añade `react-native-worklets/plugin` si el paquete existe (SDK 54).
    // Reanimated 4 necesita además su propio plugin, siempre al final (después de worklets).
    plugins: ["react-native-reanimated/plugin"],
  };
};
