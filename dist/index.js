"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
require("@mysten/dapp-kit/dist/index.css");
var client_1 = require("react-dom/client");
var react_1 = __importStar(require("react"));
var react_query_1 = require("@tanstack/react-query");
var dapp_kit_1 = require("@mysten/dapp-kit");
var WALLET_CHANGE = "__wallet_change";
var CURRENT_ACCOUNT = null;
var queryClient = new react_query_1.QueryClient();
function init(chain) {
    var reactRoot = document.createElement("div");
    document.body.appendChild(reactRoot);
    var root = (0, client_1.createRoot)(reactRoot);
    var eventTarget = new EventTarget();
    return new Promise(function (resolve) {
        root.render(react_1.default.createElement(App, {
            onMount: resolve,
            eventTarget: eventTarget,
            chain: chain,
        }));
    });
}
function App(args) {
    return react_1.default.createElement(react_query_1.QueryClientProvider, { client: queryClient }, react_1.default.createElement(dapp_kit_1.SuiClientProvider, {
        children: react_1.default.createElement(dapp_kit_1.WalletProvider, {
            children: react_1.default.createElement(WalletComponent, args),
            autoConnect: true,
        }),
    }));
}
function WalletComponent(args) {
    var currentAccount = (0, dapp_kit_1.useCurrentAccount)();
    var _a = (0, react_1.useState)(false), open = _a[0], setOpen = _a[1];
    var disconnect = (0, dapp_kit_1.useDisconnectWallet)().mutate;
    var signTransaction = (0, dapp_kit_1.useSignTransaction)().mutateAsync;
    var signPersonalMessage = (0, dapp_kit_1.useSignPersonalMessage)().mutate;
    (0, react_1.useEffect)(function () {
        var walletHooks = {
            walletSubscribe: function (fn) {
                return args.eventTarget.addEventListener(WALLET_CHANGE, function (event) {
                    var currentAccount = event.detail.wallet;
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
    (0, react_1.useEffect)(function () {
        CURRENT_ACCOUNT = currentAccount;
        args.eventTarget.dispatchEvent(new CustomEvent(WALLET_CHANGE, {
            detail: { wallet: currentAccount },
        }));
    }, [currentAccount]);
    return react_1.default.createElement(dapp_kit_1.ConnectModal, {
        trigger: react_1.default.createElement("div"),
        open: open,
        onOpenChange: setOpen,
    });
}
