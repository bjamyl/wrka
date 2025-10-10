import { View, TouchableOpacity } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const { data, error } = await signUp(email, password);

    if (data && !error) {
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: email.trim() },
      });
    }
  };
  return (
    <>
    <VStack space="lg" className="mb-6">
      {/* Email Input */}
      <VStack space="xs">
        <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
        <Input className="border border-gray-300 rounded-xl h-14">
          <InputField
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </Input>
      </VStack>

      {/* Password Input */}
      <VStack space="xs">
        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <Input className="border border-gray-300 rounded-xl h-14">
          <InputField
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
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

      {/* Confirm Password Input */}
      <VStack space="xs">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </Text>
        <Input className="border border-gray-300 rounded-xl h-14">
          <InputField
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <InputSlot
            className="pr-3"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <InputIcon
              as={showConfirmPassword ? EyeOff : Eye}
              className="text-gray-500"
            />
          </InputSlot>
        </Input>
      </VStack>
    </VStack>
            <Text className="text-sm text-gray-600 text-center mb-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>

        {/* Sign Up Button */}
        <Button
          size="lg"
          className="bg-black rounded-full h-14 mb-4"
          onPress={handleSignUp}
          disabled={loading}
        >
          <ButtonText className="text-base font-semibold text-white">
            {loading ? "Creating account..." : "Sign up"}
          </ButtonText>
        </Button>

        {/* Login Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-black font-semibold">Log in</Text>
          </TouchableOpacity>
        </View>
    </>
  );
}
