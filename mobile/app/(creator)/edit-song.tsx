import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { useSong, useUpdateSong, useUploadUrl } from '@/hooks/useSong';
import { songService } from '@/services/song.service';
import { useGenres } from '@/hooks/useDiscover';

export default function EditSongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: song, isLoading } = useSong(id!);
  const { data: genres } = useGenres();
  const updateSong = useUpdateSong();

  const [title, setTitle] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [newCoverImage, setNewCoverImage] = useState<{ uri: string; mimeType: string } | null>(
    null,
  );
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Populate form when song loads
  useEffect(() => {
    if (!song) return;
    setTitle(song.title);
    setSelectedGenre(song.genreId);
    setPrice(song.price?.toString() ?? '0');
    setIsFree(song.isFree);
    setDescription(song.description ?? '');
    setCoverUri(song.coverArtUrl ?? null);
  }, [song]);

  const genreName =
    genres?.find((g: { id: number; name: string }) => g.id === selectedGenre)?.name ??
    'Select genre';

  const pickNewCover = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setNewCoverImage({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' });
    setCoverUri(asset.uri);
  }, []);

  const handleSave = useCallback(async () => {
    if (!id) return;
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Title', text2: 'Enter a song title' });
      return;
    }

    const priceNum = parseFloat(price || '0');
    if (!isFree && (priceNum < 0.49 || priceNum > 9.99)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Price',
        text2: 'Price must be free ($0) or between $0.49 and $9.99',
      });
      return;
    }

    setSaving(true);
    try {
      let coverArtKey: string | undefined;

      // Upload new cover art if changed
      if (newCoverImage) {
        const coverUpload = await songService.getUploadUrl({
          fileType: 'cover-art',
          mimeType: newCoverImage.mimeType,
          fileSize: 0,
        });
        await songService.uploadFile(coverUpload.uploadUrl, {
          uri: newCoverImage.uri,
          mimeType: newCoverImage.mimeType,
        });
        coverArtKey = coverUpload.fileKey;
      }

      await updateSong.mutateAsync({
        songId: id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          genreId: selectedGenre ?? undefined,
          price: priceNum,
          isFree,
          ...(coverArtKey && { coverArtKey }),
        },
      });

      Toast.show({ type: 'success', text1: 'Saved', text2: 'Song updated successfully' });
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.details?.[0]?.message ||
        err?.response?.data?.error?.message ||
        'Failed to update song';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setSaving(false);
    }
  }, [id, title, selectedGenre, price, isFree, description, newCoverImage, updateSong]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Song</Text>
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover Art */}
        <Pressable style={styles.coverSection} onPress={pickNewCover}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Feather name="image" size={32} color={colors.textTertiary} />
            </View>
          )}
          <View style={styles.changeCoverOverlay}>
            <Feather name="camera" size={14} color="#fff" />
            <Text style={styles.changeCoverText}>Change</Text>
          </View>
        </Pressable>

        {/* Title */}
        <Text style={styles.label}>Song Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter song title"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />

        {/* Genre */}
        <Text style={styles.label}>Genre</Text>
        <Pressable style={styles.input} onPress={() => setShowGenrePicker(!showGenrePicker)}>
          <Text style={[styles.inputText, !selectedGenre && { color: colors.textTertiary }]}>
            {genreName}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>

        {showGenrePicker && (
          <View style={styles.genreList}>
            {genres?.map((genre: { id: number; name: string }) => (
              <Pressable
                key={genre.id}
                style={[styles.genreItem, selectedGenre === genre.id && styles.genreItemActive]}
                onPress={() => {
                  setSelectedGenre(genre.id);
                  setShowGenrePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.genreItemText,
                    selectedGenre === genre.id && styles.genreItemTextActive,
                  ]}
                >
                  {genre.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Price */}
        <Text style={styles.label}>Price (USD)</Text>
        <Pressable style={styles.freeToggle} onPress={() => setIsFree(!isFree)}>
          <View style={[styles.toggleBox, isFree && styles.toggleBoxActive]}>
            {isFree && <Feather name="check" size={12} color="#fff" />}
          </View>
          <Text style={styles.freeToggleText}>Free with subscription</Text>
        </Pressable>

        {!isFree && (
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>$</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        )}

        {/* Description */}
        <Text style={styles.label}>
          Description <Text style={styles.labelOptional}>(optional)</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add a description..."
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={2000}
          textAlignVertical="top"
        />

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E28',
  },
  headerTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  saveBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 34,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#050506',
  },
  scroll: { paddingHorizontal: 20 },

  coverSection: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    marginBottom: 24,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: {
    backgroundColor: '#191920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeCoverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  changeCoverText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  label: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#9B9BA7',
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.4,
  },
  labelOptional: {
    fontFamily: fontFamilies.primaryMedium,
    color: '#4A4A5A',
  },
  input: {
    backgroundColor: '#191920',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#313142',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: '#F5F5F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: '#F5F5F7',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 },

  freeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#313142',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  freeToggleText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceCurrency: {
    fontFamily: fontFamilies.mono,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F7',
    marginRight: 8,
  },

  genreList: {
    backgroundColor: '#15151B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  genreItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E28',
  },
  genreItemActive: {
    backgroundColor: 'rgba(0,204,204,0.094)',
  },
  genreItemText: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  genreItemTextActive: { color: colors.accentPrimary },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
