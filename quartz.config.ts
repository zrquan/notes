import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "知識補完計画",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "zh-CN",
    baseUrl: "zrquan.github.io",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    generateSocialImages: false,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "LXGW Wenkai",
        body: "LXGW Wenkai",
        code: "Fira Code",
      },
      colors: {
        lightMode: {
          light: "#eff1f5",          // page background
          lightgray: "#bcc0cc",      // borders
          gray: "#7287fd",           // graph links, heavier borders
          darkgray: "#4c4f69",       // body text
          dark: "#6c6f85",           // header text and icons
          secondary: "#1e66f5",      // link colour, current graph node
          tertiary: "#209fb5",       // hover states and visited graph nodes
          highlight: "#1e66f533",      // internal link background, highlighted text, highlighted lines of code
          textHighlight: "#7c7f934d",  // markdown highlighted text background
        },
        darkMode: {
          light: "#1e1e2e",
          lightgray: "#45475a",
          gray: "#b4befe",
          darkgray: "#cdd6f4",
          dark: "#a6adc8",
          secondary: "#89b4fa",
          tertiary: "#74c7ec",
          highlight: "#89b4fa33",
          textHighlight: "#9399b24d",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "catppuccin-latte",
          dark: "catppuccin-mocha",
        },
        keepBackground: false,
      }),
      Plugin.OxHugoFlavouredMarkdown(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
