import { defineConfig, presetAttributify, presetIcons, presetWind4 } from "unocss";
import themeConfig from "./src/theme.config";
import extractorSvelte from "@unocss/extractor-svelte";
import { transformerDirectives } from "unocss";

/**
 * Removes the icon prefix to obtain the raw icon name.
 * e.g. "i-ri-github-fill" → "github-fill"
 */
function stripIconPrefix(icon: string): string {
  return icon.replace(/^i-[a-z]+-/, "");
}

function pushNormalizedIcon(target: string[], icon?: string) {
  if (!icon) return;
  target.push(stripIconPrefix(icon));
}

function collectConfigIcons() {
  const icons: string[] = [];

  themeConfig.nav.forEach((item) => {
    pushNormalizedIcon(icons, item.icon);
    item.dropbox?.items?.forEach((subItem) => {
      pushNormalizedIcon(icons, subItem.icon);
    });
  });

  if (themeConfig.sidebar?.social) {
    Object.values(themeConfig.sidebar.social).forEach((value) => {
      pushNormalizedIcon(icons, value.icon);
    });
  }

  if (themeConfig.sidebar?.menu) {
    Object.values(themeConfig.sidebar.menu).forEach((value) => {
      pushNormalizedIcon(icons, value.icon);
    });
  }

  if (themeConfig.friends?.links) {
    themeConfig.friends.links.forEach((link) => {
      const icon = (link as { icon?: string }).icon;
      pushNormalizedIcon(icons, icon);
    });
  }

  return icons;
}

const iconSafeList = [
  ...collectConfigIcons(),
  "flag-line",
  "file-line",
  "external-link-line",
  "close-line",
];

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetAttributify(),
  ],
  extractors: [extractorSvelte()],
  safelist: [...new Set(iconSafeList.map((n) => `.i-ri-${n}`))],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      grey: {
        0: "var(--grey-0)",
        1: "var(--grey-1)",
        2: "var(--grey-2)",
        3: "var(--grey-3)",
        4: "var(--grey-4)",
        5: "var(--grey-5)",
        6: "var(--grey-6)",
        7: "var(--grey-7)",
        8: "var(--grey-8)",
        9: "var(--grey-9)",
      },
      primary: "var(--primary-color)",
      "color-link": "var(--primary-color)",
      color: "var(--text-color)",
      "text-muted": "var(--text-color-muted)",
      "text-subtle": "var(--text-color-subtle)",
      "header-text": "var(--header-text-color)",
      "body-bg-shadow": "var(--body-bg-shadow)",
      "box-bg-shadow": "var(--box-bg-shadow)",
      "border-muted": "var(--border-color-muted)",
      "color-red": "var(--color-red)",
      "color-pink": "var(--color-pink)",
      "color-orange": "var(--color-orange)",
      "color-yellow": "var(--color-yellow)",
      "color-green": "var(--color-green)",
      "color-aqua": "var(--color-aqua)",
      "color-blue": "var(--color-blue)",
      "color-purple": "var(--color-purple)",
      "color-grey": "var(--color-grey)",
    },
  },
});
