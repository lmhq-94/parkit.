module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // `babel-preset-expo` already adds `react-native-worklets/plugin` when the package exists (SDK 54).
    // Reanimated 4 also needs its own plugin, always at the end (after worklets).
    plugins: ["react-native-reanimated/plugin"],
  };
};
