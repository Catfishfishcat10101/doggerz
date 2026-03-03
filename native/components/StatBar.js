import { StyleSheet, Text, View } from "react-native";

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

export default function StatBar({ label, value, color }) {
  const widthPct = `${Math.round(clamp01(value) * 100)}%`;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{widthPct}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: widthPct, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    color: "#d7e5f8",
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: "#93acc4",
    fontSize: 12,
    fontWeight: "700",
  },
  track: {
    backgroundColor: "#1a2433",
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 999,
    height: 8,
  },
});
