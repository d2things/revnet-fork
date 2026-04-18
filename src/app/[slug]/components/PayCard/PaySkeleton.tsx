import { useJBTokenContext, useSuckers } from "juice-sdk-react";
import { JB_CHAINS } from "juice-sdk-core";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTokenSymbol } from "@/lib/utils";

export function PaySkeleton() {
  const { data: suckers } = useSuckers();
  const { token: tokenBContext } = useJBTokenContext();
  
  const peerChainId = suckers?.[0].peerChainId;
  const tokenSymbol = tokenBContext.data?.symbol;

  return (
    <div>
      <div className="flex justify-center items-center flex-col">
        <div className={"flex h-30 px-4 py-4 w-full items-center justify-between shadow-sm focus-within:ring-1 focus-within:ring-inset focus-within:ring-zinc-500 border border-zinc-200 bg-zinc-100"}>
          <div className="flex flex-col">
            <div className="flex flex-row gap-1">
              <div className="flex items-center gap-0.5 text-md text-black-700 cursor-not-allowed">
                Pay on
                <span className="underline ml-01">{JB_CHAINS[peerChainId ?? 1].name}</span>
                <ChevronDown size={16} className="opacity-50" />
              </div>
            </div>
            <input
              className={"border-0 bg-transparent pl-0 pr-3 pt-1 pb-0 text-zinc-900 text-2xl w-full placeholder:text-zinc-400 focus:ring-0 sm:leading-6"}
              placeholder="0.00"
              disabled
            />
          </div>
          <div className="flex items-center gap-0.5 text-lg text-black-700 cursor-not-allowed">
            ETH
            <ChevronDown size={16} className="opacity-50" />
          </div>
        </div>
        <div className="w-full border-r border-l border-zinc-200 bg-zinc-100 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col flex-1">
              <label className="text-md text-black-700">You get</label>
              <div className="activeSkeleton h-[30px] my-[1px] w-24 opacity-60 rounded-sm" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-right select-none text-lg">
                {formatTokenSymbol(tokenSymbol)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 p-3 bg-zinc-200 border-r border-l border-zinc-300 w-full text-md text-zinc-700 overflow-x-auto whitespace-nowrap">
          Splits get 0 {formatTokenSymbol(tokenSymbol)}
        </div>
      </div>

      <div className="flex flex-row">
        <textarea
          rows={2}
          className={"flex w-full min-h-[40px] h-[40px] border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 z-10 resize-none"}
          placeholder="Leave a note"
          disabled
        />
        <div className="w-[150px] flex">
          <Button className="w-full bg-teal-500 hover:bg-teal-600" disabled>
            Pay
          </Button>
        </div>
      </div>
    </div>
  )
}
