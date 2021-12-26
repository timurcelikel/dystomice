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

    owner = accounts[0];
    tokenContractOwner = accounts[1];
    nonOwner = accounts[2];


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
  
    // List all account addresses
    //accounts.forEach(element => console.log(element.address));

    await dys.mint(mice.address); // Mints 10000000000000000000000 or 10,000 DysToken
    await dys.mint(owner.address); // Mints 10000000000000000000000 or 10,000 DysToken
    await dys.mint(nonOwner.address); // Mints 10000000000000000000000 or 10,000 DysToken
    await dys.mint(dys.address); // Mints 10000000000000000000000 or 10,000 DysToken

    console.log("Contract owner address:", mice.address);
    console.log("Token contract owner address:", dys.address);
    console.log("Owner address:", owner.address);
    console.log("non-owner address:", nonOwner.address);

    console.log("DysToken owned by contract owner: ", await dys.balanceOf(mice.address));
    console.log("DysToken owned by token contract: ", await dys.balanceOf(dys.address));
    console.log("DysToken owned by owner: ", await dys.balanceOf(owner.address));
    console.log("DysToken owned by non-owner: ", await dys.balanceOf(nonOwner.address));
    await mice.setStart(true);

    // Mint all mice (had to change totalCount to 30)
    for (let i = 0; i < 30; i++) {
      await mice.mintMice(1, { value: ethers.utils.parseEther(".02")});
    }

    // Can only increase total supply after initial mice are all minted
    await mice.increaseTotalSupply(8000);

    // Mintable for 5,000 DysToken once original mice have all been minted
    dys.approve(dys.address, "5000000000000000000000");
    dys.connect(nonOwner).approve(dys.address, "5000000000000000000000");

    //await mice.mintMiceWithToken("5000000000000000000000", { value: "5000000000000000000000"}); // 5,000 DysToken
    await mice.connect(nonOwner).mintMiceWithToken("5000000000000000000000", { value: "5000000000000000000000"}); // 5,000 DysToken
    //await mice.connect(nonOwner).mintMiceWithToken("5000000000000000000000"); // 5,000 DysToken

    expect(await mice.totalMiceMinted()).to.equal(31);
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
    await expect(mice.connect(nonOwner).setStart(true)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});

describe("DystoMice Test Incorrect Mint Amount", function () {

  it("should fail with value error", async function () {
    await mice.setStart(true);

    // Incorrect mint amount - even setting a higher ether amount will fail
    await expect(mice.mintMice(1, { value: ethers.utils.parseEther("0.05")})).to.be.revertedWith('value error');
  });
});