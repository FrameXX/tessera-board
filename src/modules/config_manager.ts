import UserData from "./user_data/user_data";
import type ConfigInventory from "./config_inventory";
import type ToastManager from "./toast_manager";
import { getRandomId } from "./utils/misc";
import { CommonConfigPrint } from "./config_inventory";

class ConfigManager {
  constructor(
    private readonly inventory: ConfigInventory,
    private readonly entries: UserData<any>[],
    private readonly toastManager: ToastManager
  ) {}

  private handleErrorOnRestore() {
    this.toastManager.showToast(
      "An error occured while trying to load and apply configuration. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error",
      "database-alert"
    );
  }

  public restoreConfig(configPrint: CommonConfigPrint) {
    const configValues = this.inventory.loadConfigValues(configPrint);
    if (!configValues) {
      console.error(
        `Config of id ${configPrint.id} of inventory ${this.inventory.id} failed to load. Alerting user.`
      );
      this.handleErrorOnRestore();
      return;
    }
    if (configValues.length !== this.entries.length) {
      console.error(
        "Length of config values array does not match length of entries array. The data does not seem to be compatible. Alerting user."
      );
      this.handleErrorOnRestore();
      return;
    }
    try {
      for (const index in configValues) {
        this.entries[index].load(configValues[index]);
      }
    } catch (error) {
      console.error(
        `An error occured while trying to apply a config of id ${configPrint.id} from inventory ${this.inventory.id}. The data is corrupt, invalid or the config is incompaible with the entries. Alerting user.`,
        error
      );
    }
  }

  // If id equal to some of the already defiend config ids is passed, the method can also be used to overwrite values of already saved configs
  saveConfig(writeId?: string) {
    if (!writeId) {
      writeId = getRandomId();
    }

    const name = "test";

    let values: string[] = [];
    for (const entry of this.entries) {
      values.push(entry.dump());
    }

    this.inventory.saveConfig({ id: writeId, name, values });
  }
}

export default ConfigManager;

export const DEFAULT_BOARD_PREDEFINED_CONFIG_DEFAULT =
  '[[{"color":"white","pieceId":"rook","id":"xihytuwe"},{"color":"white","pieceId":"knight","id":"cezyqotu"},{"color":"white","pieceId":"bishop","id":"ofexurub"},{"color":"white","pieceId":"queen","id":"rogabafo"},{"color":"white","pieceId":"king","id":"ufesymak"},{"color":"white","pieceId":"bishop","id":"wygibosy"},{"color":"white","pieceId":"knight","id":"maqakeri"},{"color":"white","pieceId":"rook","id":"olylysed"}],[{"color":"white","pieceId":"pawn","id":"ugifysaq"},{"color":"white","pieceId":"pawn","id":"cofapesy"},{"color":"white","pieceId":"pawn","id":"haqynasu"},{"color":"white","pieceId":"pawn","id":"tihumuga"},{"color":"white","pieceId":"pawn","id":"lyzemeje"},{"color":"white","pieceId":"pawn","id":"febarigo"},{"color":"white","pieceId":"pawn","id":"ejurebej"},{"color":"white","pieceId":"pawn","id":"kumogamy"}],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"color":"black","pieceId":"pawn","id":"ajiguvoh"},{"color":"black","pieceId":"pawn","id":"ehucorol"},{"color":"black","pieceId":"pawn","id":"sitifubu"},{"color":"black","pieceId":"pawn","id":"dybaquma"},{"color":"black","pieceId":"pawn","id":"eriwurot"},{"color":"black","pieceId":"pawn","id":"zewadifo"},{"color":"black","pieceId":"pawn","id":"zejoxofe"},{"color":"black","pieceId":"pawn","id":"luhaloti"}],[{"color":"black","pieceId":"rook","id":"abosutur"},{"color":"black","pieceId":"knight","id":"mosefebo"},{"color":"black","pieceId":"bishop","id":"okuruwox"},{"color":"black","pieceId":"queen","id":"bocafyfa"},{"color":"black","pieceId":"king","id":"iqinuryv"},{"color":"black","pieceId":"bishop","id":"cafejuju"},{"color":"black","pieceId":"knight","id":"emicuzud"},{"color":"black","pieceId":"rook","id":"otihukud"}]]';
