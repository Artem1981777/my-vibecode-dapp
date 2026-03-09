import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import "./App.css"

// Placeholder contract address
const CONTRACT_ADDRESS = "TIP_JAR_CONTRACT_ADDRESS"

type Tip = {
  sender: string
  amount: number
  timestamp: number
}

declare global {
  interface Window {
    op_wallet: any
    opnet: any
  }
}

function truncateAddress(addr: string) {
  if (!addr) return ""
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const pad = (n: number) => n.toString().padStart(2, "0")

  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function App() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [tips, setTips] = useState<Tip[]>([])
  const [tipAmount, setTipAmount] = useState<string>("100")
  const [cooldown, setCooldown] = useState<number>(0)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  async function connectWallet() {
    try {
      const w = await window.op_wallet.connect()
      const addr = await w.getAddress()
      setWallet(addr)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function loadContractData() {
    try {
      const balance = await window.opnet.read({
        contract: CONTRACT_ADDRESS,
        method: "getJarBalance",
        args: []
      })

      const tips = await window.opnet.read({
        contract: CONTRACT_ADDRESS,
        method: "getRecentTips",
        args: []
      })

      setBalance(Number(balance))
      setTips(tips)

      if (wallet) {
        const lastTip = await window.opnet.read({
          contract: CONTRACT_ADDRESS,
          method: "getLastTipTime",
          args: [wallet]
        })

        const now = Math.floor(Date.now() / 1000)
        const next = Number(lastTip) + 86400
        const remaining = Math.max(0, next - now)

        setCooldown(remaining)
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function sendTip() {
    if (!wallet) return
    setError("")
    setLoading(true)

    try {
      const amount = Number(tipAmount)

      const tx = {
        to: CONTRACT_ADDRESS,
        method: "tip",
        args: [],
        value: amount
      }

      // simulate first
      await window.opnet.simulateTransaction({
        ...tx,
        signer: null
      })

      // send tx
      await window.op_wallet.sendTransaction(tx)

      triggerSuccessAnimation()
      await loadContractData()
    } catch (e: any) {
      setError(e.message)
    }

    setLoading(false)
  }

  function triggerSuccessAnimation() {
    confetti({
      particleCount: 120,
      spread: 80
    })

    const flash = document.getElementById("flash")
    if (flash) {
      flash.classList.add("flash")
      setTimeout(() => flash.classList.remove("flash"), 300)
    }
  }

  useEffect(() => {
    loadContractData()
  }, [wallet])

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const balanceBTC = balance / 100000000

  return (
    <div className="app">
      <div id="flash" className="flash-overlay"></div>

      <h1 className="title">⚡ Daily BTC Tip Jar</h1>

      {!wallet && (
        <button className="connect" onClick={connectWallet}>
          Connect OP_WALLET
        </button>
      )}

      {wallet && (
        <div className="wallet">
          Connected: {truncateAddress(wallet)}
        </div>
      )}

      <div className="panel">
        <h2>Jar Balance</h2>
        <div className="balance">
          {balance} sats
          <div className="btc">{balanceBTC.toFixed(8)} BTC</div>
        </div>
      </div>

      <div className="panel">
        <h2>Tip the Jar</h2>

        <div className="cooldown">
          {cooldown > 0
            ? `Next tip in ${formatTime(cooldown)}`
            : "Tip available now"}
        </div>

        <div className="tip-form">
          <input
            type="number"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            placeholder="Amount in sats"
          />

          <button onClick={sendTip} disabled={loading || cooldown > 0}>
            {loading ? "Sending..." : "Send Tip ⚡"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      <div className="panel">
        <h2>Last 10 Tips</h2>

        <div className="tips">
          {tips.map((tip, i) => (
            <div key={i} className="tip">
              <span className="addr">{truncateAddress(tip.sender)}</span>
              <span className="amount">{tip.amount} sats</span>
              <span className="time">
                {new Date(tip.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
