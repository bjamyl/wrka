import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <View className="flex-row gap-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton
          key={i}
          width={120}
          height={44}
          borderRadius={22}
        />
      ))}
    </View>
  );
};

export const JobCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <View className="flex-row items-start gap-3 mb-3">
        <Skeleton width={40} height={40} borderRadius={20} />
        <View className="flex-1">
          <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 16 }} />
      <View className="flex-row gap-2">
        <Skeleton width="48%" height={40} borderRadius={20} />
        <Skeleton width="48%" height={40} borderRadius={20} />
      </View>
    </View>
  );
};
