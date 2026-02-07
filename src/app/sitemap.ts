import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.revnet.app/",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://www.revnet.app/create",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://www.revnet.app/v5:eth:3",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://www.revnet.app/v5:eth:1",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
