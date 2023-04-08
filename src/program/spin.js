import { getProgram } from "./getProgram";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { signAndSend } from "./signAndSend";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { BN } from "bn.js";


export const spin = async (kp, isWallet, gameSeed, amount, setSpinning) => {
  const program = getProgram(kp);
  const transaction = new Transaction();
  const [zeusInfoPk] = await PublicKey.findProgramAddress(
    [Buffer.from(`zeus`)],
    program.programId
  );


  const zeusAcct = await program.account.zeusInfo.fetch(zeusInfoPk);
  const collateralMintPk = zeusAcct.collateralMint;
  const userAtaPk = await getAssociatedTokenAddress(
    collateralMintPk,
    kp.publicKey
  );
  const userAtaBalance =
    await program.provider.connection.getTokenAccountBalance(userAtaPk);
  console.log(userAtaBalance);

  const approveinstruction = createApproveInstruction(
    userAtaPk,
    zeusInfoPk,
    kp.publicKey,
    Number(amount) * 1e3
  );
  transaction.add(approveinstruction);

  const collateralTokenAccount = await getAssociatedTokenAddress(
    collateralMintPk,
    zeusInfoPk,
    true
  );

  const [gamePk] = await PublicKey.findProgramAddress(
    [Buffer.from(gameSeed)],
    program.programId
  );

  const spin = await program.methods
    .playRndGame(new BN(Number(amount) * 1e3))
    .accounts({
      payer: kp.publicKey,
      game: gamePk,
      collateralTokenAccount,
      userCollateralTokenAccount: userAtaPk,
      zeusInfo: zeusInfoPk,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      recentSlothashes: new PublicKey(
        "SysvarS1otHashes111111111111111111111111111"
      ),
    })
    .signers([kp])
    .instruction();

  transaction.add(spin);
  let signers = []
  if (!isWallet) {
    signers.push(kp)
  }

  return await signAndSend(program.provider.connection, transaction, kp, signers, setSpinning, isWallet);
};
