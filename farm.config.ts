import { getPluginsList } from "./build/plugins";
// import { include, exclude } from "./build/optimize";
import { type UserConfigExport, type ConfigEnv, loadEnv } from "@farmfe/core";
import {
  root,
  alias,
  warpperEnv,
  // pathResolve,
  __APP_INFO__
} from "./build/utils";
import postcss from "@farmfe/js-plugin-postcss";
import sass from "@farmfe/js-plugin-sass";
import module from "module";

const require = module.createRequire(import.meta.url);

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const { VITE_CDN, VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH } =
    warpperEnv(loadEnv(mode, root)[0]);
  return {
    compilation: {
      output: {
        publicPath: VITE_PUBLIC_PATH,
        targetEnv: "browser-es2015",
        filename: "static/[ext]/[name]-[hash].[ext]",
        assetsFilename: "static/[ext]/[name]-[hash].[ext]"
      },
      resolve: {
        alias
      },
      script: {
        plugins: [
          {
            name: "@swc/plugin-remove-console",
            options: {
              exclude: ["error"]
            },
            filters: {
              moduleTypes: ["js", "ts", "jsx", "tsx"]
            }
          }
        ]
      },
      externalNodeBuiltins: false,
      define: {
        __INTLIFY_PROD_DEVTOOLS__: false,
        __APP_INFO__: process.env.FARM_FE
          ? __APP_INFO__
          : JSON.stringify(__APP_INFO__)
      }
    },
    root,
    // 服务端渲染
    server: {
      open: true,
      // 端口号
      port: VITE_PORT,
      // host: "0.0.0.0",
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {}
      // // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      // warmup: {
      //   clientFiles: ["./index.html", "./src/{views,components}/*"]
      // }
    },
    plugins: [
      sass({
        legacy: true,
        implementation: require("sass")
      }),
      // '@farmfe/plugin-sass',
      postcss(),
      {
        name: "remove-css-filter-plugin",
        priority: 0,
        transform: {
          filters: {
            resolvedPaths: ["element-plus/dist/index.css"]
          },
          async executor({ content }) {
            return {
              content: content.replace(/filter:\s*alpha\(opacity=0\);/g, "")
            };
          }
        }
      }
    ],
    vitePlugins: getPluginsList(VITE_CDN, VITE_COMPRESSION)
  };
};
