// create post lit action
const go = async () => {

    // this requests a signature share from the Lit Node
    // the signature share will be automatically returned in the HTTP response from the node
    // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
    const sigShare = await Lit.Actions.signEcdsa({ toSign, publicKey, sigName });
    console.log("publicKey:", publicKey);
};

go();