import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type FramedImageProps = {
  source: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  fallbackSource?: ImageSourcePropType;
};

/**
 * Fills existing photo slots without stretching the source image.
 * Cover preserves the aspect ratio while cropping the least important edges
 * of square or portrait photos instead of leaving side gaps.
 */
export function FramedImage({ source, style, imageStyle, fallbackSource }: FramedImageProps) {
  const [currentSource, setCurrentSource] = useState<ImageSourcePropType>(source);

  return (
    <View style={[styles.frame, style]}>
      <Image
        source={currentSource}
        style={[styles.image, imageStyle]}
        resizeMode="cover"
        onError={() => {
          if (fallbackSource && currentSource !== fallbackSource) {
            setCurrentSource(fallbackSource);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: '#E8F0EA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});