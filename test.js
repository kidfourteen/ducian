require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const delay = require("delay");

// import ABI
const GalaxyTokenABI = require("./GalaxyToken.json");

// connect wallet
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
let wallet1 = new ethers.Wallet(process.env.PRIVATE_KEY_1);
let wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_2);

const provider = ethers.getDefaultProvider('https://data-seed-prebsc-2-s3.binance.org:8545', { checkTransaction: false });
// const provider = ethers.getDefaultProvider('https://rpc.ankr.com/fantom_testnet');
wallet = wallet.connect(provider);
wallet1 = wallet1.connect(provider);
wallet2 = wallet2.connect(provider);

// Token
const addressToken = "0x4ABEf176F22B9a71B45ddc6c4A115095d8761b37";
const contractTokenWithWallet1 = new ethers.Contract(addressToken, GalaxyTokenABI, wallet1);
const contractTokenWithWallet2 = new ethers.Contract(addressToken, GalaxyTokenABI, wallet2);

let gasPrice = ethers.utils.parseUnits("10", "gwei");

async function multiTransaction() {
  const balance = ethers.utils.parseUnits("0.01", "ether");
  console.log(balance.toString());
  const estimateGas = await provider.estimateGas({
    to: wallet2.address,
    value: balance
  });
  const estimateTxFee = gasPrice.mul(estimateGas);
  const amount1 = balance.sub(estimateTxFee);
  const amount2 = amount1.sub(estimateTxFee);

  console.log(estimateTxFee.toString());
  console.log(wallet1.address, amount1.toString());
  console.log(wallet2.address, amount2.toString());

  const nonce = await provider.getTransactionCount(wallet1.address);
  const nonce2 = await provider.getTransactionCount(wallet2.address);
  const start = Date.now();

  const transfer = await wallet1.sendTransaction({
    to: wallet2.address,
    value: amount1,
    gasLimit: 50000,
    gasPrice: ethers.utils.parseUnits("12", "gwei")
  });
  console.log("Time", Date.now() - start);
  // await transfer.wait();
  await delay(Date.now() - start);
  console.log("Time wait", Date.now() - start);

  const transfer1 = contractTokenWithWallet1.transfer(
    wallet2.address,
    ethers.utils.parseUnits("10.0", "ether"),
    {
      nonce: nonce + 1,
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("11", "gwei")
    }
  );

  console.log("Time1", Date.now() - start);

  // const transfer2 = wallet2.sendTransaction({
  //   to: wallet1.address,
  //   value: amount2,
  //   gasLimit: 50000,
  //   gasPrice: gasPrice
  // }, { checkTransaction: false });
  // console.log("Time2", Date.now() - start);

  const transfer2 = contractTokenWithWallet2.transfer(
    wallet1.address,
    ethers.utils.parseUnits("10.0", "ether"),
    {
      nonce: nonce2,
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("10", "gwei")
    }
  );

  console.log(await Promise.all([transfer1, transfer2]), "Chuyển tiền thành công");
}

async function main() {
  while (true) {
    await multiTransaction();
    await delay(1000 * 15);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
