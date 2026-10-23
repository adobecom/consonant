export const assets = [
  {
    id: "story-1",
    name: "Creative perspective",
    file: "slide-1",
    source: "carousel/slide-1.jpg",
  },
  {
    id: "story-2",
    name: "Behind the story",
    file: "slide-2",
    source: "carousel/slide-2.jpg",
  },
  {
    id: "story-3",
    name: "Made of possibility",
    file: "slide-3",
    source: "carousel/slide-3.jpg",
  },
  {
    id: "home-acrobat",
    name: "Acrobat homepage hero",
    file: "home-acrobat",
    source: "homepage/home-acrobat.webp",
  },
  {
    id: "home-upscale",
    name: "Firefly image upscale",
    file: "home-upscale",
    source: "homepage/home-upscale.webp",
  },
  {
    id: "home-documents",
    name: "Acrobat PDF Spaces",
    file: "home-documents",
    source: "homepage/home-documents.webp",
  },
  {
    id: "home-models",
    name: "Creative AI models",
    file: "home-models",
    source: "homepage/home-models.webp",
  },
  {
    id: "home-harmonize",
    name: "Photoshop Harmonize",
    file: "home-harmonize",
    source: "homepage/home-harmonize.webp",
  },
  {
    id: "home-tools",
    name: "Creative tools workspace",
    file: "home-tools",
    source: "homepage/home-tools.webp",
  },
  {
    id: "home-michelle",
    name: "Michelle Phan, Homepage story",
    file: "home-michelle",
    source: "homepage/home-michelle.webp",
  },
  // The two Storybook stills are named the other way round from the live
  // categories: the runner is the Creativity and design card and the Firefly
  // generate UI is the Content creation card (live homepage, WIP 12102:175264),
  // which also matches the hover clips video-hub-creative / video-hub-firefly.
  {
    id: "hub-creative",
    name: "Creativity and design",
    file: "hub-creative",
    source: "elastic-card-firefly.jpg",
  },
  {
    id: "hub-firefly",
    name: "Content creation",
    file: "hub-firefly",
    source: "elastic-card-creative-cloud.jpg",
  },
  {
    id: "hub-acrobat",
    name: "PDF and productivity",
    file: "hub-acrobat",
    source: "elastic-card-acrobat.jpg",
  },
  {
    id: "hub-business",
    name: "Adobe for Business",
    file: "hub-business",
    source: "elastic-card-genstudio.jpg",
  },
  {
    id: "hub-students",
    name: "Students and teachers",
    file: "hub-students",
    source: "elastic-card-students.jpg",
  },
  // Hero stills: first frames of the live homepage router-marquee videos
  // (provenance in apps/storybook/stories/assets/homepage/sources.json).
  {
    id: "hero-acrobat",
    name: "Acrobat hero (live still)",
    file: "hero-acrobat",
    source: "homepage/hero-acrobat.webp",
  },
  {
    id: "hero-creative",
    name: "Creative Cloud hero (live still)",
    file: "hero-creative",
    source: "homepage/hero-creative.webp",
  },
  {
    id: "hero-firefly",
    name: "Firefly hero (live still)",
    file: "hero-firefly",
    source: "homepage/hero-firefly.webp",
  },
  {
    id: "hero-business",
    name: "Adobe for Business hero (live still)",
    file: "hero-business",
    source: "homepage/hero-business.webp",
  },
  {
    id: "hero-education",
    name: "Students and teachers hero (live still)",
    file: "hero-education",
    source: "homepage/hero-education.webp",
  },
] as const;
export type AssetId = (typeof assets)[number]["id"];
// Background videos: the live homepage's router-marquee and category-card
// clips, self-hosted by scripts/prepare-assets.mjs (the adobe.com CDN refuses
// cross-origin video requests, so remote URLs never play from another origin).
export const videos = [
  { id: "video-hero-acrobat", name: "Acrobat hero", file: "hero-acrobat", source: "https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4" },
  { id: "video-hero-creative", name: "Creative Cloud hero", file: "hero-creative", source: "https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4" },
  { id: "video-hero-firefly", name: "Firefly hero", file: "hero-firefly", source: "https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4" },
  { id: "video-hero-business", name: "Adobe for Business hero", file: "hero-business", source: "https://www.adobe.com/upp/media_1fa8617c753dadad2b5de772c544a1091570c94b4.mp4" },
  { id: "video-hero-education", name: "Students and teachers hero", file: "hero-education", source: "https://www.adobe.com/upp/media_172ab3221a924e6451f0eeae9224a41c84f93724e.mp4" },
  { id: "video-hub-creative", name: "Creativity and design card", file: "hub-creative", source: "https://www.adobe.com/upp/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4" },
  { id: "video-hub-firefly", name: "Content creation card", file: "hub-firefly", source: "https://www.adobe.com/upp/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4" },
  { id: "video-hub-acrobat", name: "PDF and productivity card", file: "hub-acrobat", source: "https://www.adobe.com/upp/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4" },
  { id: "video-hub-business", name: "Adobe for Business card", file: "hub-business", source: "https://www.adobe.com/upp/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4" },
  { id: "video-hub-students", name: "Students and teachers card", file: "hub-students", source: "https://www.adobe.com/upp/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4" },
] as const;
export type VideoAssetId = (typeof videos)[number]["id"];
export function videoUrl(id: VideoAssetId) {
  const video = videos.find((entry) => entry.id === id);
  if (!video) throw new Error(`Unknown video: ${id}`);
  return `${import.meta.env.BASE_URL}media/video/${video.file}.mp4`;
}
export function assetUrl(id: AssetId, size: "small" | "large" = "large") {
  const asset = assets.find((entry) => entry.id === id);
  if (!asset) throw new Error(`Unknown asset: ${id}`);
  return `${import.meta.env.BASE_URL}media/${asset.file}-${size}.webp`;
}
