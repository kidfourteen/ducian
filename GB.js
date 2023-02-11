require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const delay = require("delay");

const commandBot = require("./command");

// import ABI
const GalaxyChefABI = require("./GalaxyChef.json");
const GalaxyTokenABI = require("./GalaxyToken.json");

// connect wallet
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

const provider = ethers.getDefaultProvider('https://purple-dawn-pool.bsc.quiknode.pro/84d079f167a3fea70a6f75d21cabbde1bfde9a95/');
wallet = wallet.connect(provider);

const recipient = process.env.RECIPIENT;
let gasPrice = ethers.utils.parseUnits("8", "gwei");

async function watchEvent() {
  // GalaxyToken
  const addressToken = process.env.GALAXY_TOKEN;
  const contractToken = new ethers.Contract(addressToken, GalaxyTokenABI, wallet);

  contractToken.on("Transfer", async (from, to, value, event) => {
    try {
      if (to == wallet.address) {
        console.log('Người gửi đến:', from);
        console.log('Số lượng:', value.toString());
        balanceOf = await contractToken.balanceOf(wallet.address);
        if (balanceOf > 0) {
          await contractToken.transfer(recipient, balanceOf, { gasPrice: gasPrice });
          console.log('Chuyển tiền thành công');
        } else {
          console.log('Sô dư Galaxy ko đủ để chuyển');
        }
      }
    } catch (error) {
      console.log("Transfer Error");
    }
  });
}

//Check GFT
async function checkBalanceGFT() {
   //GalaxyToken
  const addressToken = process.env.GALAXY_TOKEN;
  const contractToken = new ethers.Contract(addressToken, GalaxyTokenABI, wallet);

  while (true) {
    const balanceOf = await contractToken.balanceOf(wallet.address);
    if (balanceOf > 0) {
      try {
        await contractToken.transfer(recipient, balanceOf, { gasPrice: gasPrice });
        console.log('Chuyển GFT thành công');
      } catch (error) {
        console.log("Error");
      }
    } else {
      console.log('Sô dư GFT ko đủ để chuyển');
    }
    await delay(20);
  }
}

//Check GLF
async function checkBalanceGLF() {
  // GalaxyToken
  const addressToken = process.env.GLF_TOKEN;
  const contractToken = new ethers.Contract(addressToken, GalaxyTokenABI, wallet);

  while (true) {
    const balanceOf = await contractToken.balanceOf(wallet.address);
    if (balanceOf > 0) {
      try {
        await contractToken.transfer(recipient, balanceOf, { gasPrice: gasPrice });
        console.log('Chuyển GLF thành công');
      } catch (error) {
        console.log("Error");
      }
    } else {
      console.log('Sô dư GLF ko đủ để chuyển');
    }
    await delay(20);
  }
}

//Check BNB
async function checkBalance() {
  while (true) {
    const balance = await provider.getBalance(wallet.address);
    console.log(balance.toString());
    if (balance > 0) {
      const estimateGas = await provider.estimateGas({
        to: recipient,
        value: balance
      });
      const gasPrice = await provider.getGasPrice();
      const estimateTxFee = gasPrice.mul(estimateGas);
      const BN = balance.sub(estimateTxFee);
      if (BN > 0) {
        try {
          await wallet.sendTransaction({
            to: recipient,
            value: BN
          });
          console.log("success");
        } catch (error) {
          console.log("error", BN.toString());
        }
      }
    }
    await delay(246);
  }
}


const startBot = async () => {
  try {
    console.log("Start Bot");
    // watchEvent();
    checkBalanceGFT();
    checkBalanceGLF();
    // commandBot.launch();
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};

startBot();
