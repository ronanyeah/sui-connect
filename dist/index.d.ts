import "@mysten/dapp-kit/dist/index.css";
import React from "react";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount, SuiChain } from "@mysten/wallet-standard";
import { SignedPersonalMessage, SignedTransaction } from "@mysten/dapp-kit";
export interface WalletHooks {
    walletSubscribe: (fn: (wallet: WalletAccount | null) => void) => void;
    signMessage: (bts: Uint8Array) => Promise<SignedPersonalMessage>;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    disconnectWallet: () => void;
    signTransaction: (txb: Transaction) => Promise<SignedTransaction>;
    currentAccount: () => WalletAccount | null;
}
export declare function init(chain: SuiChain): Promise<WalletHooks>;
