import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Icon from "./components/Icon";

export const GenerateSeed = ({onGenerate}) => {

    const [seed, setSeed] = useState('');

    useEffect(() => {

        if (!seed) {
            generate();
        }
    })

    async function generate() {

        console.log("generate");

        // generate random 32 bytes seed buffer using ethers
        var seedBuffer = ethers.utils.randomBytes(32);

        // get hex string from seed buffer
        // var seedHex = ethers.utils.hexlify(seedBuffer);
        // console.log(seedHex);

        // get address from seed buffer
        var wallet = new ethers.Wallet(seedBuffer);
        var seedHex = wallet.address;

        var data = { seedBuffer, seedHex };

        setSeed(data);

        if (onGenerate) {
            onGenerate(data);
        }
    }

    return (
        <div className="generate flex gap-12">
            <div className="generate-icon">
                <Icon name="refresh" onClick={() => generate()} />
            </div>
            <div className="example-format">{seed.seedHex}</div>
        </div>
    )
}