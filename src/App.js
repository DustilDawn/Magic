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

const smartContracts = {
  pkp: '0x86062B7a01B8b2e22619dBE0C15cbe3F7EBd0E92',
  pkpAbi: require('./contracts/pkp.json'),
  router: '0xEA287AF8d8835eb20175875e89576bf583539B37',
  routerAbi: require('./contracts/router.json'),
}

function App() {

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

  useEffect(() => {

    if (address && user && pkps && lit && orbis && !authorizing && !unauthorizing && !success && !error && !contracts) {
      setLoggedIn(true);
      setActivePage(0);
      // setActivePage('x');
      // setActivePage('io');
      // setActivePage('psaa');

    } else {
      setLoggedIn(false);
    }

    if (time == null) {
      setTime(getCurrentTime())

      setInterval(async () => {
        // console.log("Set");
        setTime(getCurrentTime())
      }, 1000);
    }

    function keyDownHandler(event) {
      console.log('User pressed: ', event.key);

      if (event.key === 'Escape') {
        event.preventDefault();
        setActivePage(0);
      }
    };

    // loading state
    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };

  }, [address, user, pkps, lit, orbis, contracts])

  function scrollToCard(cardIndex, { start = 0, ms = 1000 }) {

    var scroll = document.getElementsByClassName('scroll-container')[0];
    var card = document.getElementsByClassName('credit-card')[cardIndex];
    // var paddingLeft = 18;
    var paddingLeft = card.clientWidth - (18);

    scrollEaseIn(scroll, ((card.offsetLeft + 1) - paddingLeft), ms);

  }

  // orbisLit
  async function connect() {
    setLoading(true);
    let lit = await connectLit();
    let orbis = await connectOrbis();

    if (lit && orbis) {
      setLoading(false);
    }
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

  async function runLitAction(file) {

    // calculate the time it takes to execute
    var start = new Date().getTime();

    file = 'create-post';

    var code = await getCode(file);

    console.log("code:", code);

    console.warn("pkps[selectedCardIndex].pubKey:", pkps[selectedCardIndex].pubKey);

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    const signatures = await lit.executeJs({
      code,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        // this is the string "Hello World" for testing
        toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
        publicKey: pkps[selectedCardIndex].pubKey,
        sigName: "sig1",
      },
    });

    var end = new Date().getTime();
    var time = end - start;

    console.warn("time:", time);
    console.log("signatures: ", signatures);

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
      console.log("mint:", mint);

      let wait = await mint.wait();
      console.log("wait:", wait);

      await getPKPs(address);

      console.log("Done!");
      setSuccess("PKP minted successfully! Go back to the main page to see it.");

      // await 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      setActivePage(0);
      setSelectedCardIndex(pkps.length)
      scrollToCard(pkps.length, { ms: 1000 });

    } catch (e) {
      console.log(e);
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

    console.log("getting pkps...");

    let storagePkps;

    try {
      storagePkps = JSON.parse(localStorage.getItem('magic-pkps'))[controller];
      console.log("storagePkps:", storagePkps);
    } catch (e) {
      console.log("no pkps in storage");
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
    let contracts = new LitContracts();
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
          console.log("using the one in storage")
          tokenId = storagePkps[i].tokenId;
          pubKey = storagePkps[i].pubKey;
          address = storagePkps[i].address;
          authorizedAccounts = storagePkps[i].authorizedAccounts;
        } else {
          console.log("fetching new pkp from ", controller)
          pkp = await contract.tokenOfOwnerByIndex(controller, i);
          console.log("pkp:", pkp);

          tokenId = pkp.toString();
          console.log("tokenId:", tokenId);

          pubKey = await contractRouter.getPubkey(tokenId);
          console.log("Getting authorized accounts...");
          authorizedAccounts = await contracts.pkpPermissionsContract.read.getPermittedAddresses(tokenId);
          console.log("authorizedAccounts:", authorizedAccounts);
          address = ethers.utils.computeAddress(pubKey);
        }

        did = 'did:pkh:eip155:1:' + address.toLowerCase();

        if (refetchAuthorizedAccounts) {
          console.log("refetch authorized accounts");
          authorizedAccounts = await contracts.pkpPermissionsContract.read.getPermittedAddresses(tokenId);
        }

        pkps.push({ tokenId, pubKey, address, authorizedAccounts, did });
      } catch (e) {
        break;
      }
    }

    console.log("pkps:", pkps);

    setPkps(pkps);

    try {
      let storage = JSON.parse(localStorage.getItem('magic-pkps'));

      storage[controller] = pkps;

      localStorage.setItem('magic-pkps', JSON.stringify(storage));
    } catch (e) {
      console.log("no storage");
    }

    console.log("got pkps");
    return pkps;
  }

  async function connectPKP() {

    console.clear();

    console.warn("------ connectPKP Called!-----");

    const PKP_PUBKEY = pkps[selectedCardIndex].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain: "mumbai",
    });

    console.log("1. PKP_PUBKEY:", PKP_PUBKEY);
    console.log("2. CONTROLLER_AUTHSIG:", CONTROLLER_AUTHSIG);

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: "https://rpc-mumbai.maticvigil.com",
    });

    await magicWallet.connect();

    let orbis = new Orbis();

    let res = await orbis.connect_pkp(magicWallet);
    console.log("%c PKP Connected to Orbit!", "color: green; font-size: 20px;");

    console.log("5. res:", res);
    console.log("6. ...creating post");

    let createPost = await orbis.createPost({ body: 'Hello World' });
    console.log("7. createPost:", createPost);
  }

  async function magicActionHandler(payload) {

    const PKP_PUBKEY = pkps[selectedCardIndex].pubKey;

    const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
      chain: "mumbai",
    });

    const magicWallet = new Magic({
      pkpPubKey: PKP_PUBKEY,
      controllerAuthSig: CONTROLLER_AUTHSIG,
      provider: "https://rpc-mumbai.maticvigil.com",
    })

    await magicWallet.connect();

    let orbis = new Orbis();

    await orbis.connect_pkp(magicWallet);

    if (payload.method === 'create_post') {
      let res = await orbis.createPost({ body: payload.data });
      console.log(createPost);
      return res;

    } else if (payload.method === 'create_conversation') {
      let res = await orbis.createConversation(payload.data);
      console.log(res);
      return res;
    } else if (payload.method === 'send_message') {
      let res = await orbis.sendMessage(payload.data);
      console.log(res);
      return res;
    } else if (payload.method === 'follow') {
      let res = await orbis.setFollow(payload.data, true);
      console.log(res);
      return res;
    } else if (payload.method === 'unfollow') {
      let res = await orbis.setFollow(payload.data, false);
      console.log(res);
      return res;
    } else if (payload.method === 'get_conversations') {
      let res = await orbis.getConversations({
        did: payload.data,
      });
      console.log(res);
      return res;
    } else if (payload.method === 'notify_authorized') {

      console.log("~~~ NOTIFY AUTHORIZED ~~~ ");

      // message
      const MSG = `${payload.data.authorizeAccount}\nhas been permitted to use\n${payload.data.tokenId}`;
      const did = `did:pkh:eip155:1:${payload.data.authorizeAccount.toLowerCase()}`;

      console.log("MSG:", MSG);
      console.log("did:", did);

      let res1 = await orbis.createConversation({
        recipients: [did],
        name: 'PKP Authorized',
        description: MSG
      });

      console.warn("res1:", res1);

    } else if (payload.method === 'notify_unauthorized') {

      console.log("~~~ NOTIFY UNAUTHORIZED ~~~");

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

    console.log(res);
  }



  async function editPost() {
    let streamId = 'kjzl6cwe1jw148mdbse0ke7b6ygro8unpxmai219i41wyj221f525c5z98z7uxi';

    let res = await orbis.editPost(streamId, { body: 'Edited!' });

    if (res.status !== 200) throw new Error(res.message);

    console.log(res);

  }

  async function getPosts() {
    let { data, error } = await orbis.getPosts({
      did: user,
    });

    if (error) throw new Error(error);

    console.log(data);

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


      console.log(`Data: ${date}
payload: ${payload}
      `)
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

      if (found.state === false && found.timestamp > token.timestamp) {
        return;
      }

      if (token.state) {
        list.push(token);
      }
    })

    let contract = new ethers.Contract(smartContracts.pkp, smartContracts.pkpAbi, provider);
    let contractRouter = new ethers.Contract(smartContracts.router, smartContracts.routerAbi, provider);
    let contracts = new LitContracts();
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

    console.log("list:", list);
    console.log("pkps:", pkps);

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
    console.log("onAuthorize:", authorizeAccount);

    setAuthorizing(true);

    try {

      let tx = await contracts.pkpPermissionsContract.write.addPermittedAddress(pkps[selectedCardIndex].tokenId, authorizeAccount, []);
      let result = await tx.wait();
      console.log(result);
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
    console.log("selectedAuthorizedAccount:", selectedAuthorizedAccount);

    setUnauthorizing(true);

    try {
      let tx = await contracts.pkpPermissionsContract.write.removePermittedAddress(pkps[selectedCardIndex].tokenId, selectedAuthorizedAccount);
      let result = await tx.wait();
      console.log(result);
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
      console.log('Error copying to clipboard: ', err);
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
    console.log(result);
  }

  return (
    <div className="App">

      <header className="App-header">

        {/* device */}
        <div className={`device-apple ${loggedIn ? 'active' : ''}`}>

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

                  <div className='text user'><span>did:pkh:eip155:1:{short(user.split(':')[4], 6, 4, '...') ?? '[please connect orbis]'}</span></div>

                  <div className="separator-md"></div>
                </section>

                <div className="page-inner">

                  <div className="page-header">
                    <div className="spread view-type">
                      <h6 className={`view-type-h6 ${viewType === 0 ? 'active' : ''}`} onClick={() => setViewType(0)}><span>Your Accounts</span></h6>
                      <h6 className={`view-type-h6 ${viewType === 1 ? 'active' : ''}`} onClick={async () => {
                        setViewType(1);
                        setSwitching(true);
                        var tokens = await getPermittedPKPs();
                        setAuthorizedPkps(tokens);
                        setSwitching(false);
                      }}><span>Authorized</span></h6>
                    </div>
                    <Icon onClick={addWallet} name="add" />

                  </div>

                  <ScrollContainer className="scroll-container">
                    <div className={`${switching ? 'switching' : ''} cards`}>
                      {
                        (viewType === 0 && !pkps) || (viewType === 1 && !authorizedPkps) || (switching) ?
                          <Loading /> :
                          (viewType === 0 ? pkps : authorizedPkps).map((pkp, i) => {

                            return <div className={`credit-card ${(selectedCardIndex === i && flip) ? 'flip' : ''} gradient-${i} ${selectedCardIndex === i ? 'active' : ''}`} key={i}>

                              <div className="cc-tap-to-select" onClick={() => {
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
                        viewType === 0 ?
                          <div className="credit-card credit-card-add" onClick={addWallet} >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48px" height="48px">
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                          </div> : ''
                      }

                    </div>
                  </ScrollContainer>

                  <div className="card-options">
                    <div className="card-option">
                      <div onClick={() => setContentIndex(0)} className={`${contentIndex === 0 ? 'active' : ''} card-option-icon`}><Icon name="app" /></div>
                      <span>Actions</span>
                    </div>
                    <div className="card-option">
                      <div onClick={() => setContentIndex(1)} className={`${contentIndex === 1 ? 'active' : ''} card-option-icon`}><Icon name="key" /></div>
                      <span>Auth</span>
                    </div>
                    <div className="card-option">
                      <div onClick={() => setFlip(!flip)} className={`card-option-icon`}><Icon name="wallet" /></div>
                      <span>Details</span>
                    </div>
                  </div>

                  {/* 
                  <div className="tabs">
                    <h5 onClick={() => setContentIndex(0)}><span className={`${contentIndex !== 0 ? 'inactive' : ''}`}>Actions</span></h5>
                    <h5 onClick={() => setContentIndex(1)}><span className={`${contentIndex !== 1 ? 'inactive' : ''}`}>Authorized Accounts</span></h5>
                  </div> */}

                  <div className={`content contentIndex-${contentIndex}`}>

                    {/* content index 1 */}
                    <div className="content-page actions">
                      <div className="spread content-header">
                        <h5><span>Actions</span></h5>
                        {/* <Icon onClick={() => {
                          setActivePage('io')
                        }} name="add" /> */}
                      </div>

                      {/* Here's a list of actions you can perform with your account. */}

                      <section>
                        <div onClick={() => magicActionHandler({ method: 'create_post', data: 'Testing!' })} className="action">
                          <img src="https://orbis.club/img/orbis-logo.png" alt="orbis" />
                          <span>Orbis Post</span>
                        </div>
                        <div className="action disabled">
                          <img src="https://orbis.club/img/orbis-logo.png" alt="orbis" />
                          <span>Like Post</span>
                        </div>
                        <div className="action disabled">
                          <img src="https://orbis.club/img/orbis-logo.png" alt="orbis" />
                          <span>Create Post</span>
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
            <div className="text text-red cursor" onClick={() => setActivePage(0)}>Cancel</div>
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


          {/* page-input */}
          <div className={`page page-input ${activePage}`}>

            <div className="page-input-inner">
              {/* <div className="text text-red cursor" onClick={() => setActivePage(0)}>Cancel</div> */}

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

        </div>

        {/* debug */}
        <div className="debug">
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
            </tbody>
          </table>

        </div>

        {/* controllers */}
        <div className='controllers'>

          {/* merged operations */}
          <a className='App-link' onClick={connect}>Connect</a><br />

          ===<br />
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
              </>
          }
        </div>
      </header>
    </div>
  );
}

export default App;
