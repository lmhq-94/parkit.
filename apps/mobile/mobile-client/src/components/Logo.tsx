import { Text, View, StyleSheet, useColorScheme } from "react-native";

export function Logo({ size = 42, style }: { size?: number; style?: any }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize: size, color: isDark ? "#FFFFFF" : "#0F172A" }]}>park</Text>
      <Text style={[styles.text, { fontSize: size, color: isDark ? "#3B82F6" : "#2563EB" }]}>it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: "CalSans",
    letterSpacing: -1.5,
  },
});
