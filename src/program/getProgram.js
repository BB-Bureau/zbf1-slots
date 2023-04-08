import { Connection, PublicKey } from "@solana/web3.js";
import {
    Program,
    AnchorProvider
} from "@project-serum/anchor";
import { idl } from "./idl";
import { clusterUrl } from "./constants";

export function getProgram(wallet) {
    const programID = new PublicKey(idl.metadata.address);
    const connection = new Connection(clusterUrl, {
        commitment: 'confirmed',
    });
    const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
        commitment: "confirmed",        
    });
    const program = new Program(idl, programID, provider);
    // connection.getTransaction("2PnVF2fdVgyYnMfprpYsYBcethn8jwcdHEs63p96ypZ2xMsbzQrYWScyrNRhTFXcXayoCo5KCzwDB4Laxb96bfA1").then(data => {
    //     debugger

    //     console.log(data)
    // }).catch((er) => {
    //     debugger
    //     console.log(er)
    // })

    return program;
}
