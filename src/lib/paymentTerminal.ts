import {
  getJBContractAddress,
  JBChainId,
  jbContractAddress,
  JBCoreContracts,
  jbDirectoryAbi,
  jbMultiTerminalAbi,
  jbRouterTerminalAbi,
  JBRouterTerminalContracts,
  jbSwapTerminalAbi,
  JBSwapTerminalContracts,
  JBVersion,
} from "@bananapus/nana-sdk-core";
import { getContract, PublicClient, zeroAddress } from "viem";
import { Token } from "./token";

export async function getPaymentTerminal(args: {
  client: PublicClient;
  version: JBVersion;
  chainId: JBChainId;
  projectId: bigint;
  tokenIn: Token;
  baseToken: Pick<Token, "isNative">;
}) {
  const { client, version, chainId, projectId, tokenIn, baseToken } = args;

  const directory = getContract({
    address: getJBContractAddress(JBCoreContracts.JBDirectory, version, chainId),
    abi: jbDirectoryAbi,
    client,
  });

  const terminal = await directory.read.primaryTerminalOf([projectId, tokenIn.address]);

  if (!terminal) {
    throw new Error(`No primary terminal found for ${tokenIn.symbol}`);
  }

  const swapTerminal = getSwapTerminalAddress(version, chainId, baseToken.isNative);

  if (terminal === zeroAddress) {
    return { address: swapTerminal, abi: jbSwapTerminalAbi, type: "swap" };
  }

  if (version === 6) {
    const terminal = getJBContractAddress(JBRouterTerminalContracts.JBRouterTerminal, version, chainId);
    console.log("use jb router terminal", terminal)
    if (!terminal) throw new Error(`No primary native terminal v6`);

    return {
      address: terminal,
      abi: jbRouterTerminalAbi,
      type: "multi"
    }
  }

  const isSwapTerminal = terminal.toLowerCase() === swapTerminal.toLowerCase();

  return {
    address: terminal,
    abi: isSwapTerminal ? jbSwapTerminalAbi : jbMultiTerminalAbi,
    type: isSwapTerminal ? "swap" : "multi",
  };
}

function getSwapTerminalAddress(version: JBVersion, chainId: JBChainId, isNative: boolean) {
  if (version === 4) {
    return jbContractAddress[4].JBSwapTerminal1_1[chainId];
  }

  return getJBContractAddress(
    isNative
      ? JBSwapTerminalContracts.JBSwapTerminalRegistry
      : JBSwapTerminalContracts.JBSwapTerminalUSDCRegistry,
    version,
    chainId,
  );
}
