"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.ConfigOption = void 0;
const readline_sync_1 = require("readline-sync");
var ConfigOption;
(function (ConfigOption) {
    ConfigOption[ConfigOption["KMS_PASSWORD"] = 1] = "KMS_PASSWORD";
    ConfigOption[ConfigOption["VGS_ALIAS"] = 2] = "VGS_ALIAS";
    ConfigOption[ConfigOption["TATUM_API_KEY"] = 3] = "TATUM_API_KEY";
    ConfigOption[ConfigOption["VGS_USERNAME"] = 4] = "VGS_USERNAME";
    ConfigOption[ConfigOption["VGS_PASSWORD"] = 5] = "VGS_PASSWORD";
    ConfigOption[ConfigOption["AZURE_SECRETVERSION"] = 6] = "AZURE_SECRETVERSION";
    ConfigOption[ConfigOption["AZURE_SECRETNAME"] = 7] = "AZURE_SECRETNAME";
    ConfigOption[ConfigOption["AZURE_VAULTURL"] = 8] = "AZURE_VAULTURL";
})(ConfigOption = exports.ConfigOption || (exports.ConfigOption = {}));
class Config {
    constructor() {
        this._configOptions = {
            [ConfigOption.KMS_PASSWORD]: {
                environmentKey: "TATUM_KMS_PASSWORD",
                question: "Enter password to access wallet store:"
            },
            [ConfigOption.VGS_ALIAS]: {
                environmentKey: "TATUM_KMS_VGS_ALIAS",
                question: "Enter alias to obtain from VGS Vault API:"
            },
            [ConfigOption.TATUM_API_KEY]: {
                environmentKey: "TATUM_KMS_TATUM_API_KEY",
                question: "Enter alias to obtain from VGS Vault API:"
            },
            [ConfigOption.VGS_USERNAME]: {
                environmentKey: "TATUM_KMS_VGS_USERNAME",
                question: "Enter username to VGS Vault API:"
            },
            [ConfigOption.VGS_PASSWORD]: {
                environmentKey: "TATUM_KMS_VGS_PASSWORD",
                question: "Enter password to VGS Vault API:"
            },
            [ConfigOption.AZURE_SECRETVERSION]: {
                environmentKey: "TATUM_KMS_VGS_ALIAS",
                question: "Enter Secret version to obtain secret from Azure Vault API:"
            },
            [ConfigOption.AZURE_SECRETNAME]: {
                environmentKey: "TATUM_KMS_AZURE_SECRETNAME",
                question: "Enter Secret name to obtain from Azure Vault API:"
            },
            [ConfigOption.AZURE_VAULTURL]: {
                environmentKey: "TATUM_KMS_AZURE_VAULTURL",
                question: "Enter Vault Base URL to obtain secret from Azure Vault API:"
            }
        };
    }
    getValue(what) {
        let config = this._configOptions[what];
        if (process.env[config.environmentKey]) {
            return process.env[config.environmentKey];
        }
        return readline_sync_1.question(config.question, {
            hideEchoBack: true,
        });
    }
}
exports.Config = Config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBd0M7QUFDeEMsSUFBWSxZQVNYO0FBVEQsV0FBWSxZQUFZO0lBQ3BCLCtEQUFnQixDQUFBO0lBQ2hCLHlEQUFTLENBQUE7SUFDVCxpRUFBYSxDQUFBO0lBQ2IsK0RBQVksQ0FBQTtJQUNaLCtEQUFZLENBQUE7SUFDWiw2RUFBbUIsQ0FBQTtJQUNuQix1RUFBZ0IsQ0FBQTtJQUNoQixtRUFBYyxDQUFBO0FBQ2xCLENBQUMsRUFUVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQVN2QjtBQUVELE1BQWEsTUFBTTtJQUFuQjtRQUNZLG1CQUFjLEdBQUc7WUFDckIsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3pCLGNBQWMsRUFBRSxvQkFBb0I7Z0JBQ3BDLFFBQVEsRUFBRSx3Q0FBd0M7YUFDckQ7WUFDRCxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdEIsY0FBYyxFQUFFLHFCQUFxQjtnQkFDckMsUUFBUSxFQUFFLDJDQUEyQzthQUN4RDtZQUNELENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUMxQixjQUFjLEVBQUUseUJBQXlCO2dCQUN6QyxRQUFRLEVBQUUsMkNBQTJDO2FBQ3hEO1lBQ0QsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3pCLGNBQWMsRUFBRSx3QkFBd0I7Z0JBQ3hDLFFBQVEsRUFBRSxrQ0FBa0M7YUFDL0M7WUFDRCxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDekIsY0FBYyxFQUFFLHdCQUF3QjtnQkFDeEMsUUFBUSxFQUFFLGtDQUFrQzthQUMvQztZQUNELENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLEVBQUU7Z0JBQ2hDLGNBQWMsRUFBRSxxQkFBcUI7Z0JBQ3JDLFFBQVEsRUFBRSw2REFBNkQ7YUFDMUU7WUFDRCxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUM3QixjQUFjLEVBQUUsNEJBQTRCO2dCQUM1QyxRQUFRLEVBQUUsbURBQW1EO2FBQ2hFO1lBQ0QsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQzNCLGNBQWMsRUFBRSwwQkFBMEI7Z0JBQzFDLFFBQVEsRUFBRSw2REFBNkQ7YUFDMUU7U0FDSixDQUFBO0lBV0wsQ0FBQztJQVRVLFFBQVEsQ0FBQyxJQUFrQjtRQUM5QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3RDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDcEMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQVcsQ0FBQTtTQUN0RDtRQUNELE9BQU8sd0JBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzdCLFlBQVksRUFBRSxJQUFJO1NBQ3JCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTdDRCx3QkE2Q0MifQ==