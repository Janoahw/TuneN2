const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Keep Expo's pnpm/workspace watch folders, then add the monorepo root.
config.watchFolders = Array.from(
  new Set([...(config.watchFolders ?? []), monorepoRoot])
);

// Resolve packages from mobile's own node_modules first, then monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
