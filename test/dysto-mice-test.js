const { expect } = require("chai");
const { ethers } = require("hardhat");
let DysToken;
let DystoMice;
let accounts;
let owner;
let dys;
let mice;

 beforeEach(async function () {
   
    DysToken = await ethers.getContractFactory("DysToken");
    dys = await DysToken.deploy();

    // Get the ContractFactory and Signers here.
    DystoMice = await ethers.getContractFactory("DystoMice");

    accounts = await ethers.getSigners();
    owner = accounts[0].address;
    nonOwner = accounts[1].address;

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been mined.
    mice = await DystoMice.deploy(
      "DystoMice", 
      "DYSTOMICE", 
      "ipfs://QmXHaUaMwr7hPsKZvLkZhKznvjqx1pZphAEo85BzzgyWPs/", 
      dys.address);
});

describe("DystoMice Test Initial Total Supply", function () {
 
  it("should return mice total supply", async function () {
    
    expect(await mice.totalSupply()).to.equal(30);
  });
});

describe("DystoMice Test Increase Total Supply", function () {
 
  it("should increase total supply", async function () {
  
    await mice.setStart(true);

    // Mint all mice (had to change totalCount to 30)
    for (let i = 0; i < 30; i++) {
      await mice.mintMice(1, { value: ethers.utils.parseEther(".02")});
    }
    
    // Can only increase total supply after initial mice are all minted
    await mice.increaseTotalSupply(8000);

    expect(await mice.connect(nonOwner).totalSupply()).to.equal(8000);
  });
});

describe("DystoMice Test Mint With Token", function () {
 
  it("should mint a mouse with token", async function () {
  
    await dys.mint(owner);

    console.log("DysToken owned by owner: ", await dys.balanceOf(owner));

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

  it("should mint a mouse", async function () {

    await mice.setStart(true);

    // Owner
    await mice.mintMice(1, { value: ethers.utils.parseEther("0.02")}); // msg.value = 0.02 eth

    expect(await mice.totalMiceMinted()).to.equal(1);
  });
});

describe("DystoMice Test Mint Started Non-Owner Not Allowed", function () {

  it("should fail with non-owner", async function () {

    // Non-Owner   
    await expect(mice.connect(accounts[1]).setStart(true)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});

describe("DystoMice Test Incorrect Mint Amount", function () {

  it("should fail with value error", async function () {
    await mice.setStart(true);

    // Incorrect mint amount - even setting a higher ether amount will fail
    await expect(mice.mintMice(1, { value: ethers.utils.parseEther("0.05")})).to.be.revertedWith('value error');
  });
});