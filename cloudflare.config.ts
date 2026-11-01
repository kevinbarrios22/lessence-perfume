import { bindings, defineConfig, defineWorker, exports as cfExports } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "lessence",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-26",
    compatibilityFlags: ["nodejs_compat"],
    observability: {
      enabled: true,
      logs: { enabled: true, headSamplingRate: 1 },
      traces: { enabled: true, headSamplingRate: 1 },
    },
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    exports: {
      CacheMetadata: cfExports.durableObject({ state: "deleted" }),
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      HYPERDRIVE: bindings.hyperdrive({
        id: "5ac0043fe4bd406aa48e34783ad58142",
        dev: process.env.NODE_ENV === "development" ? {
          connectionString: process.env.DATABASE_URL!
        } : undefined
      }),
      R2_ACCOUNT_ID: bindings.text(process.env.R2_ACCOUNT_ID!),
      R2_BUCKET: bindings.text(process.env.R2_BUCKET!),
      R2_PUBLIC_URL: bindings.text(process.env.R2_PUBLIC_URL!),

      R2_ACCESS_KEY_ID: bindings.secret(),
      R2_SECRET_ACCESS_KEY: bindings.secret(),

      ADMIN_PASSWORD: bindings.secret(),
      ADMIN_SECRET: bindings.secret(),

    },
  }),
});
