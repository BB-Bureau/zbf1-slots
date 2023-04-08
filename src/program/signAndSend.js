import * as nacl from "tweetnacl";
import { clusterUrl } from "./constants";
import {
  Connection,
  sendAndConfirmRawTransaction,
  sendRawTransaction,
  Transaction,
} from "@solana/web3.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signAndSend(connection, transaction, wallet, signers, setSpinning, isWallet) {
  transaction.feePayer = wallet.publicKey;

  // retrieve transaction with blockhash from solproxy
  let blockhashObj = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashObj.blockhash;
  // sign on the browser
  let signed
  if (isWallet) {
    signed = await wallet.signTransaction(transaction);
  } else {
    transaction.sign(wallet)
    signed = transaction
  }

  setSpinning(true)
  // submit to proxy
  const tx = await (
    await fetch(clusterUrl + "/submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...signed,
        signatures: JSON.parse(
          JSON.stringify(
            signed.signatures.map((s) => {
              return { ...s, signature: [...s.signature] };
            })
          )
        ),
      }),
    })
  ).json();

  let txx = null;
  while (!txx) {
    txx = await connection.getTransaction(tx, "confirmed");
    console.log("txdata", txx);
    await sleep(1000);
  }
  setSpinning(false)
  return txx
}
