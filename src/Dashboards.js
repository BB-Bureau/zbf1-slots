import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { getHmbBalance } from "./program/getHmbBalance";
import { spin } from "./program/spin";
import { Keypair } from "@solana/web3.js";
import { getSolBalance } from "./program/getSolBalance";
import { claimAndCloseLocalKp } from "./program/claimAndCloseLocalKp";
import { approveSpending } from "./program/approveSpending";
import { topupHmbAndSol } from "./program/topupHmbAndSol";
import "./slotSymbol.css";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

window.Buffer = window.Buffer || require("buffer").Buffer;

const symbols = [
  { k: "a", v: <div>🥶</div> },
  { k: "b", v: <div>😱</div> },
  { k: "c", v: <div>😈</div> },
  { k: "d", v: <div>🥳</div> },
  { k: "e", v: <div>😳</div> },
  { k: "f", v: <div>🤑</div> },
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export default function Dashboard(props) {
  const wallet = useAnchorWallet();
  const [hmbBalance, setHmbBalance] = useState();
  const [hmbBalanceLocalKp, setHmbBalanceLocalKp] = useState();
  const [solBalanceLocalKp, setSolBalanceLocalKp] = useState();
  const [localKP, setLocalKP] = useState();
  const refreshAll = useCallback(() => {
    console.log("refresh on wallet change", { wallet });
    if (!wallet) return;
    getHmbBalance(wallet).then((data) => {
      setHmbBalance(data.value.uiAmount);
    });
    getHmbBalance(localKP).then((data) => {
      setHmbBalanceLocalKp(data.value.uiAmount);
    });
    getSolBalance(localKP).then((data) => {
      setSolBalanceLocalKp(data);
    });
  }, [wallet, localKP]);

  const claimAndClose = async () => {
    await claimAndCloseLocalKp(localKP, wallet);
    refreshAll();
  };
  const onApproveTopup = async () => {
    return approveSpending(localKP, wallet);
  };
  const topup = async () => {
    await topupHmbAndSol(localKP, wallet, hmbBalanceLocalKp, solBalanceLocalKp);
    refreshAll();
  };
  // useEffect( ()=> {
  //   if (spinning) {go()}
  // }, [spinning])

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    let serializedKeypair;
    serializedKeypair = localStorage.getItem("solanaKeypair");
    if (!serializedKeypair) {
      const keypair = Keypair.generate();
      serializedKeypair = JSON.stringify({
        privateKey: keypair.secretKey.toString(),
        publicKey: keypair.publicKey.toString(),
      });
      localStorage.setItem("hmbKp", serializedKeypair);
    }
    const keypairData = JSON.parse(serializedKeypair);
    const keypair = new Keypair({
      secretKey: Uint8Array.from(keypairData.privateKey.split(",")),
      publicKey: keypairData.publicKey,
    });
    setLocalKP(keypair);
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {!wallet?.publicKey && <div>Wallet Not Connected</div>}
      {wallet?.publicKey && (
        <>
          <div>
            <div>{wallet?.publicKey?.toString()}</div>
            <div>HMB balance: {hmbBalance}</div>
          </div>
        </>
      )}

      <br />
      <br />
      {localKP?.publicKey && <div>lkp: {localKP.publicKey.toString()}</div>}
      <div>Sol balance lkp: {solBalanceLocalKp}</div>
      <div>HMB balance lkp: {hmbBalanceLocalKp}</div>
      {(hmbBalanceLocalKp === 0 || solBalanceLocalKp === 0) && (
        <button onClick={topup}>topup</button>
      )}
      {hmbBalanceLocalKp !== 0 && solBalanceLocalKp !== 0 && (
        <button onClick={claimAndClose}> claim and close</button>
      )}
      <br />
      <br />
      <Slot
        refreshAll={refreshAll}
        seed={"rndgame1"}
        wallet={wallet}
        localKP={localKP}
      ></Slot>
      <br />
      <br />
      <Slot
        refreshAll={refreshAll}
        seed={"rndgame2"}
        wallet={wallet}
        localKP={localKP}
      ></Slot>
      <br />
      <br />
      <Slot
        refreshAll={refreshAll}
        seed={"rndgame3"}
        wallet={wallet}
        localKP={localKP}
      ></Slot>
      <br />
      <br />
      <Slot
        refreshAll={refreshAll}
        seed={"rndgame4"}
        wallet={wallet}
        localKP={localKP}
      ></Slot>
    </div>
  );
}

function Slot({ refreshAll, wallet, localKP, seed }) {
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState();
  const [targetCombination, setTargetCombination] = useState(
    shuffleArray(symbols)
  );
  console.log({targetCombination})
  const startSpinWithLWallet = () => {
    return startSpin(wallet, true, wallet);
  };
  const startSpinWithLkp = () => {
    return startSpin(localKP, false, wallet);
  };

  const startSpin = async (kp, isWallet, origWallet) => {
    const interval = setInterval(() => {
      setTargetCombination([...shuffleArray(symbols)]);
    }, 100);
    setSpinning(true);
    setLastResult("...");
    const amount = 10;
    spin(kp, isWallet, seed, amount, setSpinning, origWallet).then((tx) => {
      clearInterval(interval);
      const prevBalance = tx.meta.preTokenBalances.find(
        (b) => b.owner === kp.publicKey.toString()
      ).uiTokenAmount.uiAmount;
      const postBalance = tx.meta.postTokenBalances.find(
        (b) => b.owner === kp.publicKey.toString()
      ).uiTokenAmount.uiAmount;
      console.log(prevBalance, postBalance);
      const result = (postBalance - prevBalance) / amount;
      if (result === 0) {
        setTargetCombination([...shuffleArray(symbols)]);
      }
      if (result === 1) {
        // win 2 => 3 of the same
        const newArray = [...shuffleArray(symbols)]
        newArray[1] = newArray[0]
        newArray[2] = newArray[0]
        setTargetCombination([...shuffleArray(newArray)]);
      }
      if (result === 2) {
        // win 3 =>  4 of the same
        const newArray = [...shuffleArray(symbols)]
        newArray[1] = newArray[0]
        newArray[2] = newArray[0]
        newArray[3] = newArray[0]
        setTargetCombination([...shuffleArray(newArray)]);
      }
      if (result === 4) {
        // win 5 => 5 of the same || 3+3
        const newArray = [...shuffleArray(symbols)]
        newArray[1] = newArray[0]
        newArray[2] = newArray[0]
        newArray[3] = newArray[0]
        newArray[4] = newArray[0]
        setTargetCombination([...shuffleArray(newArray)]);
      }
      if (result === 9) {
        // win 10 => 6 of the same
        const newArray = [...shuffleArray(symbols)]
        newArray[1] = newArray[0]
        newArray[2] = newArray[0]
        newArray[3] = newArray[0]
        newArray[4] = newArray[0]
        newArray[5] = newArray[0]
        setTargetCombination([...shuffleArray(newArray)]);
      }
      if (postBalance > prevBalance) {
        setLastResult("You Win " + (postBalance - prevBalance + amount));
      } else {
        setLastResult("You Lose :(");
      }
      refreshAll();
    });
  };
  return (
    <div style={{ margin: "auto", maxWidth: "500px" }}>
      <div style={{ display: "flex" }}>
        {spinning && <div>spinning...</div>}
        {!spinning && <button style={{borderRadius:"40px", padding: "10px"} } onClick={startSpinWithLkp}> play 10</button>}
        {targetCombination.map((s, idx) => (
          <div key={idx} style={{ padding: "3px", fontSize: "50px" }}>
            {s.v}
          </div>
        ))}
      </div>
      {/* <button onClick={startSpinWithLWallet}> play 1</button> */}
      {lastResult && <div> {lastResult}</div>}
    </div>
  );
}
