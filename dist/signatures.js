"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSignatures = exports.processSignaturesAsDaemon = void 0;
const tatum_1 = require("@tatumio/tatum");
const tatum_kcs_1 = require("@tatumio/tatum-kcs");
const tatum_solana_1 = require("@tatumio/tatum-solana");
const terra_1 = require("@tatumio/terra");
const management_1 = require("./management");
const processTransaction = async (transaction, testnet, pwd, axios, path, externalUrl) => {
    if (externalUrl) {
        console.log(`${new Date().toISOString()} - External url '${externalUrl}' is present, checking against it.`);
        try {
            await axios.get(`${externalUrl}/${transaction.id}`);
        }
        catch (e) {
            console.error(e);
            console.error(`${new Date().toISOString()} - Transaction not found on external system. ID: ${transaction.id}`);
            return;
        }
    }
    const wallets = [];
    for (const hash of transaction.hashes) {
        wallets.push(await management_1.getWallet(hash, path, pwd, false));
    }
    let txData = '';
    console.log(`${new Date().toISOString()} - Processing pending transaction - ${JSON.stringify(transaction, null, 2)}.`);
    switch (transaction.chain) {
        case tatum_1.Currency.ALGO:
            const algoSecret = wallets[0].secret ? wallets[0].secret : wallets[0].privateKey;
            await tatum_1.algorandBroadcast((await tatum_1.signAlgoKMSTransaction(transaction, algoSecret, testnet))?.txId, transaction.id);
            return;
        case tatum_1.Currency.SOL:
            await tatum_solana_1.broadcast(await tatum_solana_1.signKMSTransaction(transaction, wallets[0].privateKey), transaction.id);
            return;
        case tatum_1.Currency.BCH:
            if (transaction.withdrawalId) {
                txData = await tatum_1.signBitcoinCashOffchainKMSTransaction(transaction, wallets[0].mnemonic, testnet);
            }
            else {
                await tatum_1.bcashBroadcast(await tatum_1.signBitcoinCashKMSTransaction(transaction, wallets.map((w) => w.privateKey), testnet), transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.BNB:
            await tatum_1.bnbBroadcast(await tatum_1.signBnbKMSTransaction(transaction, wallets[0].privateKey, testnet), transaction.id);
            return;
        case tatum_1.Currency.LUNA:
            const sdk = terra_1.TatumTerraSDK({ apiKey: process.env.TATUM_API_KEY });
            await sdk.blockchain.broadcast({
                txData: await sdk.kms.sign(transaction, wallets[0].privateKey, testnet),
                signatureId: transaction.id
            });
            return;
        case tatum_1.Currency.VET:
            const pk = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.BNB, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_1.vetBroadcast(await tatum_1.signVetKMSTransaction(transaction, pk, testnet), transaction.id);
            return;
        case tatum_1.Currency.XRP:
            if (transaction.withdrawalId) {
                txData = await tatum_1.signXrpOffchainKMSTransaction(transaction, wallets[0].secret);
            }
            else {
                await tatum_1.xrpBroadcast(await tatum_1.signXrpKMSTransaction(transaction, wallets[0].secret), transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.XLM:
            if (transaction.withdrawalId) {
                txData = await tatum_1.signXlmOffchainKMSTransaction(transaction, wallets[0].secret, testnet);
            }
            else {
                await tatum_1.xlmBroadcast(await tatum_1.signXlmKMSTransaction(transaction, wallets[0].secret, testnet), transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.ETH:
            const privateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.ETH, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            if (transaction.withdrawalId) {
                txData = await tatum_1.signEthOffchainKMSTransaction(transaction, privateKey, testnet);
            }
            else {
                await tatum_1.ethBroadcast(await tatum_1.signEthKMSTransaction(transaction, privateKey), transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.FLOW:
            const secret = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.FLOW, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            const u = transaction.serializedTransaction;
            const r = JSON.parse(u);
            r.body.privateKey = secret;
            transaction.serializedTransaction = JSON.stringify(r);
            await tatum_1.flowBroadcastTx((await tatum_1.flowSignKMSTransaction(transaction, [secret], testnet))?.txId, transaction.id);
            return;
        case tatum_1.Currency.ONE:
            const onePrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.ONE, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            txData = await tatum_1.signOneKMSTransaction(transaction, onePrivateKey, testnet);
            if (!transaction.withdrawalId) {
                await tatum_1.oneBroadcast(txData, transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.CELO:
            const celoPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.CELO, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_1.celoBroadcast(await tatum_1.signCeloKMSTransaction(transaction, celoPrivateKey, testnet), transaction.id);
            return;
        case tatum_1.Currency.BSC:
            const bscPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.BSC, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_1.bscBroadcast(await tatum_1.signBscKMSTransaction(transaction, bscPrivateKey), transaction.id);
            return;
        case tatum_1.Currency.MATIC:
            const polygonPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.MATIC, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_1.polygonBroadcast(await tatum_1.signPolygonKMSTransaction(transaction, polygonPrivateKey, testnet), transaction.id);
            return;
        case tatum_1.Currency.KLAY:
            const klaytnPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.KLAY, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_1.klaytnBroadcast(await tatum_1.signKlayKMSTransaction(transaction, klaytnPrivateKey, testnet), transaction.id);
            return;
        case tatum_1.Currency.KCS:
            const kcsPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_kcs_1.generatePrivateKeyFromMnemonic(wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_kcs_1.broadcast(await tatum_kcs_1.signKMSTransaction(transaction, kcsPrivateKey), transaction.id);
            return;
        case tatum_1.Currency.XDC:
            const xdcPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.XDC, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_1.xdcBroadcast(await tatum_1.signXdcKMSTransaction(transaction, xdcPrivateKey), transaction.id);
            return;
        case tatum_1.Currency.EGLD:
            const egldPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.EGLD, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            await tatum_1.egldBroadcast(await tatum_1.signEgldKMSTransaction(transaction, egldPrivateKey), transaction.id);
            return;
        case tatum_1.Currency.TRON:
            const fromPrivateKey = wallets[0].mnemonic && transaction.index !== undefined
                ? await tatum_1.generatePrivateKeyFromMnemonic(tatum_1.Currency.TRON, wallets[0].testnet, wallets[0].mnemonic, transaction.index)
                : wallets[0].privateKey;
            txData = await tatum_1.signTronKMSTransaction(transaction, fromPrivateKey, testnet);
            if (!transaction.withdrawalId) {
                await tatum_1.tronBroadcast(txData, transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.BTC:
            if (transaction.withdrawalId) {
                txData = await tatum_1.signBitcoinOffchainKMSTransaction(transaction, wallets[0].mnemonic, testnet);
            }
            else {
                await tatum_1.btcBroadcast(await tatum_1.signBitcoinKMSTransaction(transaction, wallets.map((w) => w.privateKey)), transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.LTC:
            if (transaction.withdrawalId) {
                txData = await tatum_1.signLitecoinOffchainKMSTransaction(transaction, wallets[0].mnemonic, testnet);
            }
            else {
                await tatum_1.ltcBroadcast(await tatum_1.signLitecoinKMSTransaction(transaction, wallets.map((w) => w.privateKey), testnet), transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.DOGE:
            if (transaction.withdrawalId) {
                txData = await tatum_1.signDogecoinOffchainKMSTransaction(transaction, wallets[0].mnemonic, testnet);
            }
            else {
                await tatum_1.dogeBroadcast(await tatum_1.signDogecoinKMSTransaction(transaction, wallets.map((w) => w.privateKey), testnet), transaction.id);
                return;
            }
            break;
        case tatum_1.Currency.ADA:
            if (transaction.withdrawalId) {
                txData = await tatum_1.signAdaOffchainKMSTransaction(transaction, wallets[0].mnemonic, testnet);
            }
            else {
                await tatum_1.adaBroadcast(await tatum_1.signAdaKMSTransaction(transaction, wallets.map((w) => w.privateKey)), transaction.id);
                return;
            }
    }
    await tatum_1.offchainBroadcast({
        currency: transaction.chain,
        signatureId: transaction.id,
        withdrawalId: transaction.withdrawalId,
        txData,
    });
};
exports.processSignaturesAsDaemon = (pwd, testnet, period = 5, axios, path, chains, externalUrl) => {
    return new Promise(function () {
        let running = false;
        setInterval(async () => {
            if (running) {
                return;
            }
            running = true;
            await exports.processSignatures(pwd, testnet, axios, path, chains, externalUrl);
            running = false;
        }, period * 1000);
    });
};
exports.processSignatures = async (pwd, testnet, axios, path, chains, externalUrl) => {
    const supportedChains = chains || [
        tatum_1.Currency.BCH,
        tatum_1.Currency.VET,
        tatum_1.Currency.XRP,
        tatum_1.Currency.XLM,
        tatum_1.Currency.ETH,
        tatum_1.Currency.BTC,
        tatum_1.Currency.MATIC,
        tatum_1.Currency.KLAY,
        tatum_1.Currency.LTC,
        tatum_1.Currency.DOGE,
        tatum_1.Currency.CELO,
        tatum_1.Currency.BSC,
        tatum_1.Currency.SOL,
        tatum_1.Currency.TRON,
        tatum_1.Currency.BNB,
        tatum_1.Currency.LUNA,
        tatum_1.Currency.FLOW,
        tatum_1.Currency.XDC,
        tatum_1.Currency.EGLD,
        tatum_1.Currency.ONE,
        tatum_1.Currency.ADA,
        tatum_1.Currency.ALGO,
        tatum_1.Currency.KCS,
    ];
    const transactions = [];
    for (const supportedChain of supportedChains) {
        try {
            const wallets = management_1.getManagedWallets(pwd, supportedChain, testnet, path).join(',');
            console.log(`${new Date().toISOString()} - Getting pending transaction from ${supportedChain} for wallets ${wallets}.`);
            transactions.push(...(await tatum_1.getPendingTransactionsKMSByChain(supportedChain, wallets)));
        }
        catch (e) {
            console.error(e);
        }
    }
    const data = [];
    for (const transaction of transactions) {
        try {
            await processTransaction(transaction, testnet, pwd, axios, path, externalUrl);
        }
        catch (e) {
            const msg = e.response
                ? JSON.stringify(e.response.data, null, 2)
                : `${e}`;
            data.push({ signatureId: transaction.id, error: msg });
            console.error(`${new Date().toISOString()} - Could not process transaction id ${transaction.id}, error: ${msg}`);
        }
    }
    if (data.length > 0) {
        try {
            const url = (process.env.TATUM_API_URL || 'https://api-eu1.tatum.io') +
                '/v3/tatum/kms/batch';
            await axios.post(url, { errors: data }, { headers: { 'x-api-key': process.env.TATUM_API_KEY } });
            console.log(`${new Date().toISOString()} - Send batch call to url '${url}'.`);
        }
        catch (e) {
            console.error(`${new Date().toISOString()} - Error received from API /v3/tatum/kms/batch - ${e.config.data}`);
        }
    }
    return {
        transactions
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmF0dXJlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zaWduYXR1cmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBDQW9Ed0I7QUFDeEIsa0RBQWdMO0FBQ2hMLHdEQUFxSDtBQUNySCwwQ0FBOEM7QUFFOUMsNkNBQTREO0FBRTVELE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUM1QixXQUEyQixFQUMzQixPQUFnQixFQUNoQixHQUFXLEVBQ1gsS0FBb0IsRUFDcEIsSUFBYSxFQUNiLFdBQW9CLEVBQ3RCLEVBQUU7SUFFQSxJQUFJLFdBQVcsRUFBRTtRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsV0FBVyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzVHLElBQUk7WUFDQSxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLG9EQUFvRCxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRyxPQUFNO1NBQ1Q7S0FDSjtJQUVELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7UUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLHNCQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN6RDtJQUNELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixPQUFPLENBQUMsR0FBRyxDQUNQLEdBQUcs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