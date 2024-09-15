import { NativeModules } from "react-native";

/**
 * Reloads the app by triggering a hot reload.
 */
export const useReloadApp = () => {
  const reloadApp = () => {
    if (NativeModules.DevSettings) {
      NativeModules.DevSettings.reload();
    }
  };

  return { reloadApp };
};
