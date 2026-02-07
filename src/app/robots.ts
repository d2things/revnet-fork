import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const blockedBots = [
    "MJ12bot",
    "Mediapartners-Google*",
    "UbiCrawler",
    "DOC",
    "Zao",
    "sitecheck.internetseer.com",
    "Zealbot",
    "MSIECrawler",
    "SiteSnagger",
    "WebStripper",
    "WebCopier",
    "Fetch",
    "Offline Explorer",
    "Teleport",
    "TeleportPro",
    "WebZIP",
    "linko",
    "HTTrack",
    "Microsoft.URL.Control",
    "Xenu",
    "larbin",
    "libwww",
    "ZyBORG",
    "Download Ninja",
    "fast",
    "wget",
    "grub-client",
    "k2spider",
    "NPBot",
    "WebReaper",
  ]

  return {
    rules: [
      ...blockedBots.map((bot) => ({
        userAgent: bot,
        disallow: "/",
      })),
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.revnet.app/sitemap.xml",
  }
}
