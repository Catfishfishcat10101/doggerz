import { Provider } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import store from "@native/store/index.js";
import DoggerzNativeScreen from "@native/screens/DoggerzNativeScreen.js";

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <DoggerzNativeScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}
