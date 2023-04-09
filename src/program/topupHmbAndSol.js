import { getProgram } from "./getProgram";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { signAndSend } from "./signAndSend";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { web3 } from "@project-serum/anchor";

export const topupHmbAndSol = async (localKp, wallet, hmb, sol) => {
  const program = getProgram(wallet);
  const transaction = new Transaction();
  const [zeusInfoPk] = await PublicKey.findProgramAddress(
    [Buffer.from(`zeus`)],
    program.programId
  );

  const zeusAcct = await program.account.zeusInfo.fetch(zeusInfoPk);
  const collateralMintPk = zeusAcct.collateralMint;
  const userAtaPk = await getAssociatedTokenAddress(
    collateralMintPk,
    wallet.publicKey
  );
  const localAtaPk = await getAssociatedTokenAddress(
    collateralMintPk,
    localKp.publicKey
  );
  try {
    await getAccount(
      program.provider.connection,
      localAtaPk,
      "confirmed",
      TOKEN_PROGRAM_ID
    );
  } catch (err) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        localAtaPk,
        localKp.publicKey,
        collateralMintPk,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  const approveinstruction = createTransferInstruction(
    userAtaPk,
    localAtaPk,
    wallet.publicKey,
    1000000
  );
  transaction.add(approveinstruction);
  if (sol < 0.01) {
    transaction.add(
      web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: localKp.publicKey,
        lamports: 0.01 * web3.LAMPORTS_PER_SOL, //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
      })
    );
  }

  return await signAndSend(
    program.provider.connection,
    transaction,
    wallet,
    [],
    () => {},
    true
  );
};
