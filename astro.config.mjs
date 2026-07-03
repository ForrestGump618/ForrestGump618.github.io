import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
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

import { hyacinePlugin } from "@hyacine/astro";
import mdx from "@astrojs/mdx";

import spoiler from "./src/satteri-plugins/spoiler.ts";
import noteDirective from "./src/satteri-plugins/note-directive.ts";
import spanDirective from "./src/satteri-plugins/span-directive.ts";
import satteriBreaks from "./src/satteri-plugins/breaks.ts";
import satteriIns from "./src/satteri-plugins/ins.ts";
import satteriKatex from "./src/satteri-plugins/katex.ts";
import satteriAutolinkHeadings from "./src/satteri-plugins/autolink-headings.ts";
import satteriAutoImport from "./src/satteri-plugins/auto-import.ts";
import satteriEmoji from "./src/satteri-plugins/emoji.ts";
import satteriRubyDirective from "./src/satteri-plugins/ruby-directive.ts";

const mdxAutoImports = [
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
];

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
    processor: satteri({
      features: {
        gfm: true,
        math: true,
        directive: true,
        headingAttributes: true,
      },
      mdastPlugins: [
        satteriAutoImport(mdxAutoImports),
        satteriBreaks(),
        satteriIns(),
        satteriKatex(),
        satteriEmoji(),
        satteriRubyDirective(),
        noteDirective(),
        spanDirective(),
        [spoiler, { title: "..." }],
      ],
      hastPlugins: [satteriAutolinkHeadings()],
    }),
  },
});
