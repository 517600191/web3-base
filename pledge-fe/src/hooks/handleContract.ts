import * as React from 'react';
import { useEffect, useState, useMemo } from "react";
import { useReadContract, useReadContracts } from 'wagmi';
import { erc20Abi, erc20ContractAddress } from '@/contractAbi/config.js';

export function HandleReadContract(functionName: string, args?: any[]) {
  const data = useReadContract({
    abi: erc20Abi,
    address: erc20ContractAddress,
    functionName,
    args,
  })

  return data;
}

export function HandleReadContracts(contracts: any) {
  for (var i in contracts) {
    contracts[i].abi = erc20Abi;
    contracts[i].address = erc20ContractAddress;
  }

  const data = useReadContracts({
    contracts,
  })

  return data;
}