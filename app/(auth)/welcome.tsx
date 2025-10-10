import { View, Image } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-5 pb-10">
        {/* Logo */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-black">wrka.</Text>
        </View>

        {/* Welcome Image */}
        <View className="items-center justify-center my-8">
          <Image
            source={require('@/assets/images/welcome.png')}
            className=" h-72"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text Section */}
        <VStack space="md" className="mt-5">
          <Text size='lg' className="text-gray-600 text-center text-dmsans">
            Welcome to Wrka
          </Text>
          
          <Heading size="3xl" className="font-bold text-black text-center leading-tight">
            Get more jobs.{'\n'}Grow your business.
          </Heading>
          
          <Text className="text-lg text-gray-600 text-center leading-6 px-2">
            Join thousands of skilled workers finding quality jobs, getting paid faster, and building their reputation.
          </Text>
        </VStack>

        <View className="flex-1" />

        {/* Bottom Buttons */}
        <VStack space="md" className="w-full mt-5">
          <Button 
            size="lg" 
            className="bg-black rounded-full h-14"
            onPress={() => {router.push('/signup')}}
          >
            <ButtonText className="text-base font-semibold text-white">
              Get started
            </ButtonText>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="border border-gray-200 rounded-full h-14"
            onPress={() => {router.push('/verify-email')}}
          >
            <ButtonText className="text-base font-semibold text-black">
              Log in
            </ButtonText>
          </Button>
        </VStack>
      </View>

    </SafeAreaView>
  );
}