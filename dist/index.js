#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const tatum_1 = require("@tatumio/tatum");
const axios_1 = __importDefault(require("axios"));
const management_1 = require("./management");
const signatures_1 = require("./signatures");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const meow_1 = __importDefault(require("meow"));
const config_1 = require("./config");
var config = new config_1.Config();
const axiosInstance = axios_1.default.create({
    httpAgent: new http_1.default.Agent({ keepAlive: true }),
    httpsAgent: new https_1.default.Agent({ keepAlive: true })
});
const { input: command, flags } = meow_1.default(`
    Usage
        $ tatum-kms command

    Commands
        daemon                            Run as a daemon, which periodically checks for a new transactions to sign.
        generatewallet <chain>            Generate wallet for a specific blockchain and echo it to the output.
        generatemanagedwallet <chain>     Generate wallet for a specific blockchain and add it to the managed wallets.
        storemanagedwallet <chain>        Store mnemonic-based wallet for a specific blockchain and add it to the managed wallets.
        storemanagedprivatekey <chain>    Store private key of a specific blockchain and add it to the managed wallets.
        getprivatekey <signatureId> <i>   Obtain managed wallet from wallet store and generate private key for given derivation index.
        getaddress <signatureId> <i>      Obtain managed wallet from wallet store and generate address for given derivation index.
        getmanagedwallet <signatureId>    Obtain managed wallet / private key from wallet store.
        removewallet <signatureId>        Remove managed wallet from wallet store.
        export                            Export all managed wallets.

    Options
        --api-key                         Tatum API Key to communicate with Tatum API. Daemon mode only.
        --testnet                         Indicates testnet version of blockchain. Mainnet by default.
        --path                            Custom path to wallet store file.
        --period                          Period in seconds to check for new transactions to sign, defaults to 5 seconds. Daemon mode only.
        --chain                           Blockchains to check, separated by comma. Daemon mode only.
	    --vgs                             Using VGS (https://verygoodsecurity.com) as a secure storage of the password which unlocks the wallet file.
	    --azure                           Using Azure Vault (https://azure.microsoft.com/en-us/services/key-vault/) as a secure storage of the password which unlocks the wallet file.
        --externalUrl                     Pass in external url to check valid transaction. This parameter is mandatory for mainnet (if testnet is false).  Daemon mode only.
`, {
    flags: {
        path: {
            type: 'string',
        },
        chain: {
            type: 'string',
        },
        'api-key': {
            type: 'string',
        },
        testnet: {
            type: 'boolean',
            isRequired: true,
        },
        vgs: {
            type: 'boolean',
        },
        azure: {
            type: 'boolean',
        },
        period: {
            type: 'number',
            default: 5,
        },
        externalUrl: {
            type: 'string',
            isRequired: (flags, input) => input[0] === 'daemon' && !flags.testnet
        }
    }
});
const getPwd = async (source) => {
    if (source == 'AZURE') {
        const vaultUrl = config.getValue(config_1.ConfigOption.AZURE_VAULTURL);
        const secretName = config.getValue(config_1.ConfigOption.AZURE_SECRETNAME);
        const secretVersion = config.getValue(config_1.ConfigOption.AZURE_SECRETVERSION);
        const pwd = (await axiosInstance.get(`https://${vaultUrl}/secrets/${secretName}/${secretVersion}?api-version=7.1`)).data?.data[0]?.value;
        if (!pwd) {
            console.error('Azure Vault secret does not exists.');
            process.exit(-1);
            return;
        }
        return pwd;
    }
    else if (source == 'VGS') {
        const username = config.getValue(config_1.ConfigOption.VGS_USERNAME);
        const password = config.getValue(config_1.ConfigOption.VGS_PASSWORD);
        const alias = config.getValue(config_1.ConfigOption.VGS_ALIAS);
        const pwd = (await axiosInstance.get(`https://api.live.verygoodvault.com/aliases/${alias}`, {
            auth: {
                username,
                password,
            }
        })).data?.data[0]?.value;
        if (!pwd) {
            console.error('VGS Vault alias does not exists.');
            process.exit(-1);
            return;
        }
        return pwd;
    }
    else {
        return config.getValue(config_1.ConfigOption.KMS_PASSWORD);
    }
};
const startup = async () => {
    if (command.length === 0) {
        return;
    }
    const getPwdSource = () => {
        if (flags.azure) {
            return 'AZURE';
        }
        if (flags.vgs) {
            return 'VGS';
        }
        return 'PWD';
    };
    switch (command[0]) {
        case 'daemon':
            const daemonPwd = await getPwd(getPwdSource());
            management_1.getTatumKey(flags.apiKey);
            await signatures_1.processSignaturesAsDaemon(daemonPwd, flags.testnet, flags.period, axiosInstance, flags.path, flags.chain?.split(','), flags.externalUrl);
            break;
        case 'processsignatures':
            const adHockPwd = await getPwd(getPwdSource());
            await signatures_1.processSignatures(adHockPwd, flags.testnet, axiosInstance, flags.path, flags.chain?.split(','), flags.externalUrl);
            break;
        case 'generatewallet':
            console.log(JSON.stringify(await tatum_1.generateWallet(command[1], flags.testnet), null, 2));
            break;
        case 'export':
            management_1.exportWallets(flags.path);
            break;
        case 'generatemanagedwallet':
            await management_1.storeWallet(command[1], flags.testnet, flags.path);
            break;
        case 'storemanagedwallet':
            await management_1.storeWallet(command[1], flags.testnet, flags.path, management_1.getQuestion('Enter mnemonic to store:'));
            break;
        case 'storemanagedprivatekey':
            await management_1.storePrivateKey(command[1], flags.testnet, management_1.getQuestion('Enter private key to store:'), flags.path);
            break;
        case 'getmanagedwallet':
            await management_1.getWallet(command[1], flags.path);
            break;
        case 'getprivatekey':
            await management_1.getPrivateKey(command[1], command[2], flags.path);
            break;
        case 'getaddress':
            await management_1.getAddress(command[1], command[2], flags.path);
            break;
        case 'removewallet':
            await management_1.removeWallet(command[1], flags.path);
            break;
        default:
            console.error('Unsupported command. Use tatum-kms --help for details.');
            process.exit(-1);
    }
};
startup();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0Esb0RBQTRCO0FBQzVCLGdCQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDaEIsMENBQTBEO0FBQzFELGtEQUEwQjtBQUMxQiw2Q0FVc0I7QUFDdEIsNkNBQTRFO0FBQzVFLGdEQUF3QjtBQUN4QixrREFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLHFDQUErQztBQUMvQyxJQUFJLE1BQU0sR0FBRyxJQUFJLGVBQU0sRUFBRSxDQUFBO0FBRXpCLE1BQU0sYUFBYSxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7SUFDL0IsU0FBUyxFQUFFLElBQUksY0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUM5QyxVQUFVLEVBQUUsSUFBSSxlQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO0NBQ25ELENBQUMsQ0FBQztBQUVILE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLGNBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlCdEMsRUFBRTtJQUNDLEtBQUssRUFBRTtRQUNILElBQUksRUFBRTtZQUNGLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxTQUFTLEVBQUU7WUFDUCxJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELE9BQU8sRUFBRTtZQUNMLElBQUksRUFBRSxTQUFTO1lBQ2YsVUFBVSxFQUFFLElBQUk7U0FDbkI7UUFDRCxHQUFHLEVBQUU7WUFDRCxJQUFJLEVBQUUsU0FBUztTQUNsQjtRQUNELEtBQUssRUFBRTtZQUNILElBQUksRUFBRSxTQUFTO1NBQ2xCO1FBQ0QsTUFBTSxFQUFFO1lBQ0osSUFBSSxFQUFF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