import { applyNanaFee, applyRevFee } from "@/lib/feeHelpers";
import { jbTerminalStoreMap } from "@/lib/v6Maps";
import { getProjectTerminalStore, JBChainId, jbTerminalStoreAbi, JBVersion } from "@bananapus/nana-sdk-core";
import { NATIVE_TOKEN } from "juice-sdk-core";
import { useReadContract } from "wagmi";

export function useReclaimableSurplus(params: {
  chainId: JBChainId | undefined;
  projectId: bigint | undefined;
  tokenAmount: bigint | undefined;
  version: JBVersion;
  decimals: number;
  currencyId: number;
}) {
  const { chainId, projectId, tokenAmount, version, decimals, currencyId } = params;

  const { data: raw, ...rest } = useReadContract({
    abi: jbTerminalStoreMap[version], 
    address: chainId && version ? getProjectTerminalStore(chainId, version) : undefined,
    functionName: "currentReclaimableSurplusOf",
    chainId,
    args:
      projectId && tokenAmount
        ? [
            projectId, 
            applyRevFee(tokenAmount), 
            [], 
            version === 6 ? [NATIVE_TOKEN] : [],  // v6 what is inputted here? 
            BigInt(decimals), 
            BigInt(currencyId)
          ]
        : undefined,
  });

  const afterFees = raw ? applyNanaFee(raw) : undefined;

  return { data: afterFees, raw, ...rest };
}
