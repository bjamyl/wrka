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

export default function LoginForm() {
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. New error state
  const [error, setError] = useState("");

  // Helper to clear errors when user types
  const onInputChange = (setter: (val: string) => void) => (val: string) => {
    setter(val);
    if (error) setError("");
  };

  const handleSignIn = async () => {
    setError(""); // Clear previous errors

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (data) {
      const profile = data?.profile;
      if(!profile || profile === null){
        return router.replace('/onboarding')
      }
      router.replace("/(tabs)");
    }
  };

  return (
    <>
      <VStack space="lg" className="mb-6">
        {/* Email Input */}
        <VStack space="xs">
          <Text className="text-sm font-dmsans-medium text-gray-700 mb-1">
            Email
          </Text>
          <Input
            className={`border rounded-xl h-14 ${
              error ? "border-red-300" : "border-gray-300"
            }`}
          >
            <InputField
              placeholder="Enter your email"
              value={email}
              onChangeText={onInputChange(setEmail)}
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
          <Input
            className={`border rounded-xl h-14 ${
              error ? "border-red-300" : "border-gray-300"
            }`}
          >
            <InputField
              placeholder="Enter your password"
              value={password}
              onChangeText={onInputChange(setPassword)}
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

    
      {error ? <FormError message={error} /> : null}

    
      <Button
        size="lg"
        className="bg-black rounded-full h-14 mb-4"
        onPress={handleSignIn}
        disabled={loading}
      >
        <ButtonText className="text-base font-semibold text-white">
          {loading ? "Signing in..." : "Log in"}
        </ButtonText>
      </Button>

      {/* Login Link */}
      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 font-dmsans">
          Don&apos;t have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/signup")}>
          <Text className="text-black font-semibold font-dmsans-bold">
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
