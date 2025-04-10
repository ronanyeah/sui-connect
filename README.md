# sui-connect

A wrapper for importing the `@mysten/dapp-kit` Sui wallet select menu into a non-React project. ([Webpack example](https://github.com/ronanyeah/elm-webpack))

For an alternative project that uses a `<script>` tag instead of imports, see: [juzybits/polymedia-suiconnect](https://github.com/juzybits/polymedia-suiconnect)

### Usage
```ts
import { WalletAccount } from "@mysten/wallet-standard";
import { init as suiConnectInit } from "sui-connect";

const hooks = await suiConnectInit("sui:testnet");

hooks.setModalOpen(true);

hooks.walletSubscribe((wallet: WalletAccount | null) => {
  console.log("wallet:", wallet);
});

const wallet: WalletAccount | null = hooks.currentAccount();

hooks.signTransaction(tx);

hooks.signMessage(msg);

hooks.disconnectWallet();
```