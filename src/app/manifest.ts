import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HYETAS",
    short_name: "HYETAS",
    description: "Have you ever seen a man throw a shoe — household load, lifted.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
