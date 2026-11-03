import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export interface CreateBrandInput {
  name: string;
  code: string;
  categoryId?: string;
  rating?: number;
  address?: string;
  salesChannel?: 'STORE' | 'ONLINE';
  websiteUrl?: string;
  description: string;
  logo?: ImagePickerAsset;
  coverImage?: ImagePickerAsset;
}

export async function brandFormData(input: CreateBrandInput) {
  const form = new FormData();
  for (const key of ['name', 'code', 'categoryId', 'rating', 'address', 'description', 'salesChannel', 'websiteUrl'] as const) {
    if (input[key] !== undefined) form.append(key, String(input[key]));
  }
  for (const key of ['logo', 'coverImage'] as const) {
    const asset = input[key];
    if (!asset) continue;
    await appendImage(form, key, asset);
  }
  return form;
}

export async function appendImage(form: FormData, key: string, asset: ImagePickerAsset) {
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) throw new Error('Mỗi ảnh tối đa 5 MB.');
  const type = asset.mimeType || 'image/jpeg';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) throw new Error('Chỉ hỗ trợ JPG, PNG và WebP.');
  const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const name = asset.fileName || `${key}.${extension}`;
  if (Platform.OS === 'web') {
    form.append(key, asset.file || await (await fetch(asset.uri)).blob(), name);
  } else {
    form.append(key, { uri: asset.uri, name, type } as unknown as Blob);
  }
}
