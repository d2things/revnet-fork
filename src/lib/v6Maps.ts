import { jbDirectoryAbi, jbDirectoryV4Abi, jbDirectoryV5Abi, jbMultiTerminalAbi, jbMultiTerminalV4Abi, jbMultiTerminalV5Abi, jbTerminalStoreAbi, jbTerminalStoreV4Abi, jbTerminalStoreV5Abi, revDeployerAbi, revDeployerV4Abi, revDeployerV5Abi, revLoansAbi, revLoansV4Abi, revLoansV5Abi, RevnetCoreContracts, revOwnerAbi } from "@bananapus/nana-sdk-core";


// Does not require address, ContractProvider provides terminal address
export const jbMultiTerminalMap = {
  4: jbMultiTerminalV4Abi,
  5: jbMultiTerminalV5Abi,
  6: jbMultiTerminalAbi
};

// Note, all contracts are the same, REVDeployer does not exsist on v4/v5
export const revDeployerOwnerMap = {
  4: {
    abi: revDeployerV4Abi,
    address: RevnetCoreContracts.REVDeployer
  },
  5: {
    abi: revDeployerV5Abi,
    address: RevnetCoreContracts.REVDeployer
  },
  6: {
    abi: revOwnerAbi,
    address: RevnetCoreContracts.REVOwner
  }
}

export const revLoansMap = {
  4: {
    abi: revLoansV4Abi,
    address: RevnetCoreContracts.REVLoans
  },
  5: {
    abi: revLoansV5Abi,
    address: RevnetCoreContracts.REVLoans
  },
  6: {
    abi: revLoansAbi,
    address: RevnetCoreContracts.REVLoans
  }
}

export const revDeployerMap = {
  4: revDeployerV4Abi,
  5: revDeployerV5Abi,
  6: revDeployerAbi
};


export const jbTerminalStoreMap = {
  4: jbTerminalStoreV4Abi,
  5: jbTerminalStoreV5Abi,
  6: jbTerminalStoreAbi
};

export const jbDirectoryMap = {
  4: jbDirectoryV4Abi,
  5: jbDirectoryV5Abi,
  6: jbDirectoryAbi
}