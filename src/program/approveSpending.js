import { getProgram } from "./getProgram";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { signAndSend } from "./signAndSend";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createApproveInstruction,
} from "@solana/spl-token";
import { BN } from "bn.js";


export const approveSpending = async (localKp, wallet) => {
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
  const userAtaBalance =
    await program.provider.connection.getTokenAccountBalance(userAtaPk);
  console.log(userAtaBalance);
  const approveinstruction = createApproveInstruction(
    userAtaPk,
    localKp.publicKey,
    wallet.publicKey,
    Number(userAtaBalance.value.amount)
  );
  transaction.add(approveinstruction);


  return await signAndSend(program.provider.connection, transaction, wallet, [], () => {}, true);
};
