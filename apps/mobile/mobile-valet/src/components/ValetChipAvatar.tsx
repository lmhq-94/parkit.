import { View, Text, Image } from "react-native";
import { valetAvatarColors, valetInitials } from "@/lib/valetAvatar";

interface ValetChipAvatarProps {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isDark: boolean;
  size?: number;
}

export function ValetChipAvatar({
  id,
  firstName,
  lastName,
  avatarUrl,
  isDark,
  size = 22,
}: ValetChipAvatarProps) {
  const av = valetAvatarColors(id, isDark);
  const initials = valetInitials(firstName, lastName);
  const src = avatarUrl?.trim() || "";
  const halfSize = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: halfSize,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        overflow: "hidden",
        backgroundColor: av.bg,
        borderColor: av.border,
      }}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: "100%", height: "100%", borderRadius: halfSize }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: size * 0.45, fontWeight: "800", letterSpacing: -0.2, color: av.fg }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
