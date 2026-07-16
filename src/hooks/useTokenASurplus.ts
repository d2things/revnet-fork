import { jbMultiTerminalMap } from "@/lib/v6Maps";
import { jbMultiTerminalAbi, NATIVE_TOKEN, NATIVE_TOKEN_DECIMALS } from "@bananapus/nana-sdk-core";
import { useJBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";
import { useReadContract } from "wagmi";

export function useNativeTokenSurplus() {
  const {
    projectId,
    version,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const chainId = useJBChainId();

  const tokens = version === 6
    ? [NATIVE_TOKEN]
    : [{ token: NATIVE_TOKEN, decimals: NATIVE_TOKEN_DECIMALS, currency: 1 }] as any;

  return useReadContract({
    abi: jbMultiTerminalMap[version],
    functionName: "currentSurplusOf",
    chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      tokens,
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(1),
    ],
  });
}
