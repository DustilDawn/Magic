import { PKPWallet } from "@lit-protocol/pkp-ethers.js";
import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

// Magic is a class that implements the EIP-1193 Ethereum Provider JavaScript API.

export class Magic extends PKPWallet {

    async connect() {
        await super.init();
    }
    async getNetwork() {
        return super.rpcProvider.getNetwork()
    }

    sendAsync = this.handler;
    send = this.handler;

    async handler(payload) {
        if (payload.method === 'eth_chainId') {

            var network = await this.rpcProvider.getNetwork();

            return hexlify(network.chainId);;

        } else if (payload.method === 'personal_sign') {

            if ((ethers.utils.computeAddress(this.publicKey)).toLowerCase() !== payload.params[1].toLowerCase()) {
                throw new Error('PKPWallet address does not match address requested');
            }

            return await this.signMessage(payload.params[0]);;

        } else {
            throw new Error(
                `rpc "${payload.method}" not supported`
            );
        }
    }

    enable() {
        console.log("ENABLED:", this.address);
        return [this.address];
    }

}