import { Orbis } from "orbis-sdk";
import LitJsSdk from "lit-js-sdk";
import { useEffect, useState } from 'react';

import { ethers } from 'ethers';
import { Loading } from './components/Loading';
import { True } from './components/True';
import { False } from './components/False';

import ScrollContainer from 'react-indiana-drag-scroll'
import Logo from "./components/Logo";
import Icon from "./components/Icon";
import { scrollEaseIn } from "./utils/animate";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import Blockies from 'react-blockies';
import { Magic } from "./Magic";
import { Cacao, SiweMessage } from '@didtools/cacao';

import { randomBytes, randomString } from "@stablelib/random";
import { DIDSession, createDIDKey, createDIDCacao } from 'did-session'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { StreamUtils } from '@ceramicnetwork/common';

import { CID } from 'multiformats/cid';
import * as Block from 'multiformats/block';
import * as dagCBOR from '@ipld/dag-cbor';
import { sha256 } from 'multiformats/hashes/sha2';
import { toString } from 'uint8arrays/to-string';
import { CacaoBlock } from '@didtools/cacao';
import { orbisSdk } from "./orbis-sdk";
import Dialog from "./Dialog";

const smartContracts = {
  pkp: '0x86062B7a01B8b2e22619dBE0C15cbe3F7EBd0E92',
  pkpAbi: require('./contracts/pkp.json'),
  router: '0xEA287AF8d8835eb20175875e89576bf583539B37',
  routerAbi: require('./contracts/router.json'),
}

const BOT_ADDRESS = '0x019c5821577B1385d6d668d5f3F0DF16A9FA1269';
const BOT_API = 'http://localhost:8081';
const BOT_WS_API = 'ws://localhost:8080';
// const BOT_API = 'http://18.234.166.31:8081';
// const BOT_WS_API = 'ws://18.234.166.31:8080';
const PAGE_MESSAGE_MONITOR = 'dialog-monitor-message';
const PAGE_ORBIS_PROOF_POST = 'btn-action-proof-post';
const PAGE_ORBIS_CREATE_POST = 'page-orbis-create-post';

function App() {

  const [didPrefix, setDidPrefix] = useState('did:pkh:eip155:1:');
  const [rpc, setRpc] = useState("https://rpc-mumbai.maticvigil.com");
  const [user, setUser] = useState();
  const [chain, setChain] = useState('mumbai');
  const [address, setAddress] = useState();
  const [pkps, setPkps] = useState();
  const [authorizedPkps, setAuthorizedPkps] = useState();
  const [orbis, setOrbis] = useState();
  const [lit, setLit] = useState();
  const [provider, setProvider] = useState(new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com'));
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
  const [authorizingMsg, setAuthorizingMsg] = useState('Authorizing...');
  const [unauthorizingMsg, setUnauthorizingMsg] = useState('Unauthorizing...');
  const [switching, setSwitching] = useState(false);
  const [proofPosting, setProofPosting] = useState(false);
  const [proofPostingMessage, setProofPostingMessage] = useState('Posting Proof to Orbis...');
  const [proofPostingResult, setProofPostingResult] = useState(null);

  const [currentPKP, setCurrentPKP] = useState();

  const [jobs, setJobs] = useState([]);
  const [monitorEnabled, setMonitorEnabled] = useState(false);

  const [iframeActive, setIframeActive] = useState(false);
  const [iframeLink, setIframeLink] = useState();
  const [signal, sendSignal] = useState(0);
  const [socket, setSocket] = useState();

  useEffect(() => {

    if (address && user && pkps && lit && orbis && !authorizing && !unauthorizing && !success && !error && contracts && currentPKP !== null) {
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
          _currentPKP = pkps[selectedCardIndex]
        }
      } else if (viewType === 1) {
        if (authorizedPkps) {
          _currentPKP = authorizedPkps[selectedCardIndex];
        }
      }

      setCurrentPKP(_currentPKP);

    }

    if (loggedIn) {

      if (!socket) {
        // socket
        const socket = new WebSocket(BOT_WS_API);
        setSocket(socket);
      }

      if(socket){
        console.log("socket =>", socket);
        socket.onmessage = e => {
          const data = JSON.parse(JSON.stringify(JSON.parse(e.data)));
          console.log(data);
          setJobs(data);
        }
      }
      

      check();
    }


    if (time == null) {
      setTime(getCurrentTime())

      setInterval(async () => {
        setTime(getCurrentTime())
      }, 1000);
    }

    function keyDownHandler(event) {

      if (event.key === 'Escape') {
        event.preventDefault();

        // check if id="second-device" has class="active"
        var secondDevice = document.getElementById('second-device');

        if (iframeActive || secondDevice.classList.contains('active')) {
          setIframeActive(false);
          return;
        }

        setActivePage(0);
        sendSignal(signal => signal + 1);

        var timeout;
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          setProofPostingResult('');
        }, 500)
      }
    };

    // loading state
    document.addEventListener('keydown', keyDownHandler);

    return () => {
      // socket.close();
      document.removeEventListener('keydown', keyDownHandler);
    };

  }, [address, user, pkps, lit, orbis, contracts, selectedCardIndex, viewType, jobs])

  // if (!monitorCheck) {
  async function check() {

    var res;

    try {
      res = await fetch(`${BOT_API}/api/has/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          params: {
            pkp: currentPKP,
          }
        })
      });

      var status = (await res.json()).status;

      if (status === 'job exists') {
        setMonitorEnabled(true);
      } else {
        setMonitorEnabled(false);
      }
    } catch (e) {
      console.log('not ready');
      setMonitorEnabled(false);
    }
  }

  function scrollToCard(cardIndex, { start = 0, ms = 1000 }) {

    var scroll = document.getElementsByClassName('scroll-container')[0];
    var card = document.getElementsByClassName('credit-card')[cardIndex];
    // var paddingLeft = 18;
    var paddingLeft = card.clientWidth - (18);

    scrollEaseIn(scroll, ((card.offsetLeft + 1) - paddingLeft), ms);

  }

  // orbisLit
  async function connect() {

    var web3;

    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    web3 = window.ethereum;

    try {
      web3.send("wallet_switchEthereumChain", [
        { chainId: "0x13881" },
      ]);
    } catch (e) {
      web3.request({
        method: "wallet_addEthereumChain",
        params: {
          chainId: "0x13881",
          chainName: "Mumbai",
          nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
          rpcUrls: [rpc],
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        },
      });
    }

    setLoading(true);
    let lit = await connectLit();
    let orbis = await connectOrbis();

    if (lit && orbis) {
      setLoading(false);
    }
  }

  async function connectMagic() {

    const PKP_PUBKEY = (viewType === 0 ? pkps : authorizedPkps)[selectedCardIndex].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain
    });

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });
  }

  async function getCode(file = '') {

    if (!process.env.REACT_APP_ENV) {
      throw new Error('REACT_APP_ENV not set');
    }

    if (process.env.REACT_APP_ENV === 'dev') {

      var res = await fetch('http://localhost:8181/api/' + file);

      var code = await res.text() ?? 'console.log("404");';

      return code;

    }
  }

  async function runLitAction(payload) {

    console.log(`Running "${payload.file}" in Lit Action`);

    var start = new Date().getTime();

    var code = payload.code ?? await getCode(payload.file);

    console.warn("currentPKP.pubKey:", currentPKP.pubKey);

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    console.log("lit:", lit);

    let signatures = await lit.executeJs({
      // ipfsId: 'QmeUkT55U4m6CmvVq5aD62UzUP7dDkxTrJmKqcaSFCKDix',
      code,
      authSig,
      jsParams: {
        toSign: payload.toSign ?? [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
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

  async function mintPkp() {
    setMinting(true);
    setSuccess(null);
    setError(null);

    let wallet = new ethers.providers.Web3Provider(window.ethereum);

    try {
      // throw new Error('Minting is disabled now.');
      let contract = new ethers.Contract(smartContracts.pkp, smartContracts.pkpAbi, wallet.getSigner());
      let cost = await contract.mintCost();
      let mint = await contract.mintNext(2, { value: cost.toString() });

      let wait = await mint.wait();

      await getPKPs(address);

      setSuccess("PKP minted successfully! Go back to the main page to see it.");

      // await 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      setActivePage(0);
      setSelectedCardIndex(pkps.length)
      scrollToCard(pkps.length, { ms: 1000 });

    } catch (e) {
      setMinting(false);
      setError(e.message);
      await new Promise(r => setTimeout(r, 2000));
      setError(null);
    }
    setMinting(false);
  }

  async function connectLit() {
    const client = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' });
    await client.connect();

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    setLit(client);
    setAddress(authSig.address);

    await getPKPs(authSig.address);

    return client;
  }

  // get pkps
  async function getPKPs(controller, { remove, refetchAuthorizedAccounts, refetch = false } = {}) {

    let storagePkps;

    try {
      storagePkps = JSON.parse(localStorage.getItem('magic-pkps'))[controller];
    } catch (e) {
    }

    if (remove) {
      // find a token id in the array and remove it
      let index = storagePkps.findIndex(x => x.tokenId === remove);
      if (index > -1) {
        storagePkps.splice(index, 1);
      }
      localStorage.setItem('magic-pkps', JSON.stringify(storagePkps));
    }

    if (!controller) {
      throw Error('controller not set');
    }

    let contract = new ethers.Contract(smartContracts.pkp, smartContracts.pkpAbi, provider);
    let contractRouter = new ethers.Contract(smartContracts.router, smartContracts.routerAbi, provider);
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
          authorizedAccounts = await contracts.pkpPermissionsContract.read.getPermittedAddresses(tokenId);
          address = ethers.utils.computeAddress(pubKey);
        }

        did = 'did:pkh:eip155:1:' + address.toLowerCase();

        if (refetchAuthorizedAccounts) {
          authorizedAccounts = await contracts.pkpPermissionsContract.read.getPermittedAddresses(tokenId);
        }

        pkps.push({ tokenId, pubKey, address, authorizedAccounts, did });
      } catch (e) {
        break;
      }
    }


    setPkps(pkps);
    try {
      let storage = JSON.parse(localStorage.getItem('magic-pkps'));

      storage[controller] = pkps;

      localStorage.setItem('magic-pkps', JSON.stringify(storage));
    } catch (e) {
      var usr = {

      }
      usr[controller] = pkps;

      localStorage.setItem('magic-pkps', JSON.stringify(usr));
    }

    return pkps;
  }

  async function connectPKP() {

    const PKP_PUBKEY = (viewType === 0 ? pkps : authorizedPkps)[selectedCardIndex].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain
    });

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });

    await magicWallet.connect();

    let orbis = new Orbis();

    await orbis.connect_pkp(magicWallet);
    await orbis.createPost({ body: 'Hello World' });

  }

  function getLinks(docId) {
    return {
      orbis: `https://app.orbis.club/post/${docId}`,
      cerscan: `https://cerscan.com/mainnet/stream/${docId}`
    }
  }

  async function onProofPost() {
    setProofPosting(true);
    setProofPostingMessage('Proof posting to Orbis...');
    var res = await magicActionHandler({
      method: 'proof_post',
    });

    setProofPosting(false);
    setProofPostingMessage();

    if (res.status === 200) {
      setProofPostingResult(JSON.stringify({
        profile: ``,
        orbis: getLinks(res.doc).orbis,
        cerscan: getLinks(res.doc).cerscan,
      }));
    }
  }

  async function clearStates() {
    setProofPosting(false);
    setProofPostingMessage();
    setProofPostingResult();
  }

  async function magicActionHandler(payload) {

    const PKP_PUBKEY = (viewType === 0 ? pkps : authorizedPkps)[selectedCardIndex].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain
    });

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    })

    await magicWallet.connect();

    let orbis = new Orbis();

    await orbis.connect_pkp(magicWallet);

    if (payload.method === 'create_post') {
      let res = await orbis.createPost({ body: payload.data });
      return res;
    } else if (payload.method === 'create_conversation') {
      let res = await orbis.createConversation(payload.data);
      return res;
    } else if (payload.method === 'send_message') {
      let res = await orbis.sendMessage(payload.data);
      return res;
    } else if (payload.method === 'follow') {
      let res = await orbis.setFollow(payload.data, true);
      return res;
    } else if (payload.method === 'unfollow') {
      let res = await orbis.setFollow(payload.data, false);
      return res;
    } else if (payload.method === 'get_conversations') {
      let res = await orbis.getConversations({
        did: payload.data,
      });
      return res;
    } else if (payload.method === 'proof_post') {
      var tokenId = (viewType === 0 ? pkps : authorizedPkps)[selectedCardIndex].tokenId;
      let contractRouter = new ethers.Contract(smartContracts.router, smartContracts.routerAbi, provider);
      var pubKey = await contractRouter.getPubkey(tokenId);
      var pkpAddress = ethers.utils.computeAddress(pubKey);

      const msg = `This post is created by a PKP\nTriggered by:${address}\nPKP Token ID:${tokenId}\nPKP Address:${pkpAddress}`;

      let res = await orbis.createPost({ body: msg });
      return res;

    } else if (payload.method === 'notify_authorized') {

      // message
      const MSG = `${payload.data.authorizeAccount}\nhas been permitted to use\n${payload.data.tokenId}`;
      const did = `did:pkh:eip155:1:${payload.data.authorizeAccount.toLowerCase()}`;


      let res1 = await orbis.createConversation({
        recipients: [did],
        name: 'PKP Authorized',
        description: MSG
      });

      console.warn("res1:", res1);

    } else if (payload.method === 'notify_unauthorized') {


      // message
      const MSG = `${payload.data.authorizeAccount}\nhas been removed to use\n${payload.data.tokenId}`;
      const did = `did:pkh:eip155:1:${payload.data.authorizeAccount.toLowerCase()}`;

      let res1 = await orbis.createConversation({
        recipients: [did],
        name: 'PKP Unauthorized',
        description: MSG
      });

      console.warn("res1:", res1);


    } else {
      throw new Error('method not found');
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
    let res = await orbis.createPost({ body: 'Hello World' });

    if (res.status !== 200) throw new Error(res.message);
  }

  async function editPost() {
    let streamId = 'kjzl6cwe1jw148mdbse0ke7b6ygro8unpxmai219i41wyj221f525c5z98z7uxi';

    let res = await orbis.editPost(streamId, { body: 'Edited!' });

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

    data.forEach(msg => {
      // let payload = msg.content.description.split('\n');
      let payload = msg.content.description;
      let date = new Date(msg.last_message_timestamp * 1000);

      // format date to hours:minutes:seconds
      date = date.toLocaleTimeString();
    })
  }

  async function getPermittedPKPs() {

    let { data, error } = await orbis.getConversations({
      did: user,
    });

    if (error) throw new Error(error);

    var permittedTokens = [];

    data.forEach(msg => {
      // let payload = msg.content.description.split('\n');
      let payload = msg.content.description;
      let timestamp = msg.last_message_timestamp;

      let authorizedAddress = payload.split('\n')[0];
      let tokenId = payload.split('\n')[2];

      if (authorizedAddress !== 'undefined' && tokenId !== 'undefined') {
        if (authorizedAddress === address) {

          permittedTokens.push({
            state: payload.split('\n')[1] === 'has been permitted to use' ? true : false,
            tokenId: tokenId,
            timestamp
          });
        }
      }
    })

    // filter unique tokens by last timestamp
    let filtered = permittedTokens.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.tokenId === thing.tokenId
      ))
    )

    var list = [];

    // for each permitted token, check if there's a token where its state is false and timestamp is greater than the current one
    filtered.forEach(token => {
      let found = permittedTokens.find(t => t.tokenId === token.tokenId && t.state === false);

      if (found?.state === false && found.timestamp > token.timestamp) {
        return;
      }

      if (token.state) {
        list.push(token);
      }
    })

    let contract = new ethers.Contract(smartContracts.pkp, smartContracts.pkpAbi, provider);
    let contractRouter = new ethers.Contract(smartContracts.router, smartContracts.routerAbi, provider);
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
      authorizedAccounts = await contracts.pkpPermissionsContract.read.getPermittedAddresses(tokenId);
      did = 'did:pkh:eip155:1:' + address.toLowerCase();

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
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes;
  }

  async function addWallet() {
    setActivePage('x');
  }

  function short(str, start = 6, end = 4, middle = '***') {
    return str.substring(0, start) + middle + str.substring(str.length - end, str.length);
  }


  async function onAuthorize() {
    if (!authorizeAccount) {
      return
    }

    setSuccess(null)
    setError(null)

    setAuthorizing(true);

    try {

      let tx = await contracts.pkpPermissionsContract.write.addPermittedAddress(pkps[selectedCardIndex].tokenId, authorizeAccount, []);
      let result = await tx.wait();
      setAuthorizingMsg('Updating PKPs...')
      await getPKPs(address, { refetchAuthorizedAccounts: true });

      // notify
      setAuthorizingMsg('Notifying user...')
      await magicActionHandler({
        method: 'notify_authorized', data: {
          authorizeAccount,
          tokenId: pkps[selectedCardIndex].tokenId,
        }
      });
      setAuthorizingMsg('Finishing up...')
      setSuccess(`${authorizeAccount} has been authorized!`);

      // await 2 seconds
      await new Promise(r => setTimeout(r, 2000));

      setSuccess(null);
      setActivePage(0);
      setAuthorizingMsg('Authorizing...')
    } catch (e) {
      setError(e.message);
      setAuthorizing(false);

      // await 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      setError(null);
    }

    setAuthorizing(false);
  }

  async function onUnauthorize() {

    setSuccess(null)
    setError(null)

    setUnauthorizing(true);

    try {
      let tx = await contracts.pkpPermissionsContract.write.removePermittedAddress(pkps[selectedCardIndex].tokenId, selectedAuthorizedAccount);
      let result = await tx.wait();
      setUnauthorizingMsg('Updating PKPs...')

      await getPKPs(address, { refetchAuthorizedAccounts: true });

      // notify
      setUnauthorizingMsg('Notifying user...')
      await magicActionHandler({
        method: 'notify_unauthorized', data: {
          authorizeAccount: selectedAuthorizedAccount,
          tokenId: pkps[selectedCardIndex].tokenId,
        }
      });

      setSuccess(`${selectedAuthorizedAccount} has been unauthorized!`);

      // await 2 seconds
      await new Promise(r => setTimeout(r, 2000));

      setSuccess(null);
      setActivePage(0);
      setUnauthorizingMsg('Unauthorizing...')
    } catch (e) {
      setError(e.message);
      setUnauthorizing(false);

      // await 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      setError(null);
      setActivePage(0);
    }


    setUnauthorizing(false);
  }

  function copyToClipboard(text) {
    setClipboard(text);
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();

    try {
      document.execCommand('copy');
    } catch (err) {
    }

    document.body.removeChild(tempInput);

    delayAction(() => {
      setClipboard(null);
    })
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
    let result = await contracts.pkpPermissionsContract.read.getPermittedAddresses(pkps[selectedCardIndex].tokenId);
  }
  // use lit action to create post using a private key
  async function onLitActionsPrivateKey() {
    await runLitAction({
      file: 'tile-action',
      params: {
        seed: [142, 214, 103, 107, 150, 147, 119, 49, 123, 190, 46, 144, 27, 146, 96, 200, 237, 210, 78, 75, 114, 148, 102, 7, 20, 153, 37, 174, 94, 2, 105, 43],
        content: { foo: 'bar' },
        host: "https://node1.orbis.club/",
      }
    })
  }

  // use lit action to create post using did
  async function onLitActionsTest() {

    // const sig1 = await runLitAction({
    //   file: 'test-action',
    //   params: {
    //     // toSign: arrayify(hashMessage(siweMessage.signMessage())),
    //     functionName: 'personalSign()'
    //   }
    // });
    // ====
    // async function createCACAO() {
    const now = new Date();

    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // create a did:key
    // const keyDid = await encodeDIDWithLit(currentPKP.pubKey);

    const keySeed = randomBytes(32);
    const didKey = await createDIDKey(keySeed);

    // create a siwe message
    const siweMessage = new SiweMessage({
      domain: window.location.hostname,
      address: currentPKP.address,
      statement: 'Give this application access to some of your data on Ceramic',
      uri: didKey,
      version: '1',
      nonce: randomString(10),
      issuedAt: now.toISOString(),
      expirationTime: oneWeekLater.toISOString(),
      chainId: "1",
      resources: [`ceramic://*`]
    });

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain
    });

    const magicWallet = new Magic({
      pkpPubKey: currentPKP.pubKey,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: rpc,
    });

    await magicWallet.connect();

    const sig = await magicWallet.handler({
      method: 'personal_sign',
      params: [siweMessage.signMessage(), currentPKP.address]
    });

    console.log("sig:", sig);

    // ===

    // const sig1 = await runLitAction({
    //   file: 'test-action',
    //   params: {
    //     toSign: arrayify(hashMessage(siweMessage.signMessage())),
    //     functionName: 'personalSign()'
    //   }
    // });

    // const joinSig = {
    //   r: '0x' + sig1.signatures.sig1.r,
    //   s: '0x' + sig1.signatures.sig1.s,
    //   v: sig1.signatures.sig1.recid,
    // }

    siweMessage.message = sig;

    // ===

    // console.log("siweMessage:", siweMessage);

    // await runLitAction({
    //   file: 'test-action',
    //   params: {
    //     siweMessage: siweMessage,
    //     keySeed,
    //     functionName: 'getDIDSession()',
    //   }
    // });

    // return;

    // create a cacao object with the message signed 
    var cacao = Cacao.fromSiweMessage(siweMessage);

    // create a did
    const _did = await createDIDCacao(didKey, cacao);

    _did._parentId = _did._parentId.toLowerCase();
    console.log("_did:", _did);

    var didSession = new DIDSession({
      cacao,
      keySeed,
      did: _did
    });

    console.log("didSession:", didSession);

    const did = didSession.did;
    console.log("did:", did);

    // return;
    // return;
    // console.log("didSession.id:", didSession.id);
    // }

    // async function getAuthMethod(){
    //   return async () =>{
    //     return createCACAO();
    //   }
    // }
    // const sig2 = await runLitAction({
    //   file: 'test-action',
    //   params: {
    //     siweMessage,
    //     functionName: 'getDIDSession()'
    //   }
    // });

    // ====

    const ceramic = new CeramicClient("https://node1.orbis.club/");
    const threeMonths = 60 * 60 * 24 * 90;
    // const authMethod = await getAuthMethod();
    // console.log(authMethod);
    // let did;

    // try {
    //   var session = await DIDSession.authorize(authMethod,
    //     {
    //       resources: [`ceramic://*`],
    //       expiresInSecs: threeMonths
    //     }
    //   );

    // did = session.did;
    // const auth = didSession.isAuthorized([`ceramic://*`]);
    // console.log("didSession.isAuthorized():", auth);
    // return;
    await did.authenticate();
    ceramic.did = did;

    console.log("did:", did);

    console.log("ceramic:", ceramic);
    // return;
    // return;

    // console.log("did =>", did);
    // console.log("did is authenticated =>", did.authenticated);
    // console.log("session.id =>", session.id);
    // console.log("didSession.id =>", didSession.id);
    // } catch (e) {
    //   return {
    //     status: 300,
    //     error: e,
    //     result: "Error creating a session for the DiD."
    //   }
    // }

    const postSchemaCommit = "k1dpgaqe3i64kjuyet4w0zyaqwamf9wrp1jim19y27veqkppo34yghivt2pag4wxp0fv2yl4hedynpfuynp2wvd8s7ctabea6lx732xrr8b0cgqauwlh0vwg6";

    const metadata = {
      family: "orbis",
      controllers: [didSession.id],
      tags: ["orbis", "post"],
      schema: postSchemaCommit
    };

    const INPUT_HOST = "https://node1.orbis.club/"
    const API_PATH = '/api/v0/';
    const apiUrl = new URL(API_PATH, INPUT_HOST);
    const STREAM_TYPE_ID = 0;

    // console.log("did.hasParent:", did.hasParent);
    // console.log("did.id:", did.id);
    // console.log("did.parent:", did.parent);

    // const commit = await TileDocument.makeGenesis(ceramic);
    // console.warn("commit:", commit);

    // return;

    // prep to make genensis
    const commitPrep = await TileDocument.makeGenesisWithoutSignDagJWS(ceramic, { body: "gm!" }, metadata);

    console.log("commitPrep:", commitPrep);

    async function createDagJWS() {

      // your own makeGenesis commit
      // const commit = ceramic.did.createDagJWS(commitPrep);
      // === createDagJWS ===
      async function encodePayload(payload) {
        const block = await Block.encode({
          value: payload,
          codec: dagCBOR,
          hasher: sha256
        });
        return {
          cid: block.cid,
          linkedBlock: block.bytes,
        }
      }

      // console.log(did._client);
      async function createJWS(did, payload, options = {}) {

        const jws = await did._client.request('did_createJWS', {
          did: did._id,
          ...options,
          payload,
        })

        return jws;
      }

      const { cid, linkedBlock } = await encodePayload(commitPrep);

      console.log("cid:", cid);
      console.log("linkedBlock:", linkedBlock);

      const payloadCid = toString(cid.bytes, 'base64url');

      console.log("payloadCid:", payloadCid);

      const options = {};

      Object.assign(options, {
        linkedBlock: toString(linkedBlock, 'base64pad'),
      })
      const { jws } = await createJWS(did, payloadCid, options);

      console.log("jws:", jws);

      const compatibleCID = CID.asCID(cid);

      console.log("compatibleCID:", compatibleCID);

      jws.link = compatibleCID;

      console.log("jws:", jws);


      if (did._capability) {

        const pureObject = JSON.parse(JSON.stringify(did._capability));

        const cacaoBlock = await CacaoBlock.fromCacao(pureObject);
        return {
          jws,
          linkedBlock,
          cacaoBlock: cacaoBlock.bytes,
        }
      } else {
        return {
          jws,
          linkedBlock,
        }
      }
    }

    const commit2 = await createDagJWS();

    // commit2.header = commit.header;

    console.log("commit2:", commit2);

    const doc = await ceramic.createStreamFromGenesis(0, commit2);


    return;


    // create stream
    const url2 = new URL('./streams', new URL(API_PATH, INPUT_HOST));

    const res2 = await fetch(url2, {
      method: 'post',
      body: JSON.stringify({
        type: 0,
        genesis: StreamUtils.serializeCommit(commit),
        opts: {
          anchor: true,
          publish: true,
          sync: 0,
        }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(await res2.text());

    return;
    // const commit = 

    // console.log("commit:", commit);
    // return;
    // var doc = await TileDocument.create(ceramic, '123', metadata, { anchor: true, publish: true, sync: 0 });

    // console.log("doc =>", doc);

    const serializedCommit = StreamUtils.serializeCommit(commit);

    console.log("serializedCommit =>", serializedCommit);

    const url = new URL('./streams', apiUrl);
    console.log("url =>", url);

    const res = await fetch(url, {
      method: 'post',
      body: JSON.stringify({
        type: STREAM_TYPE_ID,
        genesis: StreamUtils.serializeCommit(commit),
        opts: {
          anchor: true,
          publish: true,
          pin: true,
          sync: 0,
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("res =>", await res.json());

  }

  async function getPKPOrbis() {
    const orbis = new Orbis();

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain
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
      chain
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
  async function onLitActionsCreatePost() {

    const VERSION = 0;

    if (VERSION === 0) {

      const { ceramicSession } = await getSession();

      var content = "Merry Christmas everyone!";

      const res = await runLitAction({
        file: 'orbis-sdk',
        params: {
          method: 'create_post',
          sessionKey: ceramicSession,
          content: {
            body: content,
          }
        }
      });

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
        did: currentPKP.did
      });

      var dupPosts = posts.data.filter(post => {
        // the same content and the timestamp is less than 1 minute
        return post.content.body === content && (Date.now() - post.timestamp * 1000) < 60000;

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
          console.log("delete post:", post.stream_id)
          await orbis.deletePost(post.stream_id);
        }

      }

      console.log("postId:", postId);
    }

    if (VERSION === 1) {

      const session = await DIDSession.fromSession(session.ceramicSession);

      ceramic.did = session.did;
      console.log("session:", session);

      orbis.ceramic = ceramic;

      const postSchemaCommit = "k1dpgaqe3i64kjuyet4w0zyaqwamf9wrp1jim19y27veqkppo34yghivt2pag4wxp0fv2yl4hedynpfuynp2wvd8s7ctabea6lx732xrr8b0cgqauwlh0vwg6";

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
      const commit = await orbisSdk.TileDocument.makeGenesis(ceramic, { body: 'gm!2' }, {
        family: 'orbis',
        controllers: [session2.id],
        tags: ['orbis', 'post'],
        schema: postSchemaCommit
      });

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
      const url = new URL('./streams', ceramic._apiUrl);
      const res = await fetch(url, {
        method: 'post',
        body: JSON.stringify({
          type: 0,
          genesis: orbisSdk.StreamUtils.serializeCommit(commit),
          opts: {
            anchor: true,
            publish: true,
            pin: true,
            sync: 0,
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      console.log("res:", res);

      let { state } = await res.json();
      console.log("state:", state);

      const doc = new orbisSdk.Document(orbisSdk.StreamUtils.deserializeState(state), url, 5000);
      console.log("doc =>", doc);

      const post = await ceramic.buildStreamFromDocument(doc);

      console.log("post.id =>", post.id.toString());

    }

  }

  async function onLitActionsGetPosts() {
    let res = await runLitAction({
      file: 'orbis-sdk',
      params: {
        method: 'get_posts',
      },
    });
    // var logs = res.logs /
    //   // logs.splice(0, 2);
    //   console.log(logs);
    // window.test = res;

    console.log(res);

    // await ÷orbis.getPosts();
  }

  async function onAddJob() {

    var res = {};

    console.log("Add 1");
    try {
      res = await fetch(BOT_API + '/api/job', {
        method: 'POST',
        body: JSON.stringify({
          task: 'chat_message',
          params: {
            task: 'chat_message',
            pkp: currentPKP,
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
      res = await fetch(BOT_API + '/api/job', {
        method: 'POST',
        body: JSON.stringify({
          task: 'remove_job',
          params: {
            task: 'chat_message',
            pkp: currentPKP,
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // res.status = 200;
    } catch (e) {
      console.log(e);
      res.status = 500;
    }

    return res;

  }

  async function getAuthSig() {
    const client = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' });
    await client.connect();

    // set timestamp 3 months from now
    const expiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 60).toISOString();

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain, expiration });

    console.log(JSON.stringify(authSig));
  }

  async function permitBot() {
    var tx;
    var res = {};

    try {
      tx = await contracts.pkpPermissionsContract.write.addPermittedAddress(currentPKP.tokenId, BOT_ADDRESS, []);
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
      tx = await contracts.pkpPermissionsContract.write.removePermittedAddress(currentPKP.tokenId, BOT_ADDRESS);
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
    var isPermitted = await contracts.pkpPermissionsContract.read.isPermittedAddress(currentPKP.tokenId, BOT_ADDRESS);
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
        <div id="main-device" className={`device-apple ${iframeActive ? 'main' : ''} ${loggedIn ? 'active' : ''}`}>

          <div className="date">{time}</div>
          {
            (!lit || !orbis || !user) ? <>
              {/* unauthorized */}
              <div className='page page-login'>
                {/* <img src="/icon.png" className="App-logo" alt="logo" /> */}
                <div className={`login ${loading ? 'active' : ''}`}>
                  <h1><span>The magic</span></h1>
                  <p>
                    Connect your wallet to start using the magic.
                  </p>
                  <div className="button" onClick={connect}>Connect</div>
                </div>
                <div className={`login-loading ${loading ? 'active' : ''}`}>
                  {/* <div className="separator"></div> */}
                  <Loading />
                </div>
              </div>
            </> :
              <div className={`page page-main page-has-inner ${activePage}`}>

                <section>
                  {/* <h6 className="center"><span>Account Manager</span></h6> */}

                  <div className='text user' onClick={() => copyToClipboard(user)}>
                    {/* <div className={`copied active`}>Copied</div> */}
                    <span>
                      {didPrefix}{short(user.split(':')[4], 6, 4, '...') ?? '[please connect orbis]'}
                    </span>
                  </div>

                  <div className="separator-md"></div>
                </section>

                <div className="page-inner">

                  <div className="page-header">
                    <div className="spread view-type">
                      <h6 className={`view-type-h6 ${viewType === 0 ? 'active' : ''}`} onClick={() => setViewType(0)}><span>Your Accounts</span></h6>
                      <h6 className={`view-type-h6 ${viewType === 1 ? 'active' : ''}`} onClick={async () => {
                        setSwitching(true);
                        setCurrentPKP(null);
                        var tokens = await getPermittedPKPs();
                        setAuthorizedPkps(tokens);
                        setSwitching(false);
                        setViewType(1);
                      }}><span>Authorized Accounts</span></h6>
                    </div>
                    {
                      viewType === 0 ?
                        <Icon onClick={addWallet} name="add" /> : ''
                    }

                  </div>

                  <ScrollContainer className="scroll-container">
                    <div className={`cards ${switching ? 'switching' : ''}`}>
                      {
                        (viewType === 0 && !pkps) || (viewType === 1 && !authorizedPkps) || (switching) ?
                          <Loading /> :
                          (viewType === 0 ? pkps : authorizedPkps).map((pkp, i) => {

                            return <div className={`credit-card ${(selectedCardIndex === i && flip) ? 'flip' : ''} gradient-${i} ${selectedCardIndex === i ? 'active' : ''}`} key={i}>

                              <div className="cc-tap-to-select" onClick={async () => {
                                setSelectedCardIndex(i);
                                setFlip(false);
                                scrollToCard(i, { ms: 300 });
                              }}>
                                <Icon name="tap" />
                              </div>

                              {
                                !(selectedCardIndex === i && flip) ?
                                  // front card
                                  <>
                                    <div className="cc-logo">
                                      <Logo brand="lit" />
                                    </div>
                                    <div className='cc-number' onClick={() => copyToClipboard(pkp.did)}>
                                      <div className={`copied ${clipboard === pkp.did ? 'active' : ''}`}>Copied</div>
                                      {pkp.did}
                                    </div>
                                  </> :
                                  // back card
                                  <div className="cc-back">
                                    <div className="cc-token">
                                      <div className="cc-token-name">Token ID</div>
                                      <div className="cc-token-addr" onClick={() => copyToClipboard(pkp.tokenId)}>
                                        <div className={`copied ${clipboard === pkp.tokenId ? 'active' : ''}`}>Copied</div>
                                        {pkp.tokenId}
                                      </div>
                                    </div>
                                    <div className="cc-token">
                                      <div className="cc-token-name">Public Key</div>
                                      <div className="cc-token-addr" onClick={() => copyToClipboard(pkp.pubKey)}>
                                        <div className={`copied ${clipboard === pkp.pubKey ? 'active' : ''}`}>Copied</div>
                                        {pkp.pubKey}
                                      </div>
                                    </div>
                                  </div>
                              }
                            </div>
                          })
                      }

                      {
                        (viewType === 0 && !switching) ?
                          <div className="credit-card credit-card-add" onClick={addWallet} >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48px" height="48px">
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                          </div> : <></>
                      }

                    </div>
                  </ScrollContainer>

                  <div className={`card-options ${!currentPKP ? 'disabled' : ''}`}>
                    <div className="card-option">
                      <div onClick={() => setFlip(!flip)} className={`card-option-icon`}><Icon name="wallet" /></div>
                      <span>Details</span>
                    </div>
                    <div className="card-option">
                      <div onClick={() => setContentIndex(0)} className={`${contentIndex === 0 ? 'active' : ''} card-option-icon`}><Icon name="app" /></div>
                      <span>Actions</span>
                    </div>
                    <div className="card-option">
                      <div onClick={() => setContentIndex(1)} className={`${contentIndex === 1 ? 'active' : ''} card-option-icon`}><Icon name="key" /></div>
                      <span>Auth</span>
                    </div>
                  </div>

                  <div className={`content contentIndex-${contentIndex}`}>

                    {/* content index 1 */}
                    <div className="content-page actions">
                      <div className="spread content-header">
                        <h5><span className={`${!currentPKP ? 'disabled' : ''}`}>Actions</span></h5>
                        {/* <Icon onClick={() => {
                          setActivePage('io')
                        }} name="add" /> */}
                      </div>

                      {/* Here's a list of actions you can perform with your account. */}

                      <section>
                        <div onClick={() => setActivePage(PAGE_ORBIS_PROOF_POST)} className={`action ${!currentPKP ? 'disabled' : ''}`}>
                          <img src="https://orbis.club/img/orbis-logo.png" alt="orbis" />
                          <span>Orbis<br />Proof Post</span>
                        </div>
                        <div onClick={() => setActivePage(PAGE_ORBIS_CREATE_POST)} className={`action ${!currentPKP ? 'disabled' : ''}`}>
                          <img src="https://orbis.club/img/orbis-logo.png" alt="orbis" />
                          <span>Orbis<br />Create Post</span>
                        </div>
                        <div onClick={() => onLitActionsPrivateKey()} className={`seed action ${!currentPKP ? 'disabled' : ''}`}>
                          <Icon name="seed" />
                          <span>Lit Action<br />Seed</span>
                        </div>
                        {/* <div onClick={() => onLitActionsTest()} className={`action ${!currentPKP ? 'disabled' : ''}`}>
                          <Icon name="lit" />
                          <span>Lit Action<br />(test)</span>
                        </div> */}
                        <div onClick={() => onLitActionsCreatePost()} className={`action ${!currentPKP ? 'disabled' : ''}`}>
                          <Icon name="lit" />
                          <span>Lit Action<br />Create Post</span>
                        </div>

                        <div onClick={() => onLitActionsGetPosts()} className={`action ${!currentPKP ? 'disabled' : ''}`}>
                          <Icon name="lit" />
                          <span>Lit Action<br />(Get Posts)</span>
                        </div>

                        <div onClick={() => setActivePage(PAGE_MESSAGE_MONITOR)} className={`action ${!currentPKP ? 'disabled' : ''}`}>
                          <Icon name={`${monitorEnabled ? 'listen-on' : 'listen-off'}`} />
                          <span>Message Listener {monitorEnabled ? '(ON)' : '(OFF)'}</span>
                        </div>

                      </section>

                    </div>

                    {/* content index 2 */}
                    <div className="content-page authorized-accounts">
                      <div className="spread content-header">
                        <h5><span>Authorized Accounts</span></h5>
                        <Icon onClick={() => {
                          setActivePage('io')
                        }} name="add" />
                      </div>
                      <div className="rows">
                        {
                          !pkps ? '' : pkps[selectedCardIndex]?.authorizedAccounts.map((account, i) => {

                            if (account === address) return <div key={i}></div>;

                            return (
                              <div key={i}>
                                <div className="row" onClick={() => {
                                  setActivePage('psaa');
                                  setSelectedAuthorizedAccount(account);
                                }}>
                                  <Blockies
                                    seed={account}
                                    size={10}
                                    scale={3}
                                    color="#35343a"
                                    bgColor="#f152b2"
                                    spotColor="#fe9e61"
                                    className="identicon"
                                  />
                                  <div className="row-col-1">
                                    {account}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>

                    </div>

                  </div>


                </div>
              </div>
          }

          {/* page-x */}
          <div className={`page page-pop page-x ${activePage}`}>
            <div className="text text-red cursor" onClick={() => {
              setActivePage(0);
              clearStates();
            }}>Cancel</div>
            <div className="page-center">
              <h1><span>Add new Wallet</span></h1>
              <p>
                Keep all the cloud wallets in one place.
              </p>
              <div className="button-brand-2" onClick={mintPkp}>Get a new one!</div>
              {
                minting ? <div className="loading-with-text">
                  <Loading />
                  <span>Minting...</span>
                </div> : ''
              }
              {
                error ? <div className="text text-red">{error}</div> : ''
              }
              {
                success ? <div className="text text-green">{success}</div> : ''
              }
            </div>
          </div>

          {/* page-selected-authorized-account */}
          <div className={`page page-pop page-selected-authorized-account ${activePage}`}>
            <div className="text text-red cursor" onClick={() => {
              setActivePage(0);
              setSelectedAuthorizedAccount(null);
              setUnauthorizing(false);
            }}>Done</div>
            <div className="page-center">
              <h1><span>Account</span></h1>

              <div className="separator"></div>
              {
                selectedAuthorizedAccount === address ? <div className="text-lg text-red center">
                  <div className="separator-sm"></div>
                  THIS IS YOUR OWN ACCOUNT, IF YOU DELETE THIS YOU WILL LOSE ACCESS TO YOUR WALLET
                  <div className="separator-sm"></div>
                </div> : ''
              }

              <div className="button-cancel" onClick={() => onUnauthorize()}>
                <div className="text-sm">{selectedAuthorizedAccount}</div>
                <div>Unauthorize account</div>
              </div>

              {/* states */}
              {
                unauthorizing ? <div className="loading-with-text">
                  <div className="separator-sm"></div>
                  <Loading />
                  <span>{unauthorizingMsg}</span>
                  <div className="separator-sm"></div>
                </div> : ''
              }

              {
                error ? <div className="text text-red center">
                  <div className="separator-sm"></div>
                  {error}
                  <div className="separator-sm"></div>
                </div> : ''
              }

              {
                success ? <div className="text text-green center">
                  <div className="separator-sm"></div>
                  {success}
                  <div className="separator-sm"></div>
                </div> : ''
              }

            </div>
          </div>


          {/* add authorized account */}
          <div className={`page page-input ${activePage === 'io' ? 'io' : ''}`}>

            <div className="page-input-inner">

              <div className="page-center">
                <div className="separator-sm"></div>
                <div className="">
                  <h6 className="center"><span>Enter the address of the account <br />you want to authorize.</span></h6>
                </div>
                <div className="separator-sm"></div>

                <div className="input-group">
                  <input type="text" placeholder="0x..." value={authorizeAccount} onChange={(e) => setAuthorizeAccount(e.target.value)} />

                  <div className="button-group">
                    <div className="button-cancel" onClick={() => setActivePage(0)}>Cancel</div>
                    <div className="button-brand-2" onClick={() => onAuthorize()}>Save</div>
                  </div>

                  {/* states */}
                  {
                    authorizing ? <div className="loading-with-text">
                      <div className="separator-sm"></div>
                      <Loading />
                      <span>{authorizingMsg}</span>
                      <div className="separator-sm"></div>
                    </div> : ''
                  }

                  {
                    error ? <div className="text text-red center">
                      <div className="separator-sm"></div>
                      {error}
                      <div className="separator-sm"></div>
                    </div> : ''
                  }

                  {
                    success ? <div className="text text-green center">
                      <div className="separator-sm"></div>
                      {success}
                      <div className="separator-sm"></div>
                    </div> : ''
                  }

                </div>


              </div>
            </div>
          </div>

          {/* action handler */}
          <div className={`page page-input ${activePage === PAGE_ORBIS_PROOF_POST ? PAGE_ORBIS_PROOF_POST : ''}`}>

            <div className="page-input-inner">
              {/* <div className="text text-red cursor" onClick={() => setActivePage(0)}>Cancel</div> */}

              <div className="page-center">
                <div className="separator-sm"></div>
                <div className="">
                  <h6 className="center"><span>Create a standard message to prove that this post was created by PKP.</span></h6>
                </div>
                <div className="separator-sm"></div>

                <div className="input-group">
                  {/* <input type="text" placeholder="0x..." value={authorizeAccount} onChange={(e) => setAuthorizeAccount(e.target.value)} /> */}

                  {
                    (pkps && address) ?
                      <div className="example-format">
                        This post is created by a PKP<br />
                        Triggered by:{address}<br />
                        PKP Token ID: {viewType === 0 ? pkps[selectedCardIndex]?.tokenId : authorizedPkps[selectedCardIndex]?.tokenId}<br />
                        PKP Address: {viewType === 0 ? pkps[selectedCardIndex]?.address : authorizedPkps[selectedCardIndex]?.address}
                      </div>
                      : ''
                  }

                  <div className="button-group">
                    <div className="button-cancel" onClick={() => {
                      setActivePage(0)
                      clearStates();
                    }}>Cancel</div>
                    <div className="button-brand-2" onClick={() => onProofPost()}>Send</div>
                  </div>

                  {/* states */}
                  {
                    proofPosting ? <div className="loading-with-text">
                      <div className="separator-sm"></div>
                      <Loading />
                      <span>{proofPostingMessage}</span>
                      <div className="separator-sm"></div>
                    </div> : ''
                  }

                  {
                    error ? <div className="text text-red center">
                      <div className="separator-sm"></div>
                      {error}
                      <div className="separator-sm"></div>
                    </div> : ''
                  }

                  {
                    success ? <div className="text text-green center">
                      <div className="separator-sm"></div>
                      {success}
                      <div className="separator-sm"></div>
                    </div> : ''
                  }

                  {
                    proofPostingResult ? <div className="page-input-result example-format text-left">
                      {/* {JSON.stringify(proofPostingResult)} */}
                      <h6><span>Orbis</span></h6>
                      <a onClick={() => goto(JSON.parse(proofPostingResult)?.orbis)}>{JSON.parse(proofPostingResult)?.orbis}</a>
                      <div className="separator-xxs"></div>
                      <h6><span>Cerscan</span></h6>
                      <a onClick={() => goto(JSON.parse(proofPostingResult)?.cerscan)}>{JSON.parse(proofPostingResult)?.cerscan}</a>
                    </div> : <></>
                  }

                </div>


              </div>
            </div>
          </div>

          {/* Orbis Create Post */}
          {
            !loggedIn ? '' :
              <Dialog
                signal={signal}
                id={PAGE_ORBIS_CREATE_POST}
                activePage={activePage}
                pageTitle={`Create a Orbis Post using this PKP ${short(currentPKP.address)}`}
                onCancel={() => setActivePage(0)}
                onSubmit={async (
                  data,
                  setError,
                  setSuccess,
                  setLoading,
                  setLoadingMessage,
                  setPostContent,
                ) => {
                  setLoading(true);
                  setLoadingMessage('Creating post...');

                  var res;
                  try {
                    res = await magicActionHandler({
                      method: 'create_post',
                      data: data.inputValue,
                    });
                  } catch (e) {
                    setError(e.message);
                    setLoading(false);
                    setLoadingMessage('');
                    return;
                  }

                  if (res.status !== 200) {
                    setError("Failed to create post.");
                    setLoading(false);
                    setLoadingMessage('');
                    return;
                  }

                  setLoading(false);
                  setLoadingMessage('');

                  const links = getLinks(res.doc);
                  // setSuccess("Post created successfully.");
                  setPostContent(<>
                    <div className="page-input-result example-format text-left">

                      <h6><span>Orbis</span></h6>
                      <a onClick={() => goto(links.orbis)}>{links.orbis}</a>
                      <div className="separator-xxs"></div>
                      <h6><span>Cerscan</span></h6>
                      <a onClick={() => goto(links.cerscan)}>{links.cerscan}</a>
                    </div>
                  </>);


                }}
                submitText="Send (Enter)"
                input={{
                  placeholder: 'type your message here...'
                }}
              >
              </Dialog>
          }



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
              setPostContent,
            ) => {
              setLoading(true);

              setLoadingMessage('Checking permission...');

              await new Promise((resolve) => setTimeout(resolve, 500));
              var isPermitted = await isBotPermitted();

              setLoadingMessage(`Bot is ${isPermitted ? '' : 'not '}permitted`);

              await new Promise((resolve) => setTimeout(resolve, 500));

              if (monitorEnabled === false) {

                // if (isPermitted === false) {
                //   setLoadingMessage('Permitting bot...');
                //   try {
                //     await permitBot();
                //   } catch (e) {
                //     setLoading(false);
                //     setError('Bot permit failed');
                //     return;
                //   }
                // }
                // setLoadingMessage('Bot permitted. Adding job...');
                
                var res = await onAddJob();

                console.log("res:", res);

                if (res.status !== 200) {
                  setLoading(false);
                  setError('Bot has failed to start');
                  return;
                }
                setLoading(false);
                setSuccess('Bot has started successfully');
                setMonitorEnabled(true);

              } else {


                // if (isPermitted === true) {
                //   setLoadingMessage('Revoking bot...');
                //   var res = await revokeBot();

                //   if (res.status !== 200) {
                //     setLoading(false);
                //     setError('Bot revoke failed');
                //     return;
                //   }
                // }
                // setLoadingMessage('Bot revoked. Removing job...');
                var res = await onRemoveJob();
                console.log(res);
                if (res.status === 200) {
                  setLoading(false);
                  setSuccess('Job removed successfully');
                  setMonitorEnabled(false);
                } else {
                  setLoading(false);
                  setError(res);
                }
              }

            }}
            submitText={monitorEnabled ? <>
              <True />Enabled
            </> : <><False />Disabled</>}
            alertMessage={<>
              By enabling this feature, you will allow our bot <span><a target="_blank" href={`https://mumbai.polygonscan.com/address/${BOT_ADDRESS}`}>{BOT_ADDRESS}</a></span> to access and analyze your PKP messages on Orbis Protocol and perform actions based on the commands it detects.
            </>}
          >
            <div className="guide">
              The following commands are available:
              <ul>
                <li>/send [address] [amount in wei]</li>
                {/* <li>/help</li> */}
                <li className="disabled">/recurring-payment [address] [amount] [interval] [start] [end]</li>
                <li className="disabled">more coming soon...</li>
              </ul>
            </div>
          </Dialog>

        </div >

        {/* iframe */}
        < div id="second-device" className={`iframe ${iframeActive ? 'active' : ''}`}>
          <div className="close" onClick={() => setIframeActive(false)}>
            <Icon name="close" />
          </div>
          <iframe className="device-apple" src={iframeLink}></iframe>
        </div >


        {/* jobs */}
        < div className="jobs" >
          {!jobs ? <></> : jobs.map((job, index) => {
            return <div key={index} className="job">
              <div className="job-inner">
                <div className="job-status">{index + 1}</div>
                <div className="job-title">{job.task}</div>
                <div className="job-description">{JSON.stringify(job.params.pkp.address)}</div>
              </div>
            </div>
          })}
        </div >

        {/* debug */}
        < div className="debug hide" >
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
                <td>{authorizeAccount ? short(authorizeAccount, 1, 1, '**') : 'N/A'}</td>
              </tr>
              <tr>
                <th>authorizing:</th>
                <td>{authorizing ? <True /> : <False />}</td>
              </tr>
              <tr>
                <th>selectedAuthorizedAccount:</th>
                <td>{selectedAuthorizedAccount ? short(selectedAuthorizedAccount) : 'N/A'}</td>
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
                <td>{currentPKP ? short(currentPKP.tokenId) : ''}</td>
              </tr>
              <tr>
                <th>monitorEnabled:</th>
                <td>{monitorEnabled ? <True /> : <False />}</td>
              </tr>
            </tbody>
          </table>

        </div >

        {/* controllers */}
        < div className='controllers hide' >

          {/* merged operations */}
          < a className='App-link' onClick={connect} > Connect</a ><br />
          <a className='App-link' onClick={connectMagic}>Connect Magic</a><br />

          === <br />
          {/* connect lit */}
          <a className='App-link' onClick={connectLit}>Connect Lit</a><br />
          {
            !lit ? '' : <>
              ---<br />
              <a className='App-link' onClick={() => getPKPs(address)}>-{">"} Get PKPs</a><br />
              <a className='App-link' onClick={() => getPermitted()}>-{">"} Get Permitted</a><br />
              <a className='App-link' onClick={runLitAction}>-{">"} Run Lit Action</a><br />
              <a className='App-link' onClick={getCode}>-{">"} Get Lit Action</a><br />
              <a className='App-link' onClick={connectPKP}>-{">"} Connect PKP</a><br />
            </>
          }

          {/* connect orbis */}
          ===<br />
          <a className='App-link' onClick={connectOrbis}>Connect Orbis</a><br />
          {
            !user
              ?
              <>
              </>
              :
              <>
                ---<br />
                <a className='App-link' onClick={createPost}>-{">"} Create Post</a><br />
                <a className='App-link' onClick={editPost}>-{">"} Edit Post</a><br />
                <a className='App-link' onClick={getPosts}>-{">"} Get Posts</a><br />
                <a className='App-link' onClick={getConversations}>-{">"} Get Conversations</a><br />
                <a className='App-link' onClick={getPermittedPKPs}>-{">"} Get Permitted Tokens</a>
                <a className='App-link' onClick={getAuthSig}>-{">"} Get AuthSig</a>
              </>
          }
        </div >
      </header >
    </div >
  );
}

export default App;
