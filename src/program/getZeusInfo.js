import { getProgram } from "./getProgram";
import { PublicKey } from "@solana/web3.js";

export const getZeusInfo = async (wallet) => {
  const program = getProgram(wallet);
  console.log(program);
  const [zeusInfoPk] = await PublicKey.findProgramAddress(
    [Buffer.from(`zeus`)],
    program.programId
  );
  const zeusAcct = await program.account.zeusInfo.fetch(zeusInfoPk);
  return zeusAcct;
};
