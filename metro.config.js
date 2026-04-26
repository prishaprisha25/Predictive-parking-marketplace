// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to watch all files including newly created ones
config.resolver.platforms = ['android', 'ios', 'native', 'web'];

// Ensure all screen files are watched
config.watchFolders = [
  __dirname,
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'src/screens'),
  path.resolve(__dirname, 'src/navigation'),
  path.resolve(__dirname, 'src/context'),
  path.resolve(__dirname, 'src/types'),
  path.resolve(__dirname, 'src/utils'),
  path.resolve(__dirname, 'src/theme'),
];

module.exports = config;
