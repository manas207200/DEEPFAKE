import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export function Waveform({ active }: { active: boolean }) {
  const bars = useRef([0, 1, 2, 3, 4, 5, 6, 7].map(() => new Animated.Value(8))).current;

  useEffect(() => {
    if (!active) {
      bars.forEach((bar) => bar.setValue(8));
      return;
    }
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 8 + ((i * 11) % 28),
            duration: 280 + i * 40,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 8,
            duration: 280 + i * 40,
            useNativeDriver: false,
          }),
        ])
      )
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [active, bars]);

  return (
    <View className="h-12 flex-row items-end justify-center gap-1">
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{ height: bar, width: 6, borderRadius: 3, backgroundColor: "#34D399" }}
        />
      ))}
    </View>
  );
}

export function PulseDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={{
        opacity,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
      }}
    />
  );
}
