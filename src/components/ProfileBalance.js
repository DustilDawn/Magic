import { Network, Alchemy } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';


export const ProfileBalance = ({ address }) => {

    const settings = {
        apiKey: "vuIiw10Ta4fVFIzAIIjfTl6Z-TBlJWkh",
        network: Network.MATIC_MUMBAI,
    };

    const alchemy = new Alchemy(settings);


    const [balance, setBalance] = useState();

    useEffect(() => {
        async function getBalance() {
            alchemy.core
                .getBalance(address, "latest")
                .then((res) => {
                    var balance = (ethers.utils.formatUnits(res, "ether")).toString();
                    // keep it 2 decimal places
                    balance = balance.slice(0, balance.indexOf(".") + 3);
                    setBalance(balance);
                    console.log(balance);
                });
        }
        if (!balance) {
            getBalance();
        }
    });


    return (
        <>
            {address && balance ? <>
                {balance} MATIC
            </> : ''}
        </>
    )
}