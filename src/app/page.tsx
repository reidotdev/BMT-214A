import { ArrowUpRight } from "lucide-react";
import { Link } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import { Showcase } from "@/components/showcase";
import { sanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/live";
import { pagesQuery } from "@/sanity/lib/queries";

type PageListItem = {
  _id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
};

export default async function Home() {
  // Run `pnpm typegen` after editing schemas to replace this manual type with
  // generated query types (sanity.types.ts) for end-to-end type safety.
  const pages: PageListItem[] = sanityConfigured
    ? ((await sanityFetch({ query: pagesQuery })).data as PageListItem[])
    : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 py-20">
      <Reveal className="flex flex-col gap-4">
        <span className="text-sm font-medium text-primary">
          Website Boilerplate
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Next.js · React Aria · Tailwind · Sanity · GSAP
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Accessible components, design tokens, an embedded CMS, and
          scroll-triggered motion — ready to restyle for the next project.
        </p>
        <div className="mt-2 flex items-center gap-4">
          <Link href="/studio" variant="button">
            Open Studio
          </Link>
          <Link
            href="https://react-spectrum.adobe.com/react-aria/components.html"
            target="_blank"
            className="inline-flex items-center gap-1"
          >
            React Aria components <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </Reveal>

      <Reveal>
        <Showcase />
      </Reveal>

      <Reveal className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Sanity content</h2>
        {sanityConfigured ? (
          pages.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {pages.map((page) => (
                <li key={page._id} className="text-sm">
                  <span className="font-medium">{page.title}</span>
                  {page.excerpt && (
                    <span className="text-muted-foreground">
                      {" "}
                      — {page.excerpt}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Connected. Create a “Page” document in the Studio to see it here.
            </p>
          )
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Sanity isn’t configured yet. Run <code>pnpm setup</code> (or fill{" "}
            <code>.env.local</code>) to connect a project.
          </p>
        )}
      </Reveal>
    </main>
  );
}
