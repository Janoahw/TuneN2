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

const GENRES = [
  { id: 1, name: 'Hip-Hop' },
  { id: 2, name: 'R&B' },
  { id: 3, name: 'Afrobeats' },
  { id: 4, name: 'Pop' },
  { id: 5, name: 'Electronic' },
  { id: 6, name: 'Rock' },
  { id: 7, name: 'Jazz' },
  { id: 8, name: 'Classical' },
  { id: 9, name: 'Reggae' },
  { id: 10, name: 'Gospel' },
];

export default function EditSongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: song, isLoading } = useSong(id!);
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

  const genreName = GENRES.find((g) => g.id === selectedGenre)?.name ?? 'Select genre';

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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.response?.data?.message || 'Failed to update song',
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
            {GENRES.map((genre) => (
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
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  headerTitle: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  scroll: { paddingHorizontal: spacing[4] },

  // Cover
  coverSection: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    marginBottom: spacing[6],
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: colors.bgSecondary,
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
    paddingVertical: spacing[2],
    gap: 4,
  },
  changeCoverText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Form
  label: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing[2],
    marginTop: spacing[3],
  },
  labelOptional: {
    fontFamily: fontFamilies.primary,
    color: colors.textTertiary,
  },
  input: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    color: colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing[3],
  },

  // Price / Free toggle
  freeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  toggleBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  freeToggleText: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceCurrency: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginRight: spacing[2],
  },

  // Genre
  genreList: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginTop: spacing[1],
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  genreItem: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  genreItemActive: {
    backgroundColor: 'rgba(255, 107, 46, 0.1)',
  },
  genreItemText: {
    fontFamily: fontFamilies.primary,
    fontSize: 15,
    color: colors.textPrimary,
  },
  genreItemTextActive: {
    color: colors.accentPrimary,
    fontFamily: fontFamilies.primaryMedium,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
