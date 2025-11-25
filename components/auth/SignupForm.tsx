import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { FormError } from "../ui/FormError";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 1. New state for handling errors
  const [error, setError] = useState("");

  // Helper to clear errors when user types
  const onInputChange = (setter: (val: string) => void) => (val: string) => {
    setter(val);
    if (error) setError("");
  };

  const handleSignUp = async () => {
    setError(""); // Clear previous errors

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

 
    const { data, error: signUpError } = await signUp(email, password);

    if (signUpError) {
      // Display the specific error from Supabase (e.g., "User already exists")
      setError(signUpError.message);
      return;
    }

    if (data) {
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
          <Input
            className={`border rounded-xl h-14 ${error ? "border-red-300" : "border-gray-300"}`}
          >
            <InputField
              placeholder="Enter your email"
              value={email}
              onChangeText={onInputChange(setEmail)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Input>
        </VStack>

        {/* Password Input */}
        <VStack space="xs">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Password
          </Text>
          <Input
            className={`border rounded-xl h-14 ${error ? "border-red-300" : "border-gray-300"}`}
          >
            <InputField
              placeholder="Create a password"
              value={password}
              onChangeText={onInputChange(setPassword)}
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
          <Input
            className={`border rounded-xl h-14 ${error ? "border-red-300" : "border-gray-300"}`}
          >
            <InputField
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={onInputChange(setConfirmPassword)}
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

      {/* 3. Error Display Component */}
      {error ? (
        <FormError message={error}/>
      ) : null}

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
