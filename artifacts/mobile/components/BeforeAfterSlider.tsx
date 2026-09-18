import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import colors from '@/constants/colors';

type BeforeAfterSliderProps = {
  before: ImageSourcePropType;
  after: ImageSourcePropType;
  height?: number;
};

export function BeforeAfterSlider({
  before,
  after,
  height = 146,
}: BeforeAfterSliderProps) {
  const [width, setWidth] = useState(0);
  const [position, setPosition] = useState(0.5);
  const widthRef = useRef(0);

  const updatePosition = (locationX: number) => {
    if (!widthRef.current) return;
    const nextPosition = Math.max(0.04, Math.min(0.96, locationX / widthRef.current));
    setPosition(nextPosition);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: (event) => updatePosition(event.nativeEvent.locationX),
        onPanResponderMove: (event) => updatePosition(event.nativeEvent.locationX),
      }),
    [],
  );

  return (
    <View
      {...panResponder.panHandlers}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        widthRef.current = nextWidth;
        setWidth(nextWidth);
      }}
      style={[styles.frame, { height }]}
    >
      <Image source={before} style={styles.fullImage} resizeMode="cover" />

      <View style={[styles.afterClip, { width: width * position }]}>
        <Image source={after} style={[styles.fullImage, { width }]} resizeMode="cover" />
      </View>

      {width > 0 ? (
        <View style={[styles.divider, { left: width * position - 1 }]}>
          <View style={styles.handle}>
            <Text style={styles.handleText}>↔</Text>
          </View>
        </View>
      ) : null}

      <View pointerEvents="none" style={styles.compareLabel}>
        <Text style={styles.compareLabelText}>Drag to Compare</Text>
      </View>
      <View pointerEvents="none" style={styles.beforeBadge}>
        <Text style={styles.imageBadgeText}>BEFORE</Text>
      </View>
      <View pointerEvents="none" style={styles.afterBadge}>
        <Text style={styles.imageBadgeText}>AFTER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E8F0EA',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  afterClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  handle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 54,
    shadowColor: '#173F31',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  handleText: {
    color: colors.light.primary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 21,
  },
  compareLabel: {
    position: 'absolute',
    alignSelf: 'center',
    top: 12,
    backgroundColor: 'rgba(19, 23, 20, 0.72)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  compareLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  beforeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(20,22,21,0.78)',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  afterBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.light.primary,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});