import { uploadAvatarToCloudinary } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

type UseAvatarUploadReturn = {
  pickAndUploadAvatar: () => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
};

export const useAvatarUpload = (): UseAvatarUploadReturn => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("No authenticated user found");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(`Failed to update avatar: ${updateError.message}`);
      }

      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["handyman-profile"] });
    },
  });

  const pickAndUploadAvatar = async (): Promise<string | null> => {
    try {
      setError(null);

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photo library to upload an avatar."
        );
        return null;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const asset = result.assets[0];
      setIsUploading(true);

      // Upload to Cloudinary
      const uploaded = await uploadAvatarToCloudinary({
        uri: asset.uri,
        name: `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      });

      // Update profile in database
      await updateAvatarMutation.mutateAsync(uploaded.url);

      return uploaded.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload avatar";
      setError(message);
      Alert.alert("Upload Failed", message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    pickAndUploadAvatar,
    isUploading,
    error,
  };
};
