import "@mysten/dapp-kit/dist/index.css";
import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider, ConnectModal, useCurrentAccount, useDisconnectWallet, useSignTransaction, useSignPersonalMessage, } from "@mysten/dapp-kit";
var WALLET_CHANGE = "__wallet_change";
var CURRENT_ACCOUNT = null;
var queryClient = new QueryClient();
export function init(chain) {
    var reactRoot = document.createElement("div");
    document.body.appendChild(reactRoot);
    var root = createRoot(reactRoot);
    var eventTarget = new EventTarget();
    return new Promise(function (resolve) {
        root.render(React.createElement(App, {
            onMount: resolve,
            eventTarget: eventTarget,
            chain: chain,
        }));
    });
}
function App(args) {
    return React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(SuiClientProvider, {
        children: React.createElement(WalletProvider, {
            children: React.createElement(WalletComponent, args),
            autoConnect: true,
        }),
    }));
}
function WalletComponent(args) {
    var currentAccount = useCurrentAccount();
    var _a = useState(false), open = _a[0], setOpen = _a[1];
    var disconnect = useDisconnectWallet().mutate;
    var signTransaction = useSignTransaction().mutateAsync;
    var signPersonalMessage = useSignPersonalMessage().mutate;
    useEffect(function () {
        var walletHooks = {
            walletSubscribe: function (fn) {
                return args.eventTarget.addEventListener(WALLET_CHANGE, function (event) {
                    var currentAccount = event
                        .detail;
                    return fn(currentAccount);
                });
            },
            currentAccount: function () { return CURRENT_ACCOUNT; },
            signMessage: function (bts) {
                return new Promise(function (resolve, reject) {
                    return signPersonalMessage({ message: bts }, {
                        onSuccess: resolve,
                        onError: reject,
                    });
                });
            },
            setModalOpen: setOpen,
            disconnectWallet: disconnect,
            signTransaction: function (txb) {
                return signTransaction({ transaction: txb, chain: args.chain });
            },
        };
        args.onMount(walletHooks);
    }, [signTransaction, signPersonalMessage, disconnect, setOpen]);
    useEffect(function () {
        CURRENT_ACCOUNT = currentAccount;
        args.eventTarget.dispatchEvent(new CustomEvent(WALLET_CHANGE, {
            detail: currentAccount,
        }));
    }, [currentAccount]);
    return React.createElement(ConnectModal, {
        trigger: React.createElement("div"),
        open: open,
        onOpenChange: setOpen,
    });
}
