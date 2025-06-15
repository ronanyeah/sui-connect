import "@mysten/dapp-kit/dist/index.css";

import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount, SuiChain } from "@mysten/wallet-standard";
import {
  SuiClientProvider,
  WalletProvider,
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSignTransaction,
  useSignPersonalMessage,
  SignedPersonalMessage,
  SignedTransaction,
} from "@mysten/dapp-kit";

const WALLET_CHANGE = "__wallet_change";

let CURRENT_ACCOUNT: WalletAccount | null = null;

const queryClient = new QueryClient();

export interface WalletHooks {
  walletSubscribe: (fn: (wallet: WalletAccount | null) => void) => void;
  signMessage: (bts: Uint8Array) => Promise<SignedPersonalMessage>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  disconnectWallet: () => void;
  signTransaction: (txb: Transaction) => Promise<SignedTransaction>;
  currentAccount: () => WalletAccount | null;
}

export function init(chain: SuiChain): Promise<WalletHooks> {
  const reactRoot = document.createElement("div");
  document.body.appendChild(reactRoot);
  const root = createRoot(reactRoot);
  const eventTarget = new EventTarget();

  return new Promise((resolve) => {
    root.render(
      React.createElement(App, {
        onMount: resolve,
        eventTarget,
        chain,
      })
    );
  });
}

interface ComponentArgs {
  chain: SuiChain;
  eventTarget: EventTarget;
  onMount: (walletHooks: WalletHooks) => void;
}

function App(args: ComponentArgs) {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(SuiClientProvider, {
      children: React.createElement(WalletProvider, {
        children: React.createElement(WalletComponent, args),
        autoConnect: true,
      }),
    })
  );
}

function WalletComponent(args: ComponentArgs) {
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  useEffect(() => {
    const walletHooks: WalletHooks = {
      walletSubscribe: (fn) =>
        args.eventTarget.addEventListener(WALLET_CHANGE, (event) => {
          const currentAccount = (event as CustomEvent)
            .detail as WalletAccount | null;
          return fn(currentAccount);
        }),
      currentAccount: () => CURRENT_ACCOUNT,
      signMessage: (bts) =>
        new Promise((resolve, reject) =>
          signPersonalMessage(
            { message: bts },
            {
              onSuccess: resolve,
              onError: reject,
            }
          )
        ),
      setModalOpen: setOpen,
      disconnectWallet: disconnect,
      signTransaction: (txb) =>
        signTransaction({ transaction: txb, chain: args.chain }),
    };

    args.onMount(walletHooks);
  }, [signTransaction, signPersonalMessage, disconnect, setOpen]);

  useEffect(() => {
    CURRENT_ACCOUNT = currentAccount;
    args.eventTarget.dispatchEvent(
      new CustomEvent(WALLET_CHANGE, {
        detail: currentAccount,
      })
    );
  }, [currentAccount]);

  return React.createElement(ConnectModal, {
    trigger: React.createElement("div"),
    open: open,
    onOpenChange: setOpen,
  });
}
