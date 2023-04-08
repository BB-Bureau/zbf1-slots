import { getProgram } from "./getProgram";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { clusterUrl } from "./constants";

export const getSolBalance = async (wallet) => {
  if (!wallet) {
    return 0;
  }
  console.log("getSolBalance");
  const connection = new Connection(clusterUrl, {
    commitment: "confirmed",
  });
  const balance = (await connection.getAccountInfo(wallet.publicKey)).lamports;
  console.log(balance / LAMPORTS_PER_SOL);

  return balance  / LAMPORTS_PER_SOL;
};
