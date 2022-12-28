import { Orbis } from "orbis-sdk";
import LitJsSdk from "lit-js-sdk";
import { useEffect, useState } from "react";

import { ethers } from "ethers";
import { Loading } from "./components/Loading";
import { True } from "./components/True";
import { False } from "./components/False";

import ScrollContainer from "react-indiana-drag-scroll";
import Logo from "./components/Logo";
import Icon from "./components/Icon";
import { scrollEaseIn } from "./utils/animate";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import Blockies from "react-blockies";
import { Magic } from "./Magic";
import { Cacao, SiweMessage } from "@didtools/cacao";

import { randomBytes, randomString } from "@stablelib/random";
import { DIDSession, createDIDKey, createDIDCacao } from "did-session";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamUtils } from "@ceramicnetwork/common";

import { CID } from "multiformats/cid";
import * as Block from "multiformats/block";
import * as dagCBOR from "@ipld/dag-cbor";
import { sha256 } from "multiformats/hashes/sha2";
import { toString } from "uint8arrays/to-string";
import { CacaoBlock } from "@didtools/cacao";
import { orbisSdk } from "./orbis-sdk";
import Dialog from "./Dialog";
import { b64OrbisSdk } from "./server/b64-orbis-sdk";
import { b64TileAction } from "./server/b64-tile-action";
import { GenerateSeed } from "./GenerateSeed";
import { Links } from "./components/Links";
import { Guide } from "./components/Guide";
import { OrbisProfile } from "./components/OrbisProfile";
import { LoadingWithText } from "./components/LoadingWithText";
import { ProfileBalance } from "./components/ProfileBalance";

import WalletConnect from "@walletconnect/client";
import { convertHexToNumber } from "@walletconnect/utils";
// import { LitPKP } from "lit-pkp-sdk";

const smartContracts = {
  pkp: "0x86062B7a01B8b2e22619dBE0C15cbe3F7EBd0E92",
  pkpAbi: require("./contracts/pkp.json"),
  router: "0xEA287AF8d8835eb20175875e89576bf583539B37",
  routerAbi: require("./contracts/router.json"),
};

const BOT_ADDRESS = "0x019c5821577B1385d6d668d5f3F0DF16A9FA1269";
// const BOT_API = 'http://localhost:8081'  ;
// const BOT_WS_API = 'ws://localhost:8080';
const BOT_API = "https://api.magicwallet.me";
const BOT_WS_API = "wss://api.magicwallet.me/ws";
const PAGE_MESSAGE_MONITOR = "dialog-monitor-message";
const PAGE_ORBIS_PROOF_POST = "btn-action-proof-post";
const PAGE_ORBIS_CREATE_POST = "page-orbis-create-post";
const PAGE_LIT_ACTION_SEED = "page-lit-action-seed";
const PAGE_LIT_ACTION_CREATE_POST = "page-lit-action-create-post";
const PAGE_LIT_ACTION_GET_POSTS = "page-lit-actions-get-posts";
const PAGE_WALLET_CONNECT = "page-wallet-connect";

function App() {
  const [didPrefix, setDidPrefix] = useState("did:pkh:eip155:1:");
  const [rpc, setRpc] = useState("https://rpc-mumbai.maticvigil.com");
  const [user, setUser] = useState();
  const [chain, setChain] = useState("mumbai");
  const [address, setAddress] = useState();
  const [pkps, setPkps] = useState();
  const [authorizedPkps, setAuthorizedPkps] = useState();
  const [orbis, setOrbis] = useState();
  const [lit, setLit] = useState();
  const [provider, setProvider] = useState(
    new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com")
  );
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState(-1);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState();
  const [success, setSuccess] = useState();
  const [authorizeAccount, setAuthorizeAccount] = useState();
  const [contracts, setContracts] = useState();
  const [authorizing, setAuthorizing] = useState(false);
  const [selectedAuthorizedAccount, setSelectedAuthorizedAccount] = useState();
  const [unauthorizing, setUnauthorizing] = useState(false);
  const [contentIndex, setContentIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const [clipboard, setClipboard] = useState(0);
  const [viewType, setViewType] = useState(0);
  const [authorizingMsg, setAuthorizingMsg] = useState("Authorizing...");
  const [unauthorizingMsg, setUnauthorizingMsg] = useState("Unauthorizing...");
  const [switching, setSwitching] = useState(false);
  const [proofPosting, setProofPosting] = useState(false);
  const [proofPostingMessage, setProofPostingMessage] = useState(
    "Posting Proof to Orbis..."
  );
  const [proofPostingResult, setProofPostingResult] = useState(null);

  const [currentPKP, setCurrentPKP] = useState();

  const [jobs, setJobs] = useState([]);
  const [monitorEnabled, setMonitorEnabled] = useState(false);

  const [iframeActive, setIframeActive] = useState(false);
  const [iframeLink, setIframeLink] = useState();
  const [signal, sendSignal] = useState(0);
  const [socket, setSocket] = useState();

  const [seed, setSeed] = useState();

  const [loginMessage, setLoginMessage] = useState();

  const [checkOnce, setCheckOnce] = useState(false);

  const [chainId, setChainId] = useState("0x13881");

  useEffect(() => {
    if (
      address &&
      user &&
      pkps &&
      lit &&
      orbis &&
      !authorizing &&
      !unauthorizing &&
      !success &&
      !error &&
      contracts &&
      currentPKP !== null
    ) {
      setLoggedIn(true);
      // setActivePage(0);
      // setActivePage('x');
      // setActivePage('io');
      // setActivePage('psaa');
    } else {
      setLoggedIn(false);
    }

    if (viewType !== null && selectedCardIndex !== null) {
      var _currentPKP;

      if (viewType === 0) {
        if (pkps) {
          _currentPKP = pkps[selectedCardIndex];
        }
      } else if (viewType === 1) {
        if (authorizedPkps) {
          _currentPKP = authorizedPkps[selectedCardIndex];
        }
      }

      setCurrentPKP(_currentPKP);
    }

    // if (socket) {
    //   console.log("socket =>", socket);
    // }
    if (
      !checkOnce &&
      (pkps || authorizedPkps) &&
      (viewType === 0 || viewType === 1)
    ) {
      console.log("CHECK ONCE!");
      check(0);
      setCheckOnce(true);
    }

    if (loggedIn) {
      if (!socket) {
        // socket
        const socket = new WebSocket(BOT_WS_API);
        socket.onmessage = (e) => {
          const data = JSON.parse(JSON.stringify(JSON.parse(e.data)));
          setJobs(data);
        };
        setSocket(socket);
      }
    }

    if (time == null) {
      setTime(getCurrentTime());

      setInterval(async () => {
        setTime(getCurrentTime());
      }, 1000);
    }

    function keyDownHandler(event) {
      if (event.key === "Escape") {
        event.preventDefault();

        // check if id="second-device" has class="active"
        var secondDevice = document.getElementById("second-device");

        if (iframeActive || secondDevice.classList.contains("active")) {
          setIframeActive(false);
          var timeout = setTimeout(() => {
            setIframeLink("");
            const iframe = document.queryselector("iframe");
            iframe.contentWindow.sessionStorage.clear();
            clearTimeout(timeout);
          }, 500);
          return;
        }

        setActivePage(0);
        sendSignal((signal) => signal + 1);

        var timeout;
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          setProofPostingResult("");
        }, 500);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (selectedCardIndex < pkps.length - 1) {
          setSelectedCardIndex((selectedCardIndex) => selectedCardIndex + 1);
          setFlip(false);
          scrollToCard(selectedCardIndex + 1, { ms: 300 });
        }
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (selectedCardIndex > 0) {
          setSelectedCardIndex((selectedCardIndex) => selectedCardIndex - 1);
          setFlip(false);
          scrollToCard(selectedCardIndex - 1, { ms: 300 });
        }
      }
    }

    // loading state
    document.addEventListener("keydown", keyDownHandler);

    return () => {
      // socket.close();
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [
    address,
    user,
    pkps,
    lit,
    orbis,
    contracts,
    selectedCardIndex,
    viewType,
    jobs,
  ]);

  // if (!monitorCheck) {
  async function check(index) {
    var current = (viewType === 0 ? pkps : authorizedPkps)[index];

    var res;

    try {
      res = await fetch(`${BOT_API}/api/has/job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          params: {
            pkp: current,
          },
        }),
      });

      var status = (await res.json()).status;
      console.log(`${current.address} status => ${status}`);

      if (status === "job exists") {
        setMonitorEnabled(true);
      } else {
        setMonitorEnabled(false);
      }
    } catch (e) {
      console.log("not ready");
      setMonitorEnabled(false);
    }
  }

  function scrollToCard(cardIndex, { start = 0, ms = 1000 }) {
    var scroll = document.getElementsByClassName("scroll-container")[0];
    var card = document.getElementsByClassName("credit-card")[cardIndex];
    // var paddingLeft = 18;
    var paddingLeft = card.clientWidth - 18;

    scrollEaseIn(scroll, card.offsetLeft + 1 - paddingLeft, ms);
  }

  // orbisLit
  async function connect() {
    var web3;

    setLoading(true);
    setLoginMessage("Switching to Mumbai");

    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    web3 = window.ethereum;

    try {
      web3.send("wallet_switchEthereumChain", [{ chainId: chainId }]);
    } catch (e) {
      web3.request({
        method: "wallet_addEthereumChain",
        params: {
          chainId: chainId,
          chainName: "Mumbai",
          nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
          rpcUrls: [rpc],
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        },
      });
    }

    setLoginMessage("Connecting Lit Serrano Testnet...");
    let lit = await connectLit();

    setLoginMessage("Connecting Orbis...");
    let orbis = await connectOrbis();

    if (lit && orbis) {
      setLoginMessage("Done!");
      setLoading(false);
    }
    setLoginMessage(null);
  }

  async function connectMagic() {
    const PKP_PUBKEY = (viewType === 0 ? pkps : authorizedPkps)[
      selectedCardIndex
    ].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain,
    });

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });
    await magicWallet.connect();

    return magicWallet;
  }

  async function getCode(file = "") {
    if (file === "tile-action") {
      return base64ToUtf8(b64TileAction);
    } else if (file === "orbis-sdk") {
      return base64ToUtf8(b64OrbisSdk);
    } else {
      throw new Error("file not found");
    }

    // if (!process.env.REACT_APP_ENV) {
    //   throw new Error('REACT_APP_ENV not set');
    // }

    // if (process.env.REACT_APP_ENV === 'dev') {

    //   var res = await fetch('http://localhost:8181/api/' + file);

    //   var code = await res.text() ?? 'console.log("404");';

    //   return code;

    // }
  }

  async function runLitAction(payload) {
    console.log(`Running "${payload.file}" in Lit Action`);

    var start = new Date().getTime();

    var code = payload.code ?? (await getCode(payload.file));

    console.warn("currentPKP.pubKey:", currentPKP.pubKey);

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    console.log("lit:", lit);

    let signatures = await lit.executeJs({
      // ipfsId: 'QmeUkT55U4m6CmvVq5aD62UzUP7dDkxTrJmKqcaSFCKDix',
      code,
      authSig,
      jsParams: {
        toSign: payload.toSign ?? [
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
        ],
        publicKey: currentPKP.pubKey,
        sigName: "sig1",
        ...payload.params,
      },
    });

    console.log("signatures:", signatures);
    console.log(signatures.logs);

    var end = new Date().getTime();
    var time = end - start;

    console.warn("time:", time);

    return signatures;
  }

  async function runAction(payload) {
    console.log(`Running "${payload.file}" in Lit Action`);

    var start = new Date().getTime();

    var code = payload.code ?? (await getCode(payload.file));

    console.warn("currentPKP.pubKey:", currentPKP.pubKey);

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    console.log("lit:", lit);

    let res = await lit.executeJs({
      // ipfsId: 'QmeUkT55U4m6CmvVq5aD62UzUP7dDkxTrJmKqcaSFCKDix',
      code,
      authSig,
      jsParams: {
        toSign: payload.toSign ?? [
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
        ],
        publicKey: currentPKP.pubKey,
        sigName: "sig1",
        ...payload.params,
      },
    });

    console.log("res:", res);
    console.log(res.logs);

    var end = new Date().getTime();
    var time = end - start;

    console.warn("time:", time);

    return res;
  }

  async function onLitActionPrivateKey(seedBuffer, content) {
    var res = {};

    if (!seedBuffer || !content) {
      res.status = 500;
      res.error = "seedBuffer or content is empty";
      return;
    }

    try {
      res = await runAction({
        file: "tile-action",
        params: {
          seed: seedBuffer,
          content,
          host: "https://node1.orbis.club/",
        },
      });
      res.status = 200;
      console.log(res);
    } catch (e) {
      console.log(e);
      res.status = 500;
      res.message = "Error: " + e.message;
    }

    return res;
  }

  async function mintPkp() {
    setMinting(true);
    setSuccess(null);
    setError(null);

    let wallet = new ethers.providers.Web3Provider(window.ethereum);

    try {
      // throw new Error('Minting is disabled now.');
      let contract = new ethers.Contract(
        smartContracts.pkp,
        smartContracts.pkpAbi,
        wallet.getSigner()
      );
      let cost = await contract.mintCost();
      let mint = await contract.mintNext(2, { value: cost.toString() });

      let wait = await mint.wait();

      await getPKPs(address);

      setSuccess(
        "PKP minted successfully! Go back to the main page to see it."
      );

      // await 2 seconds
      await new Promise((r) => setTimeout(r, 2000));
      setActivePage(0);
      setSelectedCardIndex(pkps.length);
      scrollToCard(pkps.length, { ms: 1000 });
    } catch (e) {
      setMinting(false);
      setError(e.message);
      await new Promise((r) => setTimeout(r, 2000));
      setError(null);
    }
    setMinting(false);
  }

  async function connectLit() {
    const client = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    await client.connect();

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    setLit(client);
    setAddress(authSig.address);

    setLoginMessage("Getting PKPs...");
    await getPKPs(authSig.address, { fromLoading: true });

    return client;
  }

  // get pkps
  async function getPKPs(
    controller,
    {
      remove,
      refetchAuthorizedAccounts,
      refetch = false,
      fromLoading = false,
    } = {}
  ) {
    let storagePkps;

    try {
      storagePkps = JSON.parse(localStorage.getItem("magic-pkps"))[controller];
    } catch (e) {}

    if (remove) {
      // find a token id in the array and remove it
      let index = storagePkps.findIndex((x) => x.tokenId === remove);
      if (index > -1) {
        storagePkps.splice(index, 1);
      }
      localStorage.setItem("magic-pkps", JSON.stringify(storagePkps));
    }

    if (!controller) {
      throw Error("controller not set");
    }

    let contract = new ethers.Contract(
      smartContracts.pkp,
      smartContracts.pkpAbi,
      provider
    );
    let contractRouter = new ethers.Contract(
      smartContracts.router,
      smartContracts.routerAbi,
      provider
    );
    let contracts = new LitContracts({
      rpc: rpc,
    });
    await contracts.connect();

    setContracts(contracts);

    let pkps = [];

    for (let i = 0; i < 999; i++) {
      let pkp;
      let tokenId;
      let pubKey;
      let address;
      let authorizedAccounts;
      let did;

      try {
        if (storagePkps && storagePkps[i]) {
          tokenId = storagePkps[i].tokenId;
          pubKey = storagePkps[i].pubKey;
          address = storagePkps[i].address;
          authorizedAccounts = storagePkps[i].authorizedAccounts;
        } else {
          pkp = await contract.tokenOfOwnerByIndex(controller, i);
          tokenId = pkp.toString();
          pubKey = await contractRouter.getPubkey(tokenId);
          authorizedAccounts =
            await contracts.pkpPermissionsContract.read.getPermittedAddresses(
              tokenId
            );
          address = ethers.utils.computeAddress(pubKey);
        }

        did = "did:pkh:eip155:1:" + address.toLowerCase();

        if (refetchAuthorizedAccounts) {
          authorizedAccounts =
            await contracts.pkpPermissionsContract.read.getPermittedAddresses(
              tokenId
            );
        }

        pkps.push({ tokenId, pubKey, address, authorizedAccounts, did });

        if (fromLoading) {
          setLoginMessage(`${i + 1} PKP${i + 1 > 1 ? "s" : ""}...`);
          await new Promise((r) => setTimeout(r, 50));
        }
      } catch (e) {
        break;
      }
    }

    if (fromLoading) {
      setLoginMessage("Storing it in your browser...");
      await new Promise((r) => setTimeout(r, 2000));
    }

    setPkps(pkps);
    try {
      let storage = JSON.parse(localStorage.getItem("magic-pkps"));

      storage[controller] = pkps;

      localStorage.setItem("magic-pkps", JSON.stringify(storage));
    } catch (e) {
      var usr = {};
      usr[controller] = pkps;

      localStorage.setItem("magic-pkps", JSON.stringify(usr));
    }

    return pkps;
  }

  async function connectPKP() {
    const PKP_PUBKEY = (viewType === 0 ? pkps : authorizedPkps)[
      selectedCardIndex
    ].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain,
    });

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });

    await magicWallet.connect();

    let orbis = new Orbis();

    await orbis.connect_pkp(magicWallet);
    await orbis.createPost({ body: "Hello World" });
  }

  function getLinks(docId) {
    return {
      orbis: `https://app.orbis.club/post/${docId}`,
      cerscan: `https://cerscan.com/mainnet/stream/${docId}`,
    };
  }

  function getProfileLink(did) {
    return `https://app.orbis.club/profile/${did.toLowerCase()}`;
  }

  async function onProofPost() {
    setProofPosting(true);
    setProofPostingMessage("Proof posting to Orbis...");
    var res = await magicActionHandler({
      method: "proof_post",
    });

    setProofPosting(false);
    setProofPostingMessage();

    if (res.status === 200) {
      setProofPostingResult(
        JSON.stringify({
          profile: ``,
          orbis: getLinks(res.doc).orbis,
          cerscan: getLinks(res.doc).cerscan,
        })
      );
    }
  }

  async function clearStates() {
    setProofPosting(false);
    setProofPostingMessage();
    setProofPostingResult();
  }

  async function magicActionHandler(payload) {
    const PKP_PUBKEY = (viewType === 0 ? pkps : authorizedPkps)[
      selectedCardIndex
    ].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain,
    });

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });

    await magicWallet.connect();

    let orbis = new Orbis();

    await orbis.connect_pkp(magicWallet);

    if (payload.method === "create_post") {
      let res = await orbis.createPost({ body: payload.data });
      return res;
    } else if (payload.method === "create_conversation") {
      let res = await orbis.createConversation(payload.data);
      return res;
    } else if (payload.method === "send_message") {
      let res = await orbis.sendMessage(payload.data);
      return res;
    } else if (payload.method === "follow") {
      let res = await orbis.setFollow(payload.data, true);
      return res;
    } else if (payload.method === "unfollow") {
      let res = await orbis.setFollow(payload.data, false);
      return res;
    } else if (payload.method === "get_conversations") {
      let res = await orbis.getConversations({
        did: payload.data,
      });
      return res;
    } else if (payload.method === "proof_post") {
      var tokenId = (viewType === 0 ? pkps : authorizedPkps)[selectedCardIndex]
        .tokenId;
      let contractRouter = new ethers.Contract(
        smartContracts.router,
        smartContracts.routerAbi,
        provider
      );
      var pubKey = await contractRouter.getPubkey(tokenId);
      var pkpAddress = ethers.utils.computeAddress(pubKey);

      const msg = `This post is created by a PKP\nTriggered by:${address}\nPKP Token ID:${tokenId}\nPKP Address:${pkpAddress}`;

      let res = await orbis.createPost({ body: msg });
      return res;
    } else if (payload.method === "notify_authorized") {
      // message
      const MSG = `${payload.data.authorizeAccount}\nhas been permitted to use\n${payload.data.tokenId}`;
      const did = `did:pkh:eip155:1:${payload.data.authorizeAccount.toLowerCase()}`;

      let res1 = await orbis.createConversation({
        recipients: [did],
        name: "PKP Authorized",
        description: MSG,
      });

      console.warn("res1:", res1);
    } else if (payload.method === "notify_unauthorized") {
      // message
      const MSG = `${payload.data.authorizeAccount}\nhas been removed to use\n${payload.data.tokenId}`;
      const did = `did:pkh:eip155:1:${payload.data.authorizeAccount.toLowerCase()}`;

      let res1 = await orbis.createConversation({
        recipients: [did],
        name: "PKP Unauthorized",
        description: MSG,
      });

      console.warn("res1:", res1);
    } else {
      throw new Error("method not found");
    }
  }

  async function connectOrbis() {
    let orbis = new Orbis();
    setOrbis(orbis);

    let res = await orbis.connect();

    if (res.status !== 200) throw new Error(res.message);

    setUser(res.did);

    return orbis;
  }

  async function createPost() {
    let res = await orbis.createPost({ body: "Hello World" });

    if (res.status !== 200) throw new Error(res.message);
  }

  async function editPost() {
    let streamId =
      "kjzl6cwe1jw148mdbse0ke7b6ygro8unpxmai219i41wyj221f525c5z98z7uxi";

    let res = await orbis.editPost(streamId, { body: "Edited!" });

    if (res.status !== 200) throw new Error(res.message);
  }

  async function getPosts() {
    let { data, error } = await orbis.getPosts({
      did: user,
    });

    if (error) throw new Error(error);
  }

  async function getConversations() {
    let { data, error } = await orbis.getConversations({
      did: user,
    });

    if (error) throw new Error(error);

    data.forEach((msg) => {
      // let payload = msg.content.description.split('\n');
      let payload = msg.content.description;
      let date = new Date(msg.last_message_timestamp * 1000);

      // format date to hours:minutes:seconds
      date = date.toLocaleTimeString();
    });
  }

  async function getPermittedPKPs() {
    let { data, error } = await orbis.getConversations({
      did: user,
    });

    if (error) throw new Error(error);

    var permittedTokens = [];

    data.forEach((msg) => {
      // let payload = msg.content.description.split('\n');
      let payload = msg.content.description;
      let timestamp = msg.last_message_timestamp;

      let authorizedAddress = payload.split("\n")[0];
      let tokenId = payload.split("\n")[2];

      if (authorizedAddress !== "undefined" && tokenId !== "undefined") {
        if (authorizedAddress === address) {
          permittedTokens.push({
            state:
              payload.split("\n")[1] === "has been permitted to use"
                ? true
                : false,
            tokenId: tokenId,
            timestamp,
          });
        }
      }
    });

    // filter unique tokens by last timestamp
    let filtered = permittedTokens.filter(
      (thing, index, self) =>
        index === self.findIndex((t) => t.tokenId === thing.tokenId)
    );

    var list = [];

    // for each permitted token, check if there's a token where its state is false and timestamp is greater than the current one
    filtered.forEach((token) => {
      let found = permittedTokens.find(
        (t) => t.tokenId === token.tokenId && t.state === false
      );

      if (found?.state === false && found.timestamp > token.timestamp) {
        return;
      }

      if (token.state) {
        list.push(token);
      }
    });

    let contract = new ethers.Contract(
      smartContracts.pkp,
      smartContracts.pkpAbi,
      provider
    );
    let contractRouter = new ethers.Contract(
      smartContracts.router,
      smartContracts.routerAbi,
      provider
    );
    let contracts = new LitContracts({ rpc });
    await contracts.connect();

    let pkps = [];

    // create a async for loop
    for (let i = 0; i < list.length; i++) {
      let pkp = list[i].tokenId;
      let tokenId;
      let pubKey;
      let address;
      let authorizedAccounts;
      let did;

      tokenId = pkp;
      pubKey = await contractRouter.getPubkey(tokenId);
      address = ethers.utils.computeAddress(pubKey);
      authorizedAccounts =
        await contracts.pkpPermissionsContract.read.getPermittedAddresses(
          tokenId
        );
      did = "did:pkh:eip155:1:" + address.toLowerCase();

      pkps.push({ tokenId, pubKey, address, authorizedAccounts, did });
    }

    return pkps;
  }

  function getCurrentTime() {
    // get current time in the format of hh:mm
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // add 0 in front of numbers < 10
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + minutes;
  }

  async function addWallet() {
    setActivePage("x");
  }

  function short(str, start = 6, end = 4, middle = "***") {
    if (!str) {
      return "not ready";
    }

    return (
      str.substring(0, start) +
      middle +
      str.substring(str.length - end, str.length)
    );
  }

  async function onAuthorize() {
    if (!authorizeAccount) {
      return;
    }

    setSuccess(null);
    setError(null);

    setAuthorizing(true);

    try {
      let tx = await contracts.pkpPermissionsContract.write.addPermittedAddress(
        pkps[selectedCardIndex].tokenId,
        authorizeAccount,
        []
      );
      let result = await tx.wait();
      setAuthorizingMsg("Updating PKPs...");
      await getPKPs(address, { refetchAuthorizedAccounts: true });

      // notify
      setAuthorizingMsg("Notifying user...");
      await magicActionHandler({
        method: "notify_authorized",
        data: {
          authorizeAccount,
          tokenId: pkps[selectedCardIndex].tokenId,
        },
      });
      setAuthorizingMsg("Finishing up...");
      setSuccess(`${authorizeAccount} has been authorized!`);

      // await 2 seconds
      await new Promise((r) => setTimeout(r, 2000));

      setSuccess(null);
      setActivePage(0);
      setAuthorizingMsg("Authorizing...");
    } catch (e) {
      setError(e.message);
      setAuthorizing(false);

      // await 2 seconds
      await new Promise((r) => setTimeout(r, 2000));
      setError(null);
    }

    setAuthorizing(false);
  }

  async function onUnauthorize() {
    setSuccess(null);
    setError(null);

    setUnauthorizing(true);

    try {
      let tx =
        await contracts.pkpPermissionsContract.write.removePermittedAddress(
          pkps[selectedCardIndex].tokenId,
          selectedAuthorizedAccount
        );
      let result = await tx.wait();
      setUnauthorizingMsg("Updating PKPs...");

      await getPKPs(address, { refetchAuthorizedAccounts: true });

      // notify
      setUnauthorizingMsg("Notifying user...");
      await magicActionHandler({
        method: "notify_unauthorized",
        data: {
          authorizeAccount: selectedAuthorizedAccount,
          tokenId: pkps[selectedCardIndex].tokenId,
        },
      });

      setSuccess(`${selectedAuthorizedAccount} has been unauthorized!`);

      // await 2 seconds
      await new Promise((r) => setTimeout(r, 2000));

      setSuccess(null);
      setActivePage(0);
      setUnauthorizingMsg("Unauthorizing...");
    } catch (e) {
      setError(e.message);
      setUnauthorizing(false);

      // await 2 seconds
      await new Promise((r) => setTimeout(r, 2000));
      setError(null);
      setActivePage(0);
    }

    setUnauthorizing(false);
  }

  function copyToClipboard(text) {
    setClipboard(text);
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();

    try {
      document.execCommand("copy");
    } catch (err) {}

    document.body.removeChild(tempInput);

    delayAction(() => {
      setClipboard(null);
    });
  }

  let intervalId = null;

  function delayAction(callback) {
    clearInterval(intervalId);

    intervalId = setInterval(() => {
      callback();
      clearInterval(intervalId);
    }, 5000);
  }

  async function getPermitted() {
    let result =
      await contracts.pkpPermissionsContract.read.getPermittedAddresses(
        pkps[selectedCardIndex].tokenId
      );
  }

  async function getPKPOrbis() {
    const orbis = new Orbis();

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain,
    });

    const magicWallet = new Magic({
      pkpPubKey: currentPKP.pubKey,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });

    await magicWallet.connect();
    await orbis.connect_pkp(magicWallet);
    return orbis;
  }

  async function getSession() {
    const orbis = new orbisSdk.Orbis();

    const ceramic = new CeramicClient("https://node1.orbis.club/");

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain,
    });

    const magicWallet = new Magic({
      pkpPubKey: currentPKP.pubKey,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });

    await magicWallet.connect();

    const session = await orbis.getSession(magicWallet);
    console.log("session:", session);
    return session;
  }

  // use lit action to use orbis sdk
  async function onLitActionsCreatePost(content) {
    const VERSION = 0;

    if (VERSION === 0) {
      const { ceramicSession } = await getSession();

      // var content = "Merry Christmas everyone!";

      var res;

      try {
        res = await runLitAction({
          file: "orbis-sdk",
          params: {
            method: "create_post",
            sessionKey: ceramicSession,
            content: {
              body: content,
            },
          },
        });
      } catch (e) {
        throw new Error("Unable to run lit action to create post");
      }

      // const result = res.response;

      const orbis = await getPKPOrbis();

      // const orbis = new Orbis();

      // const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      //   chain
      // });

      // const magicWallet = new Magic({
      //   pkpPubKey: currentPKP.pubKey,
      //   controllerAuthSig: CONTROLLER_AUTHSIG,
      //   provider: rpc,
      // });

      // await magicWallet.connect();
      // await orbis.connect_pkp(magicWallet);

      const posts = await orbis.getPosts({
        did: currentPKP.did,
      });

      var dupPosts = posts.data.filter((post) => {
        // the same content and the timestamp is less than 1 minute
        return (
          post.content.body === content &&
          Date.now() - post.timestamp * 1000 < 60000
        );

        // return post.content.body === content;
      });
      console.log(dupPosts);
      var postId;

      // remove all duplicates
      for (let i = 0; i < dupPosts.length; i++) {
        const post = dupPosts[i];

        // except the last one
        if (i === dupPosts.length - 1) {
          postId = post.stream_id;
        } else {
          console.log("delete post:", post.stream_id);
          await orbis.deletePost(post.stream_id);
        }
      }

      console.log("postId:", postId);

      return postId;
    }

    if (VERSION === 1) {
      const session = await DIDSession.fromSession(session.ceramicSession);

      ceramic.did = session.did;
      console.log("session:", session);

      orbis.ceramic = ceramic;

      const postSchemaCommit =
        "k1dpgaqe3i64kjuyet4w0zyaqwamf9wrp1jim19y27veqkppo34yghivt2pag4wxp0fv2yl4hedynpfuynp2wvd8s7ctabea6lx732xrr8b0cgqauwlh0vwg6";

      // const post = await orbis.createTileDocument({body: "gm!"}, ["orbis", "post"], postSchemaCommit);
      // const post = await TileDocument.create(
      //   ceramic,
      //   { body: "gm!" },
      //   {
      //     family: 'orbis',
      //     controllers: [session2.id],
      //     tags: ['orbis', 'post'],
      //     schema: postSchemaCommit
      //   }
      // );
      // console.log(post);
      // console.log(post.id.toString());
      const commit = await orbisSdk.TileDocument.makeGenesis(
        ceramic,
        { body: "gm!2" },
        {
          family: "orbis",
          controllers: [session2.id],
          tags: ["orbis", "post"],
          schema: postSchemaCommit,
        }
      );

      // const post = await ceramic.createStreamFromGenesis(0, commit);
      // console.log(post);
      // const DEFAULT_CREATE_FROM_GENESIS_OPTS = {
      //   anchor: true,
      //   publish: true,
      //   sync: 0,
      // };

      // console.log("this._apiUrl:", ceramic._apiUrl);
      // console.log("this._config.syncInterval:", ceramic._config.syncInterval);

      // const stream = await Document.createFromGenesis(
      //   ceramic._apiUrl,
      //   0,
      //   commit,
      //   { ...DEFAULT_CREATE_FROM_GENESIS_OPTS, ...{} },
      //   5000,
      // );

      // console.log("stream:", stream);
      const url = new URL("./streams", ceramic._apiUrl);
      const res = await fetch(url, {
        method: "post",
        body: JSON.stringify({
          type: 0,
          genesis: orbisSdk.StreamUtils.serializeCommit(commit),
          opts: {
            anchor: true,
            publish: true,
            pin: true,
            sync: 0,
          },
        }),
        headers: { "Content-Type": "application/json" },
      });

      console.log("res:", res);

      let { state } = await res.json();
      console.log("state:", state);

      const doc = new orbisSdk.Document(
        orbisSdk.StreamUtils.deserializeState(state),
        url,
        5000
      );
      console.log("doc =>", doc);

      const post = await ceramic.buildStreamFromDocument(doc);

      console.log("post.id =>", post.id.toString());
    }
  }

  async function onLitActionsGetPosts() {
    let res = await runAction({
      file: "orbis-sdk",
      params: {
        method: "get_posts",
      },
    });
    // var logs = res.logs /
    //   // logs.splice(0, 2);
    //   console.log(logs);
    // window.test = res;

    console.log(res);

    return res;

    // await ÷orbis.getPosts();
  }

  async function onAddJob() {
    var res = {};

    console.log("Add 1");
    try {
      res = await fetch(BOT_API + "/api/job", {
        method: "POST",
        body: JSON.stringify({
          task: "chat_message",
          params: {
            task: "chat_message",
            pkp: currentPKP,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Add 1 res:", res);
      // res.status = 200;
    } catch (e) {
      console.log("Add 3");
      console.log(e);
      res.status = 500;
    }
    console.log("Add 4");
    return res;
  }

  async function onRemoveJob() {
    var res = {};

    try {
      res = await fetch(BOT_API + "/api/job", {
        method: "POST",
        body: JSON.stringify({
          task: "remove_job",
          params: {
            task: "chat_message",
            pkp: currentPKP,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      // res.status = 200;
    } catch (e) {
      console.log(e);
      res.status = 500;
    }

    return res;
  }

  function base64ToUtf8(b64) {
    const str = Buffer.from(b64, "base64").toString("utf8");
    return str;
  }

  async function getAuthSig() {
    const client = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    await client.connect();

    // set timestamp 3 months from now
    const expiration = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 30 * 60
    ).toISOString();

    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain,
      expiration,
    });

    console.log(JSON.stringify(authSig));
  }

  async function permitBot() {
    var tx;
    var res = {};

    try {
      tx = await contracts.pkpPermissionsContract.write.addPermittedAddress(
        currentPKP.tokenId,
        BOT_ADDRESS,
        []
      );
      res = await tx.wait();
      console.log("addPermittedAddress=>", result);
      res.status = 200;
    } catch (e) {
      console.log(e);
      res.status = 500;
    }
    return res;
  }

  async function revokeBot() {
    var tx;
    var res = {};
    try {
      tx = await contracts.pkpPermissionsContract.write.removePermittedAddress(
        currentPKP.tokenId,
        BOT_ADDRESS
      );
      res = await tx.wait();
      res.status = 200;
    } catch (e) {
      console.log(e);
      res.status = 500;
    }
    console.log("removePermittedAddress=>", res);
    return res;
  }

  async function isBotPermitted() {
    var isPermitted =
      await contracts.pkpPermissionsContract.read.isPermittedAddress(
        currentPKP.tokenId,
        BOT_ADDRESS
      );
    console.log("isPermitted=>", isPermitted);
    return isPermitted;
  }

  async function goto(link) {
    setIframeLink(link);
    // wait for 2 seconds
    // await new Promise(r => setTimeout(r, 2000));
    setIframeActive(true);
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* device */}
        <div
          id="main-device"
          className={`device-apple ${iframeActive ? "main" : ""} ${
            loggedIn ? "active" : ""
          }`}
        >
          <div className="date">{time}</div>
          {!lit || !orbis || !user ? (
            <>
              {/* unauthorized */}
              <div className="page page-login">
                {/* <img src="/icon.png" className="App-logo" alt="logo" /> */}
                <div className={`login ${loading ? "active" : ""}`}>
                  <h1>
                    <span>The magic</span>
                  </h1>
                  <p>One Account, multiple seed-less wallets.</p>
                  <div className="button" onClick={connect}>
                    Connect
                  </div>
                </div>
                <div
                  className={`login-loading loading-with-text ${
                    loading ? "active" : ""
                  }`}
                >
                  {/* <div className="separator"></div> */}
                  <LoadingWithText msg={loginMessage} />
                </div>
              </div>
            </>
          ) : (
            <div className={`page page-main page-has-inner ${activePage}`}>
              <section>
                {/* <h6 className="center"><span>Account Manager</span></h6> */}

                <div
                  className="text user"
                  onClick={() => copyToClipboard(user)}
                >
                  {/* <div className={`copied active`}>Copied</div> */}
                  <span>
                    {didPrefix}
                    {short(user.split(":")[4], 6, 4, "...") ??
                      "[please connect orbis]"}
                  </span>
                </div>

                <div className="separator-md"></div>
              </section>

              <div className="page-inner">
                <div
                  className={`page-header ${
                    viewType === 1 ? "page-header-2" : ""
                  }`}
                >
                  <div className="spread view-type">
                    <h5
                      className={`view-type-h6 ${
                        viewType === 0 ? "active" : ""
                      }`}
                      onClick={() => setViewType(0)}
                    >
                      <span>Your Accounts</span>
                    </h5>
                    <h5
                      className={`view-type-h6 ${
                        viewType === 1 ? "active" : ""
                      }`}
                      onClick={async () => {
                        setSwitching(true);
                        setCurrentPKP(null);
                        var tokens = await getPermittedPKPs();
                        setAuthorizedPkps(tokens);
                        setSwitching(false);
                        setViewType(1);
                      }}
                    >
                      <span>Authorized Accounts</span>
                    </h5>
                  </div>
                  {viewType === 0 ? (
                    <Icon onClick={addWallet} name="add" />
                  ) : (
                    ""
                  )}
                </div>

                <ScrollContainer className="scroll-container">
                  {!switching &&
                  viewType === 1 &&
                  authorizedPkps.length <= 0 ? (
                    <div className="card-height"></div>
                  ) : (
                    ""
                  )}
                  <div className={`cards ${switching ? "switching" : ""}`}>
                    {(viewType === 0 && !pkps) ||
                    (viewType === 1 && !authorizedPkps) ||
                    switching ? (
                      <div className="card-height card-height2">
                        <Loading />
                      </div>
                    ) : (
                      (viewType === 0 ? pkps : authorizedPkps).map((pkp, i) => {
                        return (
                          <div
                            className={`credit-card ${
                              selectedCardIndex === i && flip ? "flip" : ""
                            } gradient-${i} ${
                              selectedCardIndex === i ? "active" : ""
                            }`}
                            key={i}
                          >
                            <div
                              className="cc-tap-to-select"
                              onClick={async () => {
                                setSelectedCardIndex(i);
                                check(i);
                                setFlip(false);
                                scrollToCard(i, { ms: 300 });
                              }}
                            >
                              <Icon name="tap" />
                            </div>

                            <div className="cc-more">
                              <Icon
                                name="more"
                                onClick={() => setFlip(!flip)}
                              />
                            </div>
                            {!(selectedCardIndex === i && flip) ? (
                              // front card
                              <div className="front-card">
                                <div className="cc-logo">
                                  <Logo brand="lit" />
                                </div>
                                {/* <div className="cc-profile" onClick={() => goto(getProfileLink(pkp.did))}>
                                      <Blockies
                                        seed={pkp.did}
                                        color="#F57689"
                                        bgColor="#063B5D"
                                        spotColor="#7E18B9"
                                      />
                                    </div> */}
                                <div className="cc-balance">
                                  <ProfileBalance address={pkp.address} />
                                </div>
                                <div
                                  className="cc-number"
                                  onClick={() => copyToClipboard(pkp.did)}
                                >
                                  <div
                                    className={`copied ${
                                      clipboard === pkp.did ? "active" : ""
                                    }`}
                                  >
                                    Copied
                                  </div>
                                  {short(pkp.address, 5, 5, "-")}
                                  {/* {pkp.address} */}
                                </div>

                                {/* <div className="cc-data">
                                      {
                                        orbis && pkp.did ?
                                          <OrbisProfile
                                            orbis={orbis}
                                            did={pkp.did}
                                          /> : ''
                                      }
                                    </div> */}
                              </div>
                            ) : (
                              // back card
                              <div className="cc-back">
                                <div
                                  className="cc-token"
                                  onClick={() => copyToClipboard(pkp.tokenId)}
                                >
                                  <div className="cc-token-name">Token ID</div>
                                  <div className="cc-token-addr">
                                    <div
                                      className={`copied ${
                                        clipboard === pkp.tokenId
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      Copied
                                    </div>
                                    {short(pkp.tokenId, 8, 8, "-")}
                                  </div>
                                </div>
                                <div
                                  className="cc-token"
                                  onClick={() => copyToClipboard(pkp.pubKey)}
                                >
                                  <div className="cc-token-name">
                                    Public Key
                                  </div>
                                  <div className="cc-token-addr">
                                    <div
                                      className={`copied ${
                                        clipboard === pkp.pubKey ? "active" : ""
                                      }`}
                                    >
                                      Copied
                                    </div>
                                    {short(pkp.pubKey, 8, 8, "-")}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {viewType === 0 && !switching ? (
                      <div
                        className="credit-card credit-card-add"
                        onClick={addWallet}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="48px"
                          height="48px"
                        >
                          <path d="M0 0h24v24H0z" fill="none" />
                          <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </ScrollContainer>

                <div className={`content contentIndex-${contentIndex}`}>
                  {/* content index 1 */}
                  <div className="content-page actions">
                    <div className="spread content-header">
                      <h5>
                        <span className={`${!currentPKP ? "disabled" : ""}`}>
                          Actions
                        </span>
                      </h5>
                      {/* <Icon onClick={() => {
                          setActivePage('io')
                        }} name="add" /> */}
                    </div>

                    {/* Here's a list of actions you can perform with your account. */}

                    <section>
                      <div
                        onClick={() => setActivePage(PAGE_ORBIS_PROOF_POST)}
                        className={`action ${!currentPKP ? "disabled" : ""}`}
                      >
                        <img
                          src="https://orbis.club/img/orbis-logo.png"
                          alt="orbis"
                        />
                        <span>
                          Orbis
                          <br />
                          Proof Post
                        </span>
                      </div>
                      <div
                        onClick={() => setActivePage(PAGE_ORBIS_CREATE_POST)}
                        className={`action ${!currentPKP ? "disabled" : ""}`}
                      >
                        <img
                          src="https://orbis.club/img/orbis-logo.png"
                          alt="orbis"
                        />
                        <span>
                          Orbis
                          <br />
                          Create Post
                        </span>
                      </div>
                      <div
                        onClick={() => setActivePage(PAGE_LIT_ACTION_SEED)}
                        className={`seed action ${
                          !currentPKP ? "disabled" : ""
                        }`}
                      >
                        <Icon name="seed" />
                        <span>
                          Lit Action
                          <br />
                          Seed
                        </span>
                      </div>
                      <div
                        onClick={() =>
                          setActivePage(PAGE_LIT_ACTION_CREATE_POST)
                        }
                        className={`action ${!currentPKP ? "disabled" : ""}`}
                      >
                        <Icon name="lit" />
                        <span>
                          Lit Action
                          <br />
                          Create Post
                        </span>
                      </div>

                      <div
                        onClick={() => setActivePage(PAGE_LIT_ACTION_GET_POSTS)}
                        className={`action ${!currentPKP ? "disabled" : ""}`}
                      >
                        <Icon name="lit" />
                        <span>
                          Lit Action
                          <br />
                          Get Posts
                        </span>
                      </div>

                      <div
                        onClick={() => setActivePage(PAGE_MESSAGE_MONITOR)}
                        className={`action ${!currentPKP ? "disabled" : ""}`}
                      >
                        <Icon
                          name={`${
                            monitorEnabled ? "listen-on" : "listen-off"
                          }`}
                        />
                        <span>
                          Message Listener {monitorEnabled ? "(ON)" : "(OFF)"}
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          goto("https://app.orbis.club/");
                          setActivePage(PAGE_WALLET_CONNECT);
                        }}
                        className={`action ${!currentPKP ? "disabled" : ""}`}
                      >
                        <Icon name={`wallet-connect`} />
                        <span>Connect PKP to Orbis</span>
                      </div>
                    </section>
                  </div>

                  {/* content index 2 */}
                  <div className="content-page authorized-accounts">
                    <div className="spread content-header">
                      <h5>
                        <span>Authorized Accounts</span>
                      </h5>
                      <Icon
                        onClick={() => {
                          setActivePage("io");
                        }}
                        name="add"
                      />
                    </div>
                    <div className="rows">
                      {!pkps
                        ? ""
                        : pkps[selectedCardIndex]?.authorizedAccounts.map(
                            (account, i) => {
                              if (account === address)
                                return <div key={i}></div>;

                              return (
                                <div key={i}>
                                  <div
                                    className="row"
                                    onClick={() => {
                                      setActivePage("psaa");
                                      setSelectedAuthorizedAccount(account);
                                    }}
                                  >
                                    <Blockies
                                      seed={account}
                                      size={10}
                                      scale={3}
                                      color="#35343a"
                                      bgColor="#f152b2"
                                      spotColor="#fe9e61"
                                      className="identicon"
                                    />
                                    <div className="row-col-1">{account}</div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                    </div>
                  </div>
                </div>

                <div className="separator-sm"></div>
                <div
                  className={`card-options ${!currentPKP ? "disabled" : ""}`}
                >
                  {/* <div className="card-option">
                      <div onClick={() => setFlip(!flip)} className={`card-option-icon`}><Icon name="wallet" /></div>
                      <span>Details</span>
                    </div> */}
                  <div className="card-option">
                    <div
                      onClick={() => setContentIndex(0)}
                      className={`${
                        contentIndex === 0 ? "active" : ""
                      } card-option-icon`}
                    >
                      <Icon name="app" />
                    </div>
                    <span>Actions</span>
                  </div>
                  <div className="card-option">
                    <div
                      onClick={() => setContentIndex(1)}
                      className={`${
                        contentIndex === 1 ? "active" : ""
                      } card-option-icon`}
                    >
                      <Icon name="key" />
                    </div>
                    <span>Auth</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* page-x */}
          <div className={`page page-pop page-x ${activePage}`}>
            <div
              className="text text-red cursor"
              onClick={() => {
                setActivePage(0);
                clearStates();
              }}
            >
              Cancel
            </div>
            <div className="page-center">
              <h1>
                <span>Add new Wallet</span>
              </h1>
              <p>Keep all the cloud wallets in one place.</p>
              <div className="button-brand-2" onClick={mintPkp}>
                Get a new one!
              </div>
              {minting ? (
                <div className="loading-with-text">
                  <Loading />
                  <span>Minting...</span>
                </div>
              ) : (
                ""
              )}
              {error ? <div className="text text-red">{error}</div> : ""}
              {success ? <div className="text text-green">{success}</div> : ""}
            </div>
          </div>

          {/* page-selected-authorized-account */}
          <div
            className={`page page-pop page-selected-authorized-account ${activePage}`}
          >
            <div
              className="text text-red cursor"
              onClick={() => {
                setActivePage(0);
                setSelectedAuthorizedAccount(null);
                setUnauthorizing(false);
              }}
            >
              Done
            </div>
            <div className="page-center">
              <h1>
                <span>Account</span>
              </h1>

              <div className="separator"></div>
              {selectedAuthorizedAccount === address ? (
                <div className="text-lg text-red center">
                  <div className="separator-sm"></div>
                  THIS IS YOUR OWN ACCOUNT, IF YOU DELETE THIS YOU WILL LOSE
                  ACCESS TO YOUR WALLET
                  <div className="separator-sm"></div>
                </div>
              ) : (
                ""
              )}

              <div className="button-cancel" onClick={() => onUnauthorize()}>
                <div className="text-sm">{selectedAuthorizedAccount}</div>
                <div>Unauthorize account</div>
              </div>

              {/* states */}
              {unauthorizing ? (
                <div className="loading-with-text">
                  <div className="separator-sm"></div>
                  <Loading />
                  <span>{unauthorizingMsg}</span>
                  <div className="separator-sm"></div>
                </div>
              ) : (
                ""
              )}

              {error ? (
                <div className="text text-red center">
                  <div className="separator-sm"></div>
                  {error}
                  <div className="separator-sm"></div>
                </div>
              ) : (
                ""
              )}

              {success ? (
                <div className="text text-green center">
                  <div className="separator-sm"></div>
                  {success}
                  <div className="separator-sm"></div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* add authorized account */}
          <div className={`page page-input ${activePage === "io" ? "io" : ""}`}>
            <div className="page-input-inner">
              <div className="page-center">
                <div className="separator-sm"></div>
                <div className="">
                  <h6 className="center">
                    <span>
                      Enter the address of the account <br />
                      you want to authorize.
                    </span>
                  </h6>
                </div>
                <div className="separator-sm"></div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={authorizeAccount}
                    onChange={(e) => setAuthorizeAccount(e.target.value)}
                  />

                  <div className="button-group">
                    <div
                      className="button-cancel"
                      onClick={() => setActivePage(0)}
                    >
                      Cancel
                    </div>
                    <div
                      className="button-brand-2"
                      onClick={() => onAuthorize()}
                    >
                      Save
                    </div>
                  </div>

                  {/* states */}
                  {authorizing ? (
                    <div className="loading-with-text">
                      <div className="separator-sm"></div>
                      <Loading />
                      <span>{authorizingMsg}</span>
                      <div className="separator-sm"></div>
                    </div>
                  ) : (
                    ""
                  )}

                  {error ? (
                    <div className="text text-red center">
                      <div className="separator-sm"></div>
                      {error}
                      <div className="separator-sm"></div>
                    </div>
                  ) : (
                    ""
                  )}

                  {success ? (
                    <div className="text text-green center">
                      <div className="separator-sm"></div>
                      {success}
                      <div className="separator-sm"></div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* action handler */}
          <div
            className={`page page-input ${
              activePage === PAGE_ORBIS_PROOF_POST ? PAGE_ORBIS_PROOF_POST : ""
            }`}
          >
            <div className="page-input-inner">
              {/* <div className="text text-red cursor" onClick={() => setActivePage(0)}>Cancel</div> */}

              <div className="page-center">
                <div className="separator-sm"></div>
                <div className="">
                  <h6 className="center">
                    <span>
                      Create a standard message to prove that this post was
                      created by PKP.
                    </span>
                  </h6>
                </div>
                <div className="separator-sm"></div>

                <div className="input-group">
                  {/* <input type="text" placeholder="0x..." value={authorizeAccount} onChange={(e) => setAuthorizeAccount(e.target.value)} /> */}

                  {pkps && address ? (
                    <div className="example-format">
                      This post is created by a PKP
                      <br />
                      Triggered by:{address}
                      <br />
                      PKP Token ID:{" "}
                      {viewType === 0
                        ? pkps[selectedCardIndex]?.tokenId
                        : authorizedPkps[selectedCardIndex]?.tokenId}
                      <br />
                      PKP Address:{" "}
                      {viewType === 0
                        ? pkps[selectedCardIndex]?.address
                        : authorizedPkps[selectedCardIndex]?.address}
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="button-group">
                    <div
                      className="button-cancel"
                      onClick={() => {
                        setActivePage(0);
                        clearStates();
                      }}
                    >
                      Cancel
                    </div>
                    <div
                      className="button-brand-2"
                      onClick={() => onProofPost()}
                    >
                      Send
                    </div>
                  </div>

                  {/* states */}
                  {proofPosting ? (
                    <div className="loading-with-text">
                      <div className="separator-sm"></div>
                      <Loading />
                      <span>{proofPostingMessage}</span>
                      <div className="separator-sm"></div>
                    </div>
                  ) : (
                    ""
                  )}

                  {error ? (
                    <div className="text text-red center">
                      <div className="separator-sm"></div>
                      {error}
                      <div className="separator-sm"></div>
                    </div>
                  ) : (
                    ""
                  )}

                  {success ? (
                    <div className="text text-green center">
                      <div className="separator-sm"></div>
                      {success}
                      <div className="separator-sm"></div>
                    </div>
                  ) : (
                    ""
                  )}

                  {proofPostingResult ? (
                    <div className="page-input-result example-format text-left">
                      {/* {JSON.stringify(proofPostingResult)} */}
                      <h6>
                        <span>Orbis</span>
                      </h6>
                      <a
                        onClick={() =>
                          goto(JSON.parse(proofPostingResult)?.orbis)
                        }
                      >
                        {JSON.parse(proofPostingResult)?.orbis}
                      </a>
                      <div className="separator-xxs"></div>
                      <h6>
                        <span>Cerscan</span>
                      </h6>
                      <a
                        onClick={() =>
                          goto(JSON.parse(proofPostingResult)?.cerscan)
                        }
                      >
                        {JSON.parse(proofPostingResult)?.cerscan}
                      </a>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!loggedIn && !currentPKP ? (
            ""
          ) : (
            <>
              {/* Orbis Create Post */}
              <Dialog
                signal={signal}
                id={PAGE_ORBIS_CREATE_POST}
                activePage={activePage}
                pageTitle={`Create a Orbis Post using this PKP ${short(
                  currentPKP?.address
                )}`}
                onCancel={() => setActivePage(0)}
                onSubmit={async (
                  data,
                  setError,
                  setSuccess,
                  setLoading,
                  setLoadingMessage,
                  setPostContent
                ) => {
                  setLoading(true);
                  setLoadingMessage("Creating post...");

                  var res;
                  try {
                    res = await magicActionHandler({
                      method: "create_post",
                      data: data.inputValue,
                    });
                  } catch (e) {
                    setError(e.message);
                    setLoading(false);
                    setLoadingMessage("");
                    return;
                  }

                  if (res.status !== 200) {
                    setError("Failed to create post.");
                    setLoading(false);
                    setLoadingMessage("");
                    return;
                  }

                  setLoading(false);
                  setLoadingMessage("");

                  const links = getLinks(res.doc);
                  // setSuccess("Post created successfully.");
                  setPostContent(
                    <>
                      <div className="page-input-result example-format text-left">
                        <h6>
                          <span>Orbis</span>
                        </h6>
                        <a onClick={() => goto(links.orbis)}>{links.orbis}</a>
                        <div className="separator-xxs"></div>
                        <h6>
                          <span>Cerscan</span>
                        </h6>
                        <a onClick={() => goto(links.cerscan)}>
                          {links.cerscan}
                        </a>
                      </div>
                    </>
                  );
                }}
                submitText="Send (Enter)"
                input={{
                  placeholder: "type your message here...",
                }}
              >
                <Guide />
              </Dialog>

              {/* Lit Actions Private Key Posting */}
              <Dialog
                id={PAGE_LIT_ACTION_SEED}
                activePage={activePage}
                pageTitle={`Lit Actions Private Key Posting`}
                onCancel={() => setActivePage(0)}
                onSubmit={async (
                  data,
                  setError,
                  setSuccess,
                  setLoading,
                  setLoadingMessage,
                  setPostContent
                ) => {
                  setLoading(true);
                  setLoadingMessage("Lit Action is being processed...");

                  var res = await onLitActionPrivateKey(
                    seed.seedBuffer,
                    data.inputValue
                  );

                  if (res.status === 500) {
                    setError(res.message);
                    setLoading(false);
                    setLoadingMessage("");
                    return;
                  }

                  if (res.status === 200) {
                    setSuccess("Lit Action is successfully processed.");
                    setLoading(false);
                    setLoadingMessage("");
                  }

                  var streamIdIndex = res.logs
                    .split("\n")
                    .findIndex((item) => item.includes("stream.id => "));

                  var streamId = res.logs
                    .split("\n")
                    [streamIdIndex].split("stream.id => ")[1];
                  console.log(streamId);

                  var links = getLinks(streamId);

                  setPostContent(
                    <>
                      <Links
                        links={links}
                        onClickOrbis={(link) => goto(link)}
                        onClickCerscan={(link) => goto(link)}
                      />
                    </>
                  );
                }}
                submitText="Send (Enter)"
                input={{
                  placeholder: "type your message here...",
                }}
              >
                <p>
                  This Lit Action enables you to post to the Orbis Protocol
                  directly and anonymously, using a random seed phrase to
                  maintain privacy.
                </p>

                <GenerateSeed onGenerate={setSeed} />
              </Dialog>

              {/* Lit Actions Create Post */}
              <Dialog
                id={PAGE_LIT_ACTION_CREATE_POST}
                activePage={activePage}
                pageTitle={`Lit Actions Create Post`}
                onCancel={() => {
                  setActivePage(0);
                }}
                onSubmit={async (
                  data,
                  setError,
                  setSuccess,
                  setLoading,
                  setLoadingMessage,
                  setPostContent
                ) => {
                  setLoading(true);
                  setLoadingMessage("Lit Action is being processed...");
                  var streamId = {};

                  try {
                    streamId = await onLitActionsCreatePost(data.inputValue);
                  } catch (e) {
                    setError(e.message);
                    setLoading(false);
                    setLoadingMessage("");
                    return;
                  }

                  setSuccess("Lit Action is successfully processed.");
                  setLoading(false);
                  setLoadingMessage("");

                  var links = getLinks(streamId);

                  setPostContent(
                    <>
                      <Links
                        links={links}
                        onClickOrbis={(link) => goto(link)}
                        onClickCerscan={(link) => goto(link)}
                      />
                    </>
                  );
                }}
                submitText="Send (Enter)"
                input={{
                  placeholder: "type your message here...",
                }}
              >
                <p>
                  This Lit Action enables you to post to the Orbis Protocol
                  directly using this PKP
                  <br />
                  <span className="text-primary">{currentPKP?.address}</span>
                </p>
              </Dialog>

              {/* Lit Actions Get Posts */}
              <Dialog
                id={PAGE_LIT_ACTION_GET_POSTS}
                activePage={activePage}
                pageTitle={`Lit Actions Get Posts`}
                onCancel={() => {
                  setActivePage(0);
                }}
                onSubmit={async (
                  data,
                  setError,
                  setSuccess,
                  setLoading,
                  setLoadingMessage,
                  setPostContent
                ) => {
                  setLoading(true);
                  setLoadingMessage("Lit Action is being processed...");
                  var res = {};

                  try {
                    res = await onLitActionsGetPosts(data.inputValue);
                  } catch (e) {
                    setError(e.message);
                    setLoading(false);
                    setLoadingMessage("");
                    return;
                  }

                  setSuccess("Lit Action is successfully processed.");
                  setLoading(false);
                  setLoadingMessage("");

                  console.log("res: ", res);

                  var posts = res.response;
                  // var links = getLinks(streamId);

                  setPostContent(
                    <div className="lit-actions-posts">
                      {!posts
                        ? ""
                        : posts.map((post, i) => {
                            return (
                              <div
                                onClick={() =>
                                  goto(getLinks(post.stream_id).orbis)
                                }
                                key={i}
                                className="row"
                              >
                                {post?.content?.body}
                              </div>
                            );
                          })}
                    </div>
                  );
                }}
              >
                <p>
                  The Lit Action allows you to retrieve posts from the Orbis
                  Protocol by utilizing the Supabase API within the Lit Action.
                </p>
              </Dialog>

              {/* Wallet Connect */}
              <Dialog
                id={PAGE_WALLET_CONNECT}
                activePage={activePage}
                pageTitle="Wallet Connect"
                onCancel={() => setActivePage(0)}
                input={{
                  placeholder:
                    "wc:09a44d1c-1e02-42b9-8969-9afdb13701b1@1?bridge=https%3A%2F%2Fl.bridge.walletconnect.org&key=f940a9d66b5bf899367a09419b0fc026eea51927b66cde752ee8c0dbb13dc0b7",
                }}
                onSubmit={async (
                  data,
                  setError,
                  setSuccess,
                  setLoading,
                  setLoadingMessage,
                  setPostContent
                ) => {
                  var address = currentPKP.address.toLowerCase();
                  // console.log(currentPKP.address);
                  // return;

                  // Create connector
                  const connector = new WalletConnect({
                    // Replace this value with the dApp's URI you copied
                    uri: data.inputValue,
                    // Replace the following details with your own app's info
                    clientMeta: {
                      description: "WalletConnect Developer App",
                      url: "https://walletconnect.org",
                      icons: [
                        "https://walletconnect.org/walletconnect-logo.png",
                      ],
                      name: "WalletConnect",
                    },
                  });

                  // Subscribe to session requests
                  connector.on("session_request", (error, payload) => {
                    console.log("SESSION REQUESST");
                    if (error) {
                      throw error;
                    }

                    connector.approveSession({
                      accounts: [address],
                      chainId: convertHexToNumber(chainId),
                    });

                    connector.rejectSession({
                      message: "Failed to connect",
                    });
                  });

                  // Subscribe to call requests
                  connector.on("call_request", async (error, payload) => {
                    console.log("CALL REQUEST");
                    console.log(payload);
                    if (error) {
                      throw error;
                    }

                    const publicKey = currentPKP.pubKey;

                    console.log(publicKey);

                    var authSig;
                    try {
                      authSig = localStorage.getItem(
                        `lit-auth-signature-${window.ethereum.selectedAddress}`
                      );
                    } catch (e) {
                      authSig = await LitJsSdk.checkAndSignAuthMessage({
                        chain,
                      });
                    }

                    try {
                      authSig = JSON.parse(authSig);
                    } catch (e) {
                      console.log(e);
                    }

                    // console.log(authSig);

                    // return;

                    // const rpcUrl = rpc;

                    // const wallet = new LitPKP({
                    //   pkpPubKey: publicKey,
                    //   controllerAuthSig: authSig,
                    //   provider: rpcUrl,
                    // });

                    // await wallet.init();

                    // const result = await wallet.signEthereumRequest(payload);

                    const magicWallet = new Magic({
                      pkpPubKey: publicKey,
                      controllerAuthSig: authSig,
                      provider: rpc,
                    });

                    await magicWallet.connect();

                    const result = await magicWallet.handler(payload, {
                      dApp: true,
                    });

                    connector.approveRequest({
                      id: payload.id,
                      result: result,
                    });

                    connector.rejectRequest({
                      id: payload.id,
                      error: {
                        message: "Failed to sign message",
                      },
                    });
                  });

                  connector.on("disconnect", (error, payload) => {
                    console.log(payload);
                    if (error) {
                      throw error;
                    }
                    connector.killSession();
                  });

                  // setLoading(true);
                  // setLoadingMessage("Connecting to wallet...");
                  // await new Promise((resolve) => setTimeout(resolve, 500));
                  // try {
                  //   await walletConnect.connect();
                  // } catch (e) {
                  //   setError(e.message);
                  //   setLoading(false);
                  //   setLoadingMessage("");
                  //   return;
                  // }
                  // setSuccess("Successfully connected to wallet.");
                  // setLoading(false);
                  // setLoadingMessage("");
                }}
              ></Dialog>
            </>
          )}

          {/* monitor */}
          <Dialog
            signal={signal}
            id={PAGE_MESSAGE_MONITOR}
            activePage={activePage}
            pageTitle="Message Monitor Configuration"
            onCancel={() => setActivePage(0)}
            onSubmit={async (
              data,
              setError,
              setSuccess,
              setLoading,
              setLoadingMessage,
              setPostContent
            ) => {
              setLoading(true);

              setLoadingMessage("Checking permission...");

              await new Promise((resolve) => setTimeout(resolve, 500));
              var isPermitted = await isBotPermitted();

              setLoadingMessage(`Bot is ${isPermitted ? "" : "not "}permitted`);

              await new Promise((resolve) => setTimeout(resolve, 500));

              if (monitorEnabled === false) {
                if (isPermitted === false) {
                  setLoadingMessage("Permitting bot...");
                  try {
                    await permitBot();
                  } catch (e) {
                    setLoading(false);
                    setError("Bot permit failed");
                    return;
                  }
                }
                setLoadingMessage("Bot permitted. Adding job...");

                var res = await onAddJob();

                console.log("res:", res);

                if (res.status !== 200) {
                  setLoading(false);
                  setError("Bot has failed to start");
                  return;
                }
                setLoading(false);
                setSuccess("Bot has started successfully");
                setMonitorEnabled(true);
              } else {
                if (isPermitted === true) {
                  setLoadingMessage("Revoking bot...");
                  var res = await revokeBot();

                  if (res.status !== 200) {
                    setLoading(false);
                    setError("Bot revoke failed");
                    return;
                  }
                }
                setLoadingMessage("Bot revoked. Removing job...");
                var res = await onRemoveJob();
                console.log(res);
                if (res.status === 200) {
                  setLoading(false);
                  setSuccess("Job removed successfully");
                  setMonitorEnabled(false);
                } else {
                  setLoading(false);
                  setError(res);
                }
              }
            }}
            submitText={
              monitorEnabled ? (
                <>
                  <True />
                  Enabled
                </>
              ) : (
                <>
                  <False />
                  Disabled
                </>
              )
            }
            alertMessage={
              <>
                By enabling this feature, you will allow our bot{" "}
                <span>
                  <a
                    target="_blank"
                    href={`https://mumbai.polygonscan.com/address/${BOT_ADDRESS}`}
                    rel="noreferrer"
                  >
                    {BOT_ADDRESS}
                  </a>
                </span>{" "}
                to access and analyze your PKP messages on Orbis Protocol and
                perform actions based on the commands it detects.
              </>
            }
          >
            <Guide />
          </Dialog>
        </div>

        {/* iframe */}
        <div
          id="second-device"
          className={`iframe ${iframeActive ? "active" : ""}`}
        >
          <div
            className="close"
            onClick={() => {
              setIframeActive(false);
              var timeout = setTimeout(() => {
                setIframeLink("");
                const iframe = document.queryselector("iframe");
                iframe.contentWindow.sessionStorage.clear();
                clearTimeout(timeout);
              }, 500);
            }}
          >
            <Icon name="close" />
          </div>
          <iframe className="device-apple" src={iframeLink}></iframe>
        </div>

        {/* jobs */}
        <div className="jobs hide">
          {!jobs ? (
            <></>
          ) : (
            jobs.map((job, index) => {
              return (
                <div key={index} className="job">
                  <div className="job-inner">
                    <div className="job-status">{index + 1}</div>
                    <div className="job-title">{job.task}</div>
                    <div className="job-description">
                      {JSON.stringify(job.params.pkp.address)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* debug */}
        <div className="debug hide">
          <h6>Debug</h6>
          ---
          <table>
            <tbody>
              <tr>
                <th>loggedIn:</th>
                <td>{loggedIn ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>loading:</th>
                <td>{loading ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>address:</th>
                <td>{address ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>user:</th>
                <td>{user ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>pkps:</th>
                <td>{pkps ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>lit:</th>
                <td>{lit ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>orbis:</th>
                <td>{orbis ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>contracts:</th>
                <td>{contracts ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>activePage:</th>
                <td>{activePage}</td>
              </tr>
              <tr>
                <th>flip:</th>
                <td>{flip ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>selectedCardIndex:</th>
                <td>{selectedCardIndex}</td>
              </tr>
              <tr>
                <th>minting:</th>
                <td>{minting ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>error:</th>
                <td>{error ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>success:</th>
                <td>{success ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>authorizeAccount:</th>
                <td>
                  {authorizeAccount
                    ? short(authorizeAccount, 1, 1, "**")
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <th>authorizing:</th>
                <td>{authorizing ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>selectedAuthorizedAccount:</th>
                <td>
                  {selectedAuthorizedAccount
                    ? short(selectedAuthorizedAccount)
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <th>unauthorizing:</th>
                <td>{unauthorizing ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>contentIndex:</th>
                <td>{contentIndex}</td>
              </tr>
              <tr>
                <th>viewType:</th>
                <td>{viewType}</td>
              </tr>
              <tr>
                <th>currentPKP:</th>
                <td>{currentPKP ? short(currentPKP.tokenId) : ""}</td>
              </tr>
              <tr>
                <th>monitorEnabled:</th>
                <td>{monitorEnabled ? <True /> : <False />}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* controllers */}
        <div className="controllers">
          {/* merged operations */}
          <a className="App-link" onClick={connect}>
            {" "}
            Connect
          </a>
          <br />
          <a className="App-link" onClick={connectMagic}>
            Connect Magic
          </a>
          <br />
          === <br />
          {/* connect lit */}
          <a className="App-link" onClick={connectLit}>
            Connect Lit
          </a>
          <br />
          {!lit ? (
            ""
          ) : (
            <>
              ---
              <br />
              <a className="App-link" onClick={() => getPKPs(address)}>
                -{">"} Get PKPs
              </a>
              <br />
              <a className="App-link" onClick={() => getPermitted()}>
                -{">"} Get Permitted
              </a>
              <br />
              <a className="App-link" onClick={runLitAction}>
                -{">"} Run Lit Action
              </a>
              <br />
              <a className="App-link" onClick={getCode}>
                -{">"} Get Lit Action
              </a>
              <br />
              <a className="App-link" onClick={connectPKP}>
                -{">"} Connect PKP
              </a>
              <br />
            </>
          )}
          {/* connect orbis */}
          ===
          <br />
          <a className="App-link" onClick={connectOrbis}>
            Connect Orbis
          </a>
          <br />
          {!user ? (
            <></>
          ) : (
            <>
              ---
              <br />
              <a className="App-link" onClick={createPost}>
                -{">"} Create Post
              </a>
              <br />
              <a className="App-link" onClick={editPost}>
                -{">"} Edit Post
              </a>
              <br />
              <a className="App-link" onClick={getPosts}>
                -{">"} Get Posts
              </a>
              <br />
              <a className="App-link" onClick={getConversations}>
                -{">"} Get Conversations
              </a>
              <br />
              <a className="App-link" onClick={getPermittedPKPs}>
                -{">"} Get Permitted Tokens
              </a>
              <br />
              <a className="App-link" onClick={getAuthSig}>
                -{">"} Get AuthSig
              </a>
              <br />
              <a className="App-link" onClick={() => check(0)}>
                -{">"} Fetch Check
              </a>
              <br />
            </>
          )}
        </div>
        {/* <a className='App-link' onClick={getTest}>-{">"} Get Test</a><br /> */}
      </header>
    </div>
  );
}

export default App;
