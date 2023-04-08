import * as nacl from "tweetnacl";
import { clusterUrl } from "./constants";
import {
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  sendRawTransaction,
  Transaction,
} from "@solana/web3.js";
import { getProgram } from "./getProgram";
import {
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { signAndSend } from "./signAndSend";

export async function claimAndCloseLocalKp(kp, wallet) {
  console.log("getHmbBalance");
  const program = getProgram(wallet);
  console.log(program);
  const [zeusInfoPk] = await PublicKey.findProgramAddress(
    [Buffer.from(`zeus`)],
    program.programId
  );
  const zeusAcct = await program.account.zeusInfo.fetch(zeusInfoPk);
  const collateralMintPk = zeusAcct.collateralMint;
  const localKpAta = await getAssociatedTokenAddress(
    collateralMintPk,
    kp.publicKey
  );
  const localAtaBalance =
    await program.provider.connection.getTokenAccountBalance(localKpAta);
  const userAtaPk = await getAssociatedTokenAddress(
    collateralMintPk,
    wallet.publicKey
  );
  const transaction = new Transaction();

  debugger;
  if (Number(localAtaBalance.value.amount) > 0) {
    const inst = createTransferInstruction(
      localKpAta,
      userAtaPk,
      kp.publicKey,
      Number(localAtaBalance.value.amount)
    );
    transaction.add(inst);
  }
  // debugger
  // const inst2 = createCloseAccountInstruction(
  //   kp.publicKey,
  //   wallet.publicKey,
  //   kp.publicKey
  // );
  // transaction.add(inst2);
  console.log(localAtaBalance);
  return await signAndSend(
    program.provider.connection,
    transaction,
    kp,
    [],
    () => {},
    false
  );
}
