import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  bathe,
  feed,
  giveWater,
  goPotty,
  petDog,
  play,
  rest,
  selectDog,
  selectDogMoodlets,
  selectDogStats,
  trainObedience,
} from "@/redux/dogSlice.js";
import StatBar from "@native/components/StatBar.js";
import useDogSession from "@native/hooks/useDogSession.js";

const DOG_IMAGE = require("../../public/assets/sprites/jr/puppy-looking.png");

const clamp = (value, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number(value) || 0));

const actionButtons = [
  { label: "Feed", action: feed },
  { label: "Water", action: giveWater },
  { label: "Play", action: play },
  { label: "Pet", action: petDog },
  { label: "Rest", action: rest },
  { label: "Bathe", action: bathe },
  { label: "Potty", action: goPotty },
];

function ActionButton({ label, onPress }) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

export default function DoggerzNativeScreen() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const stats = useSelector(selectDogStats);
  const moodlets = useSelector(selectDogMoodlets);
  const { isBootstrapped } = useDogSession();

  const bars = [
    {
      label: "Food",
      value: 1 - clamp(stats?.hunger) / 100,
      color: "#84cc16",
    },
    {
      label: "Water",
      value: 1 - clamp(stats?.thirst) / 100,
      color: "#2dd4bf",
    },
    {
      label: "Energy",
      value: clamp(stats?.energy) / 100,
      color: "#22d3ee",
    },
    {
      label: "Happiness",
      value: clamp(stats?.happiness) / 100,
      color: "#facc15",
    },
    {
      label: "Health",
      value: clamp(stats?.health) / 100,
      color: "#f97316",
    },
  ];

  const moodSummary =
    moodlets?.length > 0
      ? moodlets
          .slice(0, 3)
          .map((item) => String(item?.type || "").trim())
          .filter(Boolean)
          .join(" • ")
      : "content";

  if (!isBootstrapped) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Loading Doggerz native state...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <Text style={styles.eyebrow}>Doggerz Native</Text>
      <Text style={styles.title}>{dog?.name || "Pup"}</Text>
      <Text style={styles.subtitle}>
        Level {dog?.level || 1} • {dog?.lifeStage?.label || "Puppy"} • Mood:{" "}
        {moodSummary}
      </Text>

      <View style={styles.heroCard}>
        <Image
          source={DOG_IMAGE}
          style={styles.dogImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Needs</Text>
        {bars.map((bar) => (
          <StatBar
            key={bar.label}
            label={bar.label}
            value={bar.value}
            color={bar.color}
          />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions</Text>
        <View style={styles.actionGrid}>
          {actionButtons.map((item) => (
            <ActionButton
              key={item.label}
              label={item.label}
              onPress={() => dispatch(item.action())}
            />
          ))}
          <ActionButton
            label="Train Sit"
            onPress={() =>
              dispatch(
                trainObedience({
                  commandId: "sit",
                  input: "button",
                  now: Date.now(),
                })
              )
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    backgroundColor: "#050a11",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 10,
  },
  page: {
    backgroundColor: "#050a11",
    flex: 1,
  },
  pageContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  eyebrow: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "800",
  },
  subtitle: {
    color: "#9caec2",
    fontSize: 14,
    marginTop: 6,
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: "#0f1726",
    borderColor: "#1e293b",
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  dogImage: {
    height: 190,
    width: "100%",
  },
  card: {
    backgroundColor: "#0f1726",
    borderColor: "#1e293b",
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  cardTitle: {
    color: "#dbeafe",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  actionBtn: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    margin: 4,
    minWidth: 90,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionBtnText: {
    color: "#eff6ff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
