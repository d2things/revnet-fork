"use client";

import { useToast } from "@/components/ui/use-toast";
import { resolveBestV6PayRoute } from "@/lib/paymentTerminal";
import {
  currenciesMatchForWeight,
  getTokenAToBIssuanceQuoteWithWeightRatio,
  paymentCurrencyId,
  Quote,
} from "@/lib/quote";
import { Token } from "@/lib/token";
import { getUniswapQuotes } from "@/lib/uniswap/quote";
import { formatWalletError } from "@/lib/utils";
import { getViemPublicClient } from "@/lib/wagmiConfig";
import {
  ETH_CURRENCY_ID,
  getJBContractAddress,
  JBChainId,
  JBCoreContracts,
  jbPricesAbi,
  JBProjectToken,
  USD_CURRENCY_ID,
} from "@bananapus/nana-sdk-core";
import { useJBContractContext, useJBRulesetContext, useJBTokenContext } from "@bananapus/nana-sdk-react";
import { parseUnits, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useCurrencyPrice } from "./useCurrencyPrice";
import { useProjectBaseToken } from "./useProjectBaseToken";

export interface PaymentQuotes {
  all: Quote[];
  bestOnSelectedChain?: Quote;
  bestOnOtherChain?: Quote;
}

export function usePaymentQuote(chainId: JBChainId, projectId: bigint) {
  const { version } = useJBContractContext();
  const baseToken = useProjectBaseToken();
  const tokenB = useJBTokenContext().token.data;
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { toast } = useToast();
  const { address } = useAccount();

  // Still used to gate quoting until the ETH/USD feed is ready (cross-currency paths).
  const { isLoading: isPriceLoading } = useCurrencyPrice(
    USD_CURRENCY_ID(version),
    ETH_CURRENCY_ID,
    chainId,
  );

  const chainIds = Object.keys(baseToken?.tokenMap ?? {}).map((id) => Number(id) as JBChainId);

  async function tokenAToBQuote(valueRaw: string, token: Token): Promise<PaymentQuotes> {
    try {
      if (!ruleset?.data || !rulesetMetadata?.data || !tokenB || !baseToken) {
        throw new Error("Missing data. Please try again");
      }
      if (valueRaw === "0") return { all: [] };

      const amountIn = parseUnits(valueRaw, token.decimals);

      // v4/v5: weight-ratio issuance only (no multi-token USDC, no Uniswap comparison).
      // v6: on-chain previewPay (+ Uniswap AMM comparison); supports USDC multi-token pays.
      const issuanceQuote =
        version === 6
          ? // v6 USDC
            await getV6IssuanceQuote({
              chainId,
              projectId,
              token,
              amountIn,
              beneficiary: address ?? zeroAddress,
            })
          : await getLegacyIssuanceQuote({
              chainId,
              projectId,
              token,
              amountIn,
              baseToken,
              baseCurrency: Number(rulesetMetadata.data.baseCurrency),
              weight: ruleset.data.weight,
              reservedPercent: rulesetMetadata.data.reservedPercent,
              version,
            });

      // v6 USDC
      const uniswapQuotes =
        version === 6 ? await getUniswapQuotes(token, tokenB, amountIn, chainIds) : [];

      const all = [...(issuanceQuote ? [issuanceQuote] : []), ...uniswapQuotes].sort(
        (a, b) => b.payerTokens.toFloat() - a.payerTokens.toFloat(),
      );

      return {
        all,
        bestOnSelectedChain: all.find((q) => q.chainId === chainId),
        bestOnOtherChain: all.find((q) => q.chainId !== chainId),
      };
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: formatWalletError(err) });
      return { all: [] };
    }
  }

  return { tokenAToBQuote, isPriceLoading };
}

/** v4/v5 issuance quote via JBTerminalStore weightRatio math (base token only). */
async function getLegacyIssuanceQuote(args: {
  chainId: JBChainId;
  projectId: bigint;
  token: Token;
  amountIn: bigint;
  baseToken: NonNullable<ReturnType<typeof useProjectBaseToken>>;
  baseCurrency: number;
  weight: import("@bananapus/nana-sdk-core").RulesetWeight;
  reservedPercent: import("@bananapus/nana-sdk-core").ReservedPercent;
  version: 4 | 5 | 6;
}): Promise<Quote | null> {
  const {
    chainId,
    projectId,
    token,
    amountIn,
    baseToken,
    baseCurrency,
    weight,
    reservedPercent,
    version,
  } = args;

  try {
    const amountCurrency = paymentCurrencyId(token, baseToken);
    let weightRatio: bigint;

    if (currenciesMatchForWeight(amountCurrency, baseCurrency)) {
      // Same unit as JBTerminalStore when amount.currency == ruleset.baseCurrency
      // (also treats native 61166 and ETH base 1 as equivalent).
      weightRatio = 10n ** BigInt(token.decimals);
    } else {
      const client = getViemPublicClient(chainId);
      const prices = getJBContractAddress(JBCoreContracts.JBPrices, version, chainId);
      // pricingCurrency = payment token's accounting currency
      // unitCurrency    = ruleset base currency
      // decimals        = payment token decimals (NOT hard-coded 18)
      weightRatio = await client.readContract({
        address: prices,
        abi: jbPricesAbi,
        functionName: "pricePerUnitOf",
        args: [projectId, BigInt(amountCurrency), BigInt(baseCurrency), BigInt(token.decimals)],
      });
    }

    return getTokenAToBIssuanceQuoteWithWeightRatio(
      amountIn,
      weightRatio,
      weight,
      reservedPercent,
      chainId,
    );
  } catch (err) {
    console.error("legacy issuance quote failed:", err);
    return null;
  }
}

// v6 USDC
async function getV6IssuanceQuote(args: {
  chainId: JBChainId;
  projectId: bigint;
  token: Token;
  amountIn: bigint;
  beneficiary: `0x${string}`;
}): Promise<Quote | null> {
  const { chainId, projectId, token, amountIn, beneficiary } = args;

  try {
    const client = getViemPublicClient(chainId);
    // v6 USDC
    const route = await resolveBestV6PayRoute({
      client,
      chainId,
      projectId,
      token: token.address,
      amount: amountIn,
      beneficiary,
    });

    if (!route) return null;

    return {
      chainId,
      type: "issuance",
      payerTokens: new JBProjectToken(route.preview.beneficiaryTokenCount),
      reservedTokens: new JBProjectToken(route.preview.reservedTokenCount),
      terminal: {
        address: route.address,
        type: route.type,
      },
    };
  } catch (err) {
    console.error("v6 issuance quote failed:", err);
    return null;
  }
}
