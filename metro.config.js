const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;
const zustandMiddlewarePath = path.join(
  __dirname,
  "node_modules",
  "zustand",
  "middleware.js",
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "zustand/middleware") {
    return {
      type: "sourceFile",
      filePath: zustandMiddlewarePath,
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
