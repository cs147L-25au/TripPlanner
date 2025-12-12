module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Note: react-native-reanimated plugin removed for Expo Go compatibility
    // Uncomment if using a development build:
    // plugins: ['react-native-reanimated/plugin'],
  };
};

