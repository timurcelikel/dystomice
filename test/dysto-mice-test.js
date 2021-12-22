const { expect } = require("chai");
const { ethers } = require("hardhat");
let DysToken;
let DystoMice;
let mice;

 beforeEach(async function () {
    DysToken = await ethers.getContractFactory("DysToken");
    dysToken = await DysToken.deploy();

    console.log("dysToken.address: ", dysToken.address);

    // Get the ContractFactory and Signers here.
    DystoMice = await ethers.getContractFactory("DystoMice");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been mined.
    mice = await DystoMice.deploy(
      "DystoMice", 
      "DYSTOMICE", 
      "ipfs://QmXHaUaMwr7hPsKZvLkZhKznvjqx1pZphAEo85BzzgyWPs/", 
      dysToken.address);
});

describe("DystoMice Test Initial Total Supply", function () {
 
  it("Should return mice total supply", async function () {
    
    expect(await mice.totalSupply()).to.equal(30);
  });
});

describe("DystoMice Test Increase Total Supply", function () {
 
  it("Should increase total supply", async function () {
  
    await mice.setStart(true);
    //const setStartedTx = await mice.setStart(true);
    //await setStartedTx.wait();

    // Mint all mice (had to change totalCount to 30)
    for (let i = 0; i < 30; i++) {
      await mice.mintMice(1, { value: ethers.utils.parseEther(".02")});
    }

    // Can only increase total supply after initial mice are all minted
    await mice.increaseTotalSupply(8000);

    expect(await mice.totalSupply()).to.equal(8000);
  });
});

describe("DystoMice Test Mint With Token", function () {
 
  it("Should mint a mouse with token", async function () {
  
    await mice.setStart(true);

    // Mint all mice (had to change totalCount to 30)
    for (let i = 0; i < 30; i++) {
      await mice.mintMice(1, { value: ethers.utils.parseEther(".02")});
    }

    // Can only increase total supply after initial mice are all minted
    await mice.increaseTotalSupply(8000);
  
    // Mintable for 5,000 DysToken once original mice have all been minted
    await mice.mintMiceWithToken(ethers.utils.parseEther('5000.0'), { value: ethers.utils.parseEther("5000.0")});

    expect(await mice.totalMiceMinted()).to.equal(1);
  });
});
  
describe("DystoMice Test Mint Total Supply Updated", function () {

  it("Should mint a mouse", async function () {

    await mice.setStart(true);

    // Owner
    await mice.mintMice(1, { value: ethers.utils.parseEther("0.02")}); // msg.value = 0.02 eth

    expect(await mice.totalMiceMinted()).to.equal(1);
  });
});

describe("DystoMice Test Mint Started Non-Owner Not Allowed", function () {

  it("Should fail with non-owner", async function () {

    // Non-Owner   
    await expect(mice.connect(addr1).setStart(true)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});

describe("DystoMice Test Incorrect Mint Amount", function () {

  it("Should fail with value error", async function () {
    await mice.setStart(true);

    // Incorrect mint amount - even setting a higher ether amount will fail
    await expect(mice.mintMice(1, { value: ethers.utils.parseEther("0.05")})).to.be.revertedWith('value error');
  });
});