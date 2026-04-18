"use client";

import { PaymentQuotes, usePaymentQuote } from "@/hooks/usePaymentQuote";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { getTokensForChain, Token } from "@/lib/token";
import { formatTokenSymbol } from "@/lib/utils";
import { Field, Formik } from "formik";
import { FixedInt } from "fpnum";
import { useJBTokenContext } from "juice-sdk-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayFormQuoteDetails } from "./PayFormQuoteDetails";
import { PayInput } from "./PayInput";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { PaySkeleton } from "./PaySkeleton";

export function PayForm() {
  const tokenB = useJBTokenContext().token.data;
  const chainId = useSelectedSucker().selectedSucker.peerChainId;
  const { tokenAToBQuote, isPriceLoading } = usePaymentQuote(chainId);
  const baseToken = useProjectBaseToken();

  const [memo, setMemo] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [amountC, setAmountC] = useState<string>("");
  const [quotes, setQuotes] = useState<PaymentQuotes>({ all: [] });

  const tokens = useMemo(() => getTokensForChain(chainId), [chainId]);
  const [tokenIn, setTokenIn] = useState<Token | undefined>();

  const [debouncedAmountA] = useDebounce(amountA, 500);
  const deferredTokenIn = useDeferredValue(tokenIn);
  const isDebouncingAmtA = debouncedAmountA !== amountA;

  useEffect(() => {
    if (!baseToken) return;
    setTokenIn((s) => tokens.find((t) => t.symbol === s?.symbol) || baseToken);
  }, [tokens, baseToken]);

  useEffect(() => {
    if (isPriceLoading) return;

    if (!debouncedAmountA || !deferredTokenIn) {
      setQuotes({ all: [] });
      setAmountB("");
      setAmountC("");
      return;
    }

    tokenAToBQuote(debouncedAmountA, deferredTokenIn).then((quotes) => {
      setQuotes(quotes);
      // todo, add skeleton if amount b is 0 (amountB being toFixed(3) blocks this)
      if (quotes.bestOnSelectedChain) {
        setAmountB(quotes.bestOnSelectedChain.payerTokens.format(3));
        setAmountC(quotes.bestOnSelectedChain.reservedTokens.format(3));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAmountA, deferredTokenIn, isPriceLoading]);

  if (!tokenB) return <PaySkeleton />;

  const _amountA = {
    amount: new FixedInt(
      parseUnits(amountA || "0", tokenIn?.decimals || tokens[0].decimals),
      tokenIn?.decimals || tokens[0].decimals,
    ),
    symbol: tokenIn?.symbol,
  };

  const _amountB = {
    amount: new FixedInt(parseUnits(amountB || "0", tokenB.decimals), tokenB.decimals),
    symbol: tokenB.symbol,
  };

  function resetForm() {
    setAmountA("");
    setAmountB("");
    setAmountC("");
    setQuotes({ all: [] });
    setResetKey((prev) => prev + 1); // Force PayDialog to remount
  }

  return (
    <div>
      <div className="flex justify-center items-center flex-col">
        <PayInput
          withPayOnSelect
          label="Pay"
          type="number"
          className="border-b border-zinc-200 border-t border-l border-r"
          onChange={(e) => {
            const valueRaw = e.target.value;
            
            // this prevents scrolling to negative values when focused on an input
            if (valueRaw.startsWith("-")) {
              setAmountA("0");
              return;
            }
            setAmountA(valueRaw);
            if (!valueRaw) resetForm();
          }}
          value={amountA}
          tokens={tokens}
          selectedToken={tokenIn}
          onSelectToken={(token) => {
            setTokenIn(token);
          }}
        />
        <div className="w-full border-r border-l border-zinc-200 bg-zinc-100 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col flex-1">
              <label className="text-md text-black-700">You get</label>
              {amountA && (isDebouncingAmtA || isPriceLoading) ? (
                <div className="activeSkeleton h-[30px] my-[1px] w-24 opacity-60 rounded-sm" />
              ) : (
                <div className="text-2xl text-zinc-900 cursor-not-allowed">
                  {_amountA.amount._value > 0n ? amountB || "0.00" : "0.00"}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-right select-none text-lg">
                {formatTokenSymbol(tokenB.symbol)}
              </span>
            </div>
          </div>

          <PayFormQuoteDetails quotes={quotes} amountIn={_amountA} />
        </div>
        <div className="flex gap-1 p-3 bg-zinc-200 border-r border-l border-zinc-300 w-full text-md text-zinc-700 overflow-x-auto whitespace-nowrap">
          Splits get {amountC || 0} {formatTokenSymbol(tokenB.symbol)}
        </div>
      </div>

      <div className="flex flex-row">
        <Formik initialValues={{}} onSubmit={() => {}}>
          <Field
            component="textarea"
            id="memo"
            name="memo"
            rows={2}
            className={
              "flex w-full min-h-[40px] h-[40px] border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 z-10 resize-none"
            }
            onChange={(e: any) => setMemo(e.target.value)}
            placeholder="Leave a note"
          />
        </Formik>
        <div className="w-[150px] flex">
          {tokenIn ? (
            <PayDialog
              key={resetKey}
              amountA={_amountA}
              amountB={_amountB}
              memo={memo}
              tokenIn={tokenIn}
              tokenOut={tokenB}
              pool={quotes.bestOnSelectedChain?.pool}
              disabled={!amountA}
              onSuccess={() => {
                resetForm();
                setMemo("");
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
