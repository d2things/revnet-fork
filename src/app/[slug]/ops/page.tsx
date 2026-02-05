import { SuckerTransactionStatus } from "@/generated/graphql";
import { getProjectsReclaimableSurplus } from "@/lib/reclaimableSurplus";
import { parseSlug } from "@/lib/slug";
import { NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { BalanceTable } from "../components/Value/BalanceTable";
import { SuckerTransactionsTable } from "../components/Value/suckerTransactions/SuckerTransactionsTable";
import { UserTokenActions } from "../components/Value/UserTokenActions";
import { getProject } from "../getProject";
import { getSuckerGroup } from "../getSuckerGroup";
import { getSuckerTransactions } from "../getSuckerTransactions";

const statusSchema = z.enum(["pending", "claimable", "claimed"]);

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function OpsPage(props: Props) {
  const { slug } = (await props.params);
  const { status } = (await props.searchParams);
  const { chainId, projectId, version } = parseSlug(slug);

  const project = await getProject(projectId, chainId, version);
  if (!project || !project.token) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  const projects = suckerGroup.projects?.items ?? [];

  const surplusesPromise = getProjectsReclaimableSurplus(projects);

  const filterStatus = statusSchema.safeParse(status).data as SuckerTransactionStatus | undefined;
  const transactionsPromise = getSuckerTransactions(
    project.suckerGroupId,
    version,
    chainId,
    filterStatus,
  );

  return (
    <div className="flex flex-col gap-8">
      <BalanceTable
        projects={projects}
        surplusesPromise={surplusesPromise}
        totalSupply={suckerGroup.tokenSupply}
      />

      <UserTokenActions projects={projects} surplusesPromise={surplusesPromise} />

      <Suspense>
        <SuckerTransactionsTable
          transactionsPromise={transactionsPromise}
          tokenDecimals={project.decimals ?? NATIVE_TOKEN_DECIMALS}
          tokenSymbol={project.tokenSymbol ?? "ETH"}
        />
      </Suspense>
    </div>
  );
}
