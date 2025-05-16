import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Dirección real del contrato AUX en Sepolia
const AUX_CONTRACT_ADDRESS = "0x83ff3Cd4b280eC4aB76c508A110bfa073AC3caE8";
const AUX_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

export default function AuxApp() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);

  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      setProvider(prov);
      setSigner(signer);
      setAddress(addr);
    }
  };

  const loadBalance = async () => {
    if (!signer) return;
    const aux = new ethers.Contract(AUX_CONTRACT_ADDRESS, AUX_ABI, provider);
    const sym = await aux.symbol();
    const dec = await aux.decimals();
    const bal = await aux.balanceOf(address);
    setSymbol(sym);
    setDecimals(dec);
    setBalance(Number(ethers.formatUnits(bal, dec)));
  };

  const sendTokens = async () => {
    if (!signer) return alert("Conecta tu wallet primero");
    const aux = new ethers.Contract(AUX_CONTRACT_ADDRESS, AUX_ABI, signer);
    const tx = await aux.transfer(recipient, ethers.parseUnits(amount, decimals));
    await tx.wait();
    loadBalance();
    alert("Transferencia completada");
  };

  useEffect(() => {
    if (signer) loadBalance();
  }, [signer]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AUX Wallet dApp</h1>

      {!address ? (
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
          Conectar MetaMask
        </button>
      ) : (
        <div className="space-y-4">
          <p><strong>Dirección:</strong> {address}</p>
          <p><strong>Balance:</strong> {balance} {symbol}</p>

          <input
            type="text"
            placeholder="Dirección destino"
            className="border p-2 w-full"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="number"
            placeholder="Cantidad"
            className="border p-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={sendTokens} className="bg-green-500 text-white px-4 py-2 rounded">
            Enviar AUX
          </button>
        </div>
      )}
    </div>
  );
}
