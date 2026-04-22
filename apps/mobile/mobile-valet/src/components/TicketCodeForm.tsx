import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { IconCheck } from '@/components/TablerIcons';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';

interface TicketCodeFormProps {
  locale: Locale;
  ticketCode: string;
  keyCode: string;
  unlinked: boolean;
  acknowledged: boolean;
  onTicketCodeChange: (value: string) => void;
  onKeyCodeChange: (value: string) => void;
  onToggleUnlinked: () => void;
  onAcknowledge: () => void;
  colors: {
    textSubtle: string;
    primary: string;
  };
}

export function TicketCodeForm({
  locale,
  ticketCode,
  keyCode,
  unlinked,
  acknowledged,
  onTicketCodeChange,
  onKeyCodeChange,
  onToggleUnlinked,
  onAcknowledge,
  colors: C,
}: TicketCodeFormProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>{t(locale, 'receive.wizardTicketTitle')}</Text>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardTicketHelp')}</Text>

      {/* Ticket Code */}
      <TextInput
        style={styles.input}
        value={ticketCode}
        onChangeText={onTicketCodeChange}
        placeholder={unlinked ? t(locale, 'receive.ticketCodeOnlyLabel') : t(locale, 'receive.placeholderTicketKeyCode')}
        placeholderTextColor={C.textSubtle}
        autoCapitalize="characters"
        maxFontSizeMultiplier={2}
      />

      {/* Unlinked toggle */}
      <Pressable onPress={onToggleUnlinked} style={styles.toggleRow}>
        <View style={[styles.toggleBox, unlinked && styles.toggleBoxActive]}>
          {unlinked && <IconCheck size={14} color="#fff" />}
        </View>
        <Text style={styles.toggleText}>
          {unlinked ? t(locale, 'receive.ticketKeySameToggle') : t(locale, 'receive.ticketKeySeparateToggle')}
        </Text>
      </Pressable>

      {/* Key Code (when unlinked) */}
      {unlinked && (
        <TextInput
          style={styles.input}
          value={keyCode}
          onChangeText={onKeyCodeChange}
          placeholder={t(locale, 'receive.placeholderKeyCode')}
          placeholderTextColor={C.textSubtle}
          autoCapitalize="characters"
          maxFontSizeMultiplier={2}
        />
      )}

      {/* Acknowledgment */}
      <Pressable onPress={onAcknowledge} style={styles.ackRow}>
        <View style={[styles.toggleBox, acknowledged && styles.toggleBoxActive]}>
          {acknowledged && <IconCheck size={14} color="#fff" />}
        </View>
        <Text style={styles.ackText}>{t(locale, 'receive.wizardTicketAck')}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepExplain: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 14,
    color: '#475569',
  },
  ackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
  },
  ackText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
});
