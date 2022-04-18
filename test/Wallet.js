const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const Wallet = artifacts.require('Wallet');     

contract('Wallet', (accounts) => {
    let wallet;
    beforeEach(async () => {
        wallet = await Wallet.new([accounts[0], accounts[1], accounts[2] ] , 2 );
        web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 1000
        });
    });

    //first test for approvers and quorum
    it('should have correct approvers and quorum' , async() => {
        const approvers = await wallet.getApprovers();
        const quorum = await wallet.quorum();
        assert(approvers.length === 3);
        assert(approvers[0] === accounts[0]);
        assert(approvers[1] === accounts[1]);
        assert(approvers[2] === accounts[2]);
        assert(quorum.toNumber() === 2);
    });

    //test for createTransfer //happy path
    it('should create transfer', async() => {
        await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
        const transfers = await wallet.getTransfers();
        assert(transfers.length === 1);
        assert(transfers[0].id === '0');
        assert(transfers[0].amount === '100');
        assert(transfers[0].to === accounts[5]);
        assert(transfers[0].approvals === '0');
        assert(transfers[0].sent === false);
    });


    it('should not create tranfers if sender is not approved', async() => {
        try{
            await wallet.createTransfer(100, accounts[5], {from: accounts[4]});

        }catch(e) {
            console.log(e);
        }
        });

        it('should increments approvals', async() => {
            await wallet.createTransfer(100, accounts[5], {from: accounts[0]});
            await wallet.approveTransfer(0, {from: accounts[0]});
            const transfers =await wallet.getTransfers();
            const balance = await web3.eth.getBalance(wallet.address);
            assert(transfers[0].approvals === '1');
            assert(transfers[0].sent === false);
            assert(balance === '1000')       
        });
    
});