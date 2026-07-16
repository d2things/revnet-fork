import { jbMultiTerminalMap } from "@/lib/v6Maps";
import { JBChainId, NATIVE_TOKEN, NATIVE_TOKEN_DECIMALS } from "@bananapus/nana-sdk-core";
import { useJBContractContext } from "@bananapus/nana-sdk-react";
import { useReadContract } from "wagmi";

/**
 * Return the current surplus of JB Native token, from the project's primary native terminal.
 */
export function useTokenSurplus({
  chainId,
  token,
  currency,
  decimals,
  inTermsOfCurrency,
  inTermsOfDecimals,
}: {
  chainId?: JBChainId;
  token?: `0x${string}`;
  currency?: number;
  decimals?: number;
  inTermsOfCurrency?: number;
  inTermsOfDecimals?: number;
} = {}) {
  const {
    projectId,
    version,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const _chainId = chainId;
  const _token = token ?? primaryNativeTerminal?.data ?? NATIVE_TOKEN;
  const _currency = currency ?? 1; // ETH currency ID
  const _decimals = decimals ?? NATIVE_TOKEN_DECIMALS;
  const _inTermsOfCurrency = inTermsOfCurrency ?? 1;
  const _inTermsOfDecimals = inTermsOfDecimals ?? NATIVE_TOKEN_DECIMALS;

  const tokens = version === 6
    ? [_token]
    : [{ token: _token, decimals: _decimals, currency: _currency }] as any;

  return useReadContract({
    abi: jbMultiTerminalMap[version],
    functionName: "currentSurplusOf",
    chainId: _chainId,
    address: primaryNativeTerminal.data ?? undefined,
    args: [
      projectId,
      tokens,
      BigInt(_inTermsOfDecimals),
      BigInt(_inTermsOfCurrency),
    ],
  });
}
