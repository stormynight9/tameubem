import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("posts");
  const sorted = posts.sort(
    (a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate)
  );
  return rss({
    title: "Lexington Themes",
    description:
      "Free and premium multipage themes and UI Kits For freelancers, developers, businesses, and personal use. Beautifully crafted with Astro.js, and Tailwind CSS — Simple & easy to customise.",
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      link: `/blog/posts/${post.id}`,
      pubDate: post.data.pubDate,
      description: post.data.description,
    })),
  });
}
