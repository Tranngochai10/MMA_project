import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../../../components/common/ScreenContainer';
import { AppHeader } from '../../../../components/common/AppHeader';
import { PrimaryButton } from '../../../../components/common/PrimaryButton';
import { BrandPresenceFields } from '../../../../components/brand/BrandPresenceFields';
import { useApp } from '../../../../context/AppContext';
import { api } from '../../../../services/api';
import { Colors } from '../../../../constants/theme';

export default function EditBrandPresence() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const { updateBrandPresence } = useApp();
  const [channel, setChannel] = useState<'STORE' | 'ONLINE'>('STORE');
  const [website, setWebsite] = useState('');
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    api.brand(id).then(brand => {
      if (!active) return;
      setName(brand.name); setChannel(brand.salesChannel); setWebsite(brand.websiteUrl); setLoaded(true);
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Không tải được thương hiệu.'); });
    return () => { active = false; };
  }, [id]);
  const save = async () => {
    if (!loaded || saving) return;
    setSaving(true); setError('');
    try { await updateBrandPresence(id, { salesChannel: channel, websiteUrl: website.trim() }); router.back(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được thương hiệu.'); }
    finally { setSaving(false); }
  };
  return <ScreenContainer scrollable>
    <AppHeader title="Hình thức cửa hàng" subtitle={name} showBack />
    <View style={{ padding: 20 }}>
      {!loaded && !error && <ActivityIndicator />}
      {loaded && <><BrandPresenceFields channel={channel} onChannel={setChannel} website={website} onWebsite={setWebsite} /><PrimaryButton title="Lưu cho thương hiệu" onPress={() => void save()} loading={saving} /></>}
      {!!error && <Text accessibilityRole="alert" style={{ color: Colors.error, marginTop: 16 }}>{error}</Text>}
    </View>
  </ScreenContainer>;
}
