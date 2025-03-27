import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View>
      <Link href={"/notifications"}>Visit Notifications Screen</Link>
    </View>
  );
}
