import { getProgram } from "./getProgram";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export const getHmbBalance = async (wallet) => {
  if (!wallet) {
    return 0
  }
  console.log("getHmbBalance")
  const program = getProgram(wallet);
  console.log(program);
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
  try {    
    const userAtaBalance =
      await program.provider.connection.getTokenAccountBalance(userAtaPk);
    return userAtaBalance
  } catch (error) {
    return {value:{
      amount: 0,
      decimals: 9,
      uiAmount: "You don't have any HMB, buy some to play",
      uiAmountString: 0,
    }};
  }
};
