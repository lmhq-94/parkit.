import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getHeaderSizes, HEADER_LOGO_BASE_SIZE } from '@/lib/homeUtils';
import { Logo } from '@parkit/shared';

export default function HeaderTestScreen() {
  const textScales = [1.0, 1.15, 1.25]; // Different text scale settings
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Header Sizing Test</Text>
      <Text style={styles.subtitle}>Testing proportional sizing with different text scales</Text>
      
      {textScales.map((scale) => {
        const sizes = getHeaderSizes(HEADER_LOGO_BASE_SIZE, scale);
        
        return (
          <View key={scale} style={styles.testRow}>
            <Text style={styles.scaleLabel}>Text Scale: {scale}x</Text>
            <View style={styles.headerPreview}>
              <Logo size={sizes.logoSize} variant="onLight" />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { fontSize: sizes.displayNameSize }]}>
                  Ligia
                </Text>
                <Text style={[styles.userRole, { fontSize: sizes.roleSize }]}>
                  Recepción
                </Text>
              </View>
              <View style={[styles.avatar, { 
                width: sizes.avatarSize, 
                height: sizes.avatarSize,
                borderRadius: sizes.avatarSize / 2,
              }]}>
                <Text style={styles.avatarText}>L</Text>
                <View style={[styles.statusDot, {
                  width: sizes.statusDotSize,
                  height: sizes.statusDotSize,
                  borderRadius: sizes.statusDotSize / 2,
                  borderWidth: sizes.statusDotBorderWidth,
                }]} />
              </View>
            </View>
            <View style={styles.sizeInfo}>
              <Text style={styles.sizeText}>Logo: {sizes.logoSize}px</Text>
              <Text style={styles.sizeText}>Avatar: {sizes.avatarSize}px</Text>
              <Text style={styles.sizeText}>Name: {sizes.displayNameSize}px</Text>
              <Text style={styles.sizeText}>Role: {sizes.roleSize}px</Text>
              <Text style={styles.sizeText}>Gap: {sizes.gap}px</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  testRow: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scaleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  headerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  userName: {
    fontWeight: '700',
    textAlign: 'right',
  },
  userRole: {
    fontWeight: '600',
    textAlign: 'right',
    color: '#666',
  },
  avatar: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#34D399',
    borderColor: 'white',
  },
  sizeInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sizeText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
});
