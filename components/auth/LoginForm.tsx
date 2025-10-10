import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function LoginForm() {
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const { data, error } = await signIn(email, password);

    if (data && !error) {
      router.replace("/(tabs)");
    }
  };
  return (
    <>
      <VStack space="lg" className="mb-6">
        {/* Email Input */}
        <VStack space="xs">
          <Text className="text-sm font-dmsans-medium text-gray-700 mb-1">Email</Text>
          <Input className="border border-gray-300 rounded-xl h-14">
            <InputField
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="font-dmsans"
            />
          </Input>
        </VStack>

        {/* Password Input */}
        <VStack space="xs">
          <Text className="text-sm font-dmsans-medium text-gray-700 mb-1">
            Password
          </Text>
          <Input className="border border-gray-300 rounded-xl h-14">
            <InputField
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="font-dmsans"
            />
            <InputSlot
              className="pr-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              <InputIcon
                as={showPassword ? EyeOff : Eye}
                className="text-gray-500"
              />
            </InputSlot>
          </Input>
        </VStack>
      </VStack>

      {/* Sign In Button */}
      <Button
        size="lg"
        className="bg-black rounded-full h-14 mb-4"
        onPress={handleSignUp}
        disabled={loading}
      >
        <ButtonText className="text-base font-semibold text-white">
          {loading ? "Signing in..." : "Log in"}
        </ButtonText>
      </Button>

      {/* Login Link */}
      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 font-dmsans">Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/signup")}>
          <Text className="text-black font-semibold font-dmsans-bold">Sign up</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
