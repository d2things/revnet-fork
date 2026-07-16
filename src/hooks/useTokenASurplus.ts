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

  if (version === 6) {
    return useReadContract({
      abi: jbMultiTerminalMap[version],
      functionName: "currentSurplusOf",
      chainId,
      address: primaryNativeTerminal.data ?? undefined,
      args: [
        projectId,
        [NATIVE_TOKEN],
        BigInt(NATIVE_TOKEN_DECIMALS),
        BigInt(1),
      ],
    });
  };

  return useReadContract({
    abi: jbMultiTerminalMap[version],
    functionName: "currentSurplusOf",
    chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      [{ token: NATIVE_TOKEN, decimals: NATIVE_TOKEN_DECIMALS, currency: 1 }],
      BigInt(NATIVE_TOKEN_DECIMALS),
      BigInt(1),
    ],
  });
}
