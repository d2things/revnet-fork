import { parseSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import { DescriptionSection } from "./about/components/DescriptionSection";
import { getProject } from "./getProject";
import { getSuckerGroup } from "./getSuckerGroup";
import { Metadata } from "next";
import { headers } from "next/headers";


export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  // For the root layout, our fullPath is '/'
  const fullPath = "/";
  const url = new URL(fullPath, origin);

  // gone but not forgotten anachronistic1-1.png
  const imgUrl = `${origin}/assets/img/rev-og-191-1.png`;
  const frame = {
    version: "next",
    imageUrl: imgUrl,
    button: {
      title: "Discover revenue tokens",
      action: {
        type: "launch_frame",
        name: "Revnet",
        url: url.href,
        splashImageUrl: `${origin}/assets/img/small-bw-200x200.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };

  return {
    title: "Create A Revnet",
    openGraph: {
      title: "Revnet - Create Revnet",
      description: "Revnet protocol allows organisations and individuals alike to collect, process, and tokenize payments from anyone, across all chains.",
      url: url.href,
      images: [
        {
          url: imgUrl,
          width: 1200,
          height: 800,
          alt: "Revnet preview image",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Revnet - Create Revnet",
      description: "Revnet protocol allows organisations and individuals alike to collect, process, and tokenize payments from anyone, across all chains.",
      images: [imgUrl],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}


interface Props {
  params: { slug: string };
}

export default async function AboutPage(props: Props) {
  const { slug } = props.params;
  const { chainId, projectId, version } = parseSlug(slug);

  const project = await getProject(projectId, chainId, version);
  if (!project) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  return <DescriptionSection projects={suckerGroup.projects?.items ?? []} />;
}
