import { applyNanaFee, applyRevFee } from "@/lib/feeHelpers";
import { getProjectTerminalStore, JBChainId, jbTerminalStoreAbi, JBVersion } from "@bananapus/nana-sdk-core";
import { useReadContract } from "wagmi";

export function useReclaimableSurplus(params: {
  chainId: JBChainId | undefined;
  projectId: bigint | undefined;
  tokenAmount: bigint | undefined;
  version: JBVersion | undefined;
  decimals: number;
  currencyId: number;
}) {
  const { chainId, projectId, tokenAmount, version, decimals, currencyId } = params;

  const { data: raw, ...rest } = useReadContract({
    abi: jbTerminalStoreAbi,
    address: chainId && version ? getProjectTerminalStore(chainId, version) : undefined,
    functionName: "currentReclaimableSurplusOf",
    chainId,
    args:
      projectId && tokenAmount
        ? [projectId, applyRevFee(tokenAmount), [], [], BigInt(decimals), BigInt(currencyId)]
        : undefined,
  });

  const afterFees = raw ? applyNanaFee(raw) : undefined;

  return { data: afterFees, raw, ...rest };
}
