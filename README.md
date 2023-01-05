One Account, multiple seed-less wallets.

Introducing MagicWallet, the ultimate tool for stream ownership and seamless integration with the Orbis Protocol. With our app, you can use your Programmable Key Pairs (PKP) to access and execute all the functions of the Orbis Protocol, including sending transactions through a message monitoring system and connecting to other dApps like Uniswap to trade assets.

Our app also offers PKP access notification, which will be displayed in the grantee's dashboard when access to a PKP has been granted. Plus, our minified experimental version of the Orbis SDK allows you to create posts through Lit Action, streamlining your experience on the app.

It is designed to be a centralized platform where users can perform various actions based on their context, and it welcomes new developers to develop their own apps.

Experience the convenience and power of MagicWallet.me – try it out today!


# Features
1. *PKP & Stream Ownership*: PKPs are created with DID PKH and can own ceramic streams through the Orbis Protocol.
- **Orbis Protocol Integration** - The "Orbis Protocol" is fully integrated, allowing you to use your "PKP" to access and execute all of its available functions. These actions can be performed by authorized addresses with the necessary permissions.
    
    ![Untitled](https://i.ibb.co/5WFxP3Z/Untitled.png)
    
- *PKP Access Notification* - When a PKP owner grants access to a PKP to another address, there is currently no way to get this information and determine whether or not you have been granted permission to use the PKP. To add this capability, a message with a specific payload will be sent through the "Orbis.club DM" from the granter to notify the user. The grantee will then look for authorization messages, which contain the permitted PKPs, and the user will be able to use them on the dashboard. This process allows for automatic updates to the dashboard whenever access to a PKP has been granted.

- *Lit Action Create Post* A minified experimental version of the "Orbis SDK" has been extracted from the code and is able to create a post through "Lit Action". This is accomplished by bundling the Orbis SDK, creating a "DID" from the session key in Lit Action, passing it to the "Ceramic instance" in Lit Action, and using it to create a commit through "TileDocument". The post request is then sent without using "XMLHttpRequest", and a "Stream document" is composed and its "stream id" is retrieved.

- *Message-based execution*  You can use this feature when you want to execute an Orbis-message based action, such as sending a transaction to anyone using the command `/send <eth_address> <wei>`

- *Connect to other dApp using your PKP* - Use your PKP to connect to other dApps, such as Uniswap, and trade the underlying assets.

# Magic

Magic is powered by Orbis Protocol and Lit Protocol

| # | App | Github repository | Demo link |
| --- | --- | --- | --- |
| 1 | MagicWallet App | https://github.com/DustilDawn/Magic | https://magicwallet.me/ |
| 2 | Message-based execution backend | https://github.com/DustilDawn/worker | https://api.magicwallet.me/ |
| 3 | pkh-pkp | https://github.com/DustilDawn/pkh-pkp | https://www.npmjs.com/package/pkh-pkp  |
| 4 | orbis-sdk | https://github.com/DustilDawn/orbis-sdk/blob/de27fe2a4d2a312c4211c90bfda87c423fe2c174/index.js#L291 | https://www.npmjs.com/package/orbis-sdk |
| 5 | Lit Actions tool to bundle and minify OrbisSDK for Lit Actions | https://github.com/DustilDawn/lit-action-tile-document |  |
| 6 | Lit Action Orbis SDK | https://github.com/DustilDawn/orbis-sdk/blob/feat/get-session/index.js | https://github.com/DustilDawn/Magic/blob/main/src/server/orbis-sdk.js |
| 7 | Lit Action Private Key SDK | https://github.com/DustilDawn/lit-action-tile-document/blob/main/tile-action.js | https://github.com/DustilDawn/Magic/blob/main/src/server/tile-action.js |
