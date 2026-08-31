import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

const FileSystem = require('expo-file-system/legacy') as {
  cacheDirectory: string | null;
  getInfoAsync: (uri: string) => Promise<{ exists: boolean; size?: number }>;
  readAsStringAsync: (uri: string) => Promise<string>;
  writeAsStringAsync: (uri: string, contents: string) => Promise<void>;
};

const maximumBackupSize = 10 * 1024 * 1024;

export async function shareBackupFile(contents: string, filename: string) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  if (!FileSystem.cacheDirectory) throw new Error('Temporary file storage is not available on this device.');
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, contents);
  await Sharing.shareAsync(uri, { dialogTitle: 'Save Repbook backup', mimeType: 'application/json', UTI: 'public.json' });
}

export async function pickBackupFile() {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/json', 'text/plain'], copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const size = asset.size ?? (await FileSystem.getInfoAsync(asset.uri)).size;
  if (size !== undefined && size > maximumBackupSize) throw new Error('This backup is too large. Choose a Repbook backup smaller than 10 MB.');
  return FileSystem.readAsStringAsync(asset.uri);
}
