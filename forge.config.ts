import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import path from "path";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const config: ForgeConfig = {
  packagerConfig: {
    asar: { unpack: "**/node_modules/{sharp,@img}/**/*" },
    extraResource: ["src/database/migrations"],
    afterCopy: [
      (buildPath, electronVersion, platform, arch, callback) => {
        console.log("Build path:", buildPath);
        console.log("asarUnpack paths exist:", {
          sharp: require("fs").existsSync(
            path.join(buildPath, "node_modules/sharp")
          )
        });
        callback();
      }
    ],
    icon: "./src/assets/app-icon"
  },
  rebuildConfig: {
    force: true
  },
  makers: [
    new MakerSquirrel({
      setupIcon: "./src/assets/app-icon.ico",
      name: "CodeVille-POS",
      description: "Point of Sale application for small and medium businesses",
      authors: "CodeVille",
      setupExe: "CodeVille_POS_Setup.exe"
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({})
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/preload.ts"
            }
          },
          {
            html: "./src/activation/activation.html",
            js: "./src/activation/activation-renderer.ts",
            name: "activation_window",
            preload: {
              js: "./src/activation/activation-preload.ts"
            }
          }
        ]
      }
    }),
    {
      name: "@timfish/forge-externals-plugin",
      config: {
        externals: ["sharp"],
        includeDeps: true
      }
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
};

export default config;
