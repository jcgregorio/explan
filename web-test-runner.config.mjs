import { esbuildPlugin } from "@web/dev-server-esbuild";
import { fileURLToPath } from "url";

export default {
  nodeResolve: true,
  watch: true,
  plugins: [
    esbuildPlugin({
      ts: true,
      target: "auto",
      tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
    }),
  ],
};
