import { notFound } from "next/navigation";
import App from "../../components/App";
import { parsePath, allPaths, pathFor } from "../../lib/routes";
import { meta, SITE } from "../../lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPaths().map((p) => ({ slug: p === "/" ? [] : p.slice(1).split("/") }));
}

const routeOf = async (params) => {
  const { slug } = await params;
  return parsePath(slug || []) || (slug?.length ? null : { view: "inicio", id: null });
};

export async function generateMetadata({ params }) {
  const route = await routeOf(params);
  if (!route) return {};
  const { title, description } = meta(route);
  const url = pathFor(route.view, route.id);
  return {
    title: route.view === "inicio" ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE, locale: "pt_BR", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Leonida Log — guia de GTA VI" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default async function Page({ params }) {
  const route = await routeOf(params);
  if (!route) notFound();
  return <App initial={route} />;
}
