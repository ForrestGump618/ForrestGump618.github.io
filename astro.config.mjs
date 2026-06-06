import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import esToolkitPlugin from "vite-plugin-es-toolkit";
import { transformerColorizedBrackets } from "@shikijs/colorized-brackets";
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";

import UnoCSS from "@unocss/astro";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkIns from "remark-ins";
import remarkDirective from "remark-directive";
import remarkRubyDirective from "remark-ruby-directive";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
import remarkEmoji from "remark-emoji";
import remarkExtendedTable from "remark-extended-table";
import remarkBreaks from "remark-breaks";

import AutoImport from "astro-auto-import";

import { hyacinePlugin } from "@hyacine/astro";
import mdx from "@astrojs/mdx";

import spoiler from "./src/remark-plugins/spoiler.mjs";
import noteDirective from "./src/remark-plugins/note-directive.mjs";
import spanDirective from "./src/remark-plugins/span-directive.mjs";

import Font from "vite-plugin-font";

import PlayformInline from "@playform/inline";
import { installProcessWarningFilter } from "./src/toolkit/suppressWatcherWarning";
import themeConfig from "./src/theme.config.ts";

if (themeConfig.diagnostics?.suppressFsWatcherMaxListenersWarning !== false) {
  installProcessWarningFilter();
}

// https://astro.build/config
export default defineConfig({
  site: "https://preview.astro.kaitaku.xyz",
  trailingSlash: "always",
  build: {
    format: "directory",
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  integrations: [
    UnoCSS({
      injectReset: true,
    }),
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
    sitemap(),
    hyacinePlugin(),
    AutoImport({
      imports: [
        "@/components/mdx/Spoiler.astro",
        "@/components/mdx/Note.astro",
        "@/components/mdx/Label.astro",
        "@/components/mdx/Underline.astro",
        "@/components/mdx/Strike.astro",
        "@/components/mdx/Highlight.astro",
        "@/components/mdx/Text.astro",
        "@/components/mdx/Kbd.astro",
        "@/components/mdx/Sup.astro",
        "@/components/mdx/Sub.astro",
        "@/components/mdx/Collapse.astro",
        "@/components/mdx/QuizGroup.astro",
        "@/components/mdx/Quiz.astro",
        "@/components/mdx/QuizOptions.astro",
        "@/components/mdx/QuizOption.astro",
        "@/components/mdx/QuizAnswer.astro",
        "@/components/mdx/QuizGap.astro",
        "@/components/mdx/QuizMistake.astro",
        "@/components/mdx/Tabs.astro",
        "@/components/mdx/Tab.astro",
      ],
    }),
    mdx(),
    PlayformInline({
      Logger: 0,
    }),
  ],

  vite: {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).toString(),
      },
    },
    plugins: [
      Font.vite({
        scanFiles: ["src/**/*.{svelte,ts,tsx,js,jsx,md,mdx,json,astro}"],
        css: {
          fontDisplay: "optional",
        },
      }),
      esToolkitPlugin(),
    ],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerNotationErrorLevel(),
        transformerMetaHighlight(),
        transformerColorizedBrackets(),
      ],
    },
    processor: unified({
      remarkPlugins: [
        remarkMath,
        remarkBreaks,
        remarkRubyDirective,
        remarkIns,
        remarkDirective,
        noteDirective,
        spanDirective,
        remarkGfm,
        remarkEmoji,
        remarkExtendedTable,
        [spoiler, { title: "..." }],
      ],
      rehypePlugins: [rehypeKatex, rehypeAutoLinkHeadings],
    }),
  },
  experimental: {
    rustCompiler: true,
    queuedRendering: {
      enabled: true,
    },
  },
});
