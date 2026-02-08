import * as React from "react";

import { Token } from "@/lib/token";
import { cn } from "@/lib/utils";
import { PayOnSelect } from "./PayOnSelect";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { TokenSelector } from "./TokenSelector";

export const preventMinusKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // prevent scientific notation 
  const invalidKeys = ["e", "E", "+", "-", "ArrowUp", "ArrowDown"];
  const key = e.key;

  // Allow all control/navigation keys:
  const controlKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "Home",
    "End",
    "ArrowLeft",
    "ArrowRight",
  ];

  if (controlKeys.includes(key)) {
    return; // allow
  }

  // Block invalid characters
  if (invalidKeys.includes(key)) {
    e.preventDefault();
    return;
  }

  // Key is a single character. Ensure it's a digit or decimal point.
  if (!/[\d.]/.test(key)) {
    e.preventDefault();
    return;
  }

  const current = e.currentTarget.value;
  const next = current + key;

  // Limit total length to 16
  if (next.length > 16) {
    e.preventDefault();
  }
};

export interface PayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  withPayOnSelect?: boolean;
  tokenSymbol?: string;
  inputClassName?: string;
  tokens?: Token[];
  selectedToken?: Token;
  onSelectToken?: (token: Token) => void;
}

const PayInput = React.forwardRef<HTMLInputElement, PayInputProps>(
  (
    {
      className,
      inputClassName,
      label,
      type,
      tokenSymbol,
      withPayOnSelect,
      tokens,
      selectedToken,
      onSelectToken,
      ...props
    },
    ref,
  ) => {
    const { selectedSucker } = useSelectedSucker();
    return (
      <div
        className={cn(
          "flex h-30 px-4 py-4 w-full items-center justify-between shadow-sm focus-within:ring-1 focus-within:ring-inset focus-within:ring-zinc-500 bg-zinc-100",
          className,
        )}
      >
        <div className="flex flex-col">
          <div className="flex flex-row gap-1">
            <label className="text-md text-black-700">{label}</label>
            {withPayOnSelect && <PayOnSelect />}
          </div>
          <input
            type={type}
            className={cn(
              "border-0 bg-transparent pl-0 pr-3 pt-1 pb-0 text-zinc-900 text-2xl w-full placeholder:text-zinc-400 focus:ring-0 sm:leading-6",
              inputClassName,
            )}
            onKeyDown={preventMinusKey}
            ref={ref}
            placeholder="0.00"
            {...props}
          />
        </div>
        {tokens && selectedToken && onSelectToken ? (
          <TokenSelector
            tokens={tokens}
            selectedToken={selectedToken}
            onSelectToken={onSelectToken}
            chainId={selectedSucker.peerChainId}
          />
        ) : (
          <span className="text-right select-none text-lg">{tokenSymbol}</span>
        )}
      </div>
    );
  },
);
PayInput.displayName = "PayInput";

export { PayInput };
