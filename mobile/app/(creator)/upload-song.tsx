import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { colors, fontFamilies, spacing, radius } from '@/theme';
import { songService } from '@/services/song.service';
import { useCreateSong, useUploadUrl } from '@/hooks/useSong';
import { useGenres } from '@/hooks/useDiscover';

const AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface AudioFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

interface CoverImage {
  uri: string;
  mimeType: string;
}

export default function UploadSongScreen() {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [coverImage, setCoverImage] = useState<CoverImage | null>(null);
  const [title, setTitle] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [price, setPrice] = useState('1.00');
  const [description, setDescription] = useState('');
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createSong = useCreateSong();
  const uploadUrl = useUploadUrl();
  const { data: genres, isLoading: genresLoading } = useGenres();

  const earningsDisplay = price ? `$${(parseFloat(price || '0') * 0.8).toFixed(2)}` : '$0.00';
  const genreName = genres?.find((g) => g.id === selectedGenre)?.name ?? 'Select genre';

  const pickAudioFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: AUDIO_MIME_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (asset.size && asset.size > MAX_FILE_SIZE) {
        Toast.show({ type: 'error', text1: 'File Too Large', text2: 'Maximum file size is 50MB' });
        return;
      }

      setAudioFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType ?? 'audio/mpeg',
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick audio file' });
    }
  }, []);

  const pickCoverArt = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (asset.width < 500 || asset.height < 500) {
        Toast.show({
          type: 'error',
          text1: 'Image Too Small',
          text2: 'Cover art must be at least 500×500px',
        });
        return;
      }

      setCoverImage({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick cover art' });
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!audioFile) {
      Toast.show({ type: 'error', text1: 'Missing Audio', text2: 'Select an audio file' });
      return;
    }
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Title', text2: 'Enter a song title' });
      return;
    }
    if (!selectedGenre) {
      Toast.show({ type: 'error', text1: 'Missing Genre', text2: 'Select a genre' });
      return;
    }

    const priceNum = parseFloat(price || '0');
    const isFree = priceNum === 0;
    if (!isFree && (priceNum < 0.49 || priceNum > 9.99)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Price',
        text2: 'Price must be free ($0) or between $0.49 and $9.99',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get presigned URL for audio
      setUploadProgress(10);
      const audioUpload = await songService.getUploadUrl({
        fileType: 'audio',
        mimeType: audioFile.mimeType,
        fileSize: audioFile.size,
      });

      // 2. Upload audio file to S3
      setUploadProgress(20);
      await songService.uploadFile(audioUpload.uploadUrl, {
        uri: audioFile.uri,
        mimeType: audioFile.mimeType,
      });

      // 3. Upload cover art if provided
      let coverArtKey: string | undefined;
      if (coverImage) {
        setUploadProgress(50);
        const coverUpload = await songService.getUploadUrl({
          fileType: 'cover-art',
          mimeType: coverImage.mimeType,
          fileSize: 0, // Size not critical for images
        });
        await songService.uploadFile(coverUpload.uploadUrl, {
          uri: coverImage.uri,
          mimeType: coverImage.mimeType,
        });
        coverArtKey = coverUpload.fileKey;
      }

      // 4. Create song record
      setUploadProgress(80);
      await createSong.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        genreId: selectedGenre,
        price: priceNum,
        isFree,
        audioFileKey: audioUpload.fileKey,
        coverArtKey,
      });

      setUploadProgress(100);
      Toast.show({
        type: 'success',
        text1: 'Upload Started!',
        text2: 'Your song is being processed. Check your catalog for status.',
      });
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.details?.[0]?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Please try again';
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: message,
      });
    } finally {
      setUploading(false);
    }
  }, [audioFile, coverImage, title, selectedGenre, price, description, createSong]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Song</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Audio File Picker */}
        <Pressable style={styles.audioPicker} onPress={pickAudioFile}>
          <Feather
            name={audioFile ? 'music' : 'upload'}
            size={32}
            color={audioFile ? colors.accentPrimary : colors.textSecondary}
          />
          {audioFile ? (
            <>
              <Text style={styles.audioFileName} numberOfLines={1}>
                {audioFile.name}
              </Text>
              <Text style={styles.audioFileSize}>
                {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.audioPickerText}>Tap to select audio file</Text>
              <Text style={styles.audioPickerHint}>MP3, WAV, FLAC • Max 50MB</Text>
            </>
          )}
        </Pressable>

        {/* Cover Art */}
        <Text style={styles.label}>Cover Art</Text>
        <Pressable style={styles.coverPicker} onPress={pickCoverArt}>
          {coverImage ? (
            <Image source={{ uri: coverImage.uri }} style={styles.coverPreview} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Feather name="image" size={24} color={colors.textSecondary} />
              <Text style={styles.coverPlaceholderText}>Add Cover</Text>
            </View>
          )}
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
            {genres?.map((genre) => (
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
        <View style={styles.priceRow}>
          <Text style={styles.priceCurrency}>$</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>
        <Text style={styles.earningsText}>You earn: {earningsDisplay}</Text>

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

        {/* Upload Button */}
        <Pressable
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadBtnInner}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.uploadBtnText}>Uploading... {uploadProgress}%</Text>
            </View>
          ) : (
            <Text style={styles.uploadBtnText}>Upload Song</Text>
          )}
        </Pressable>

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
  scroll: { paddingHorizontal: spacing[4] },

  // Audio Picker
  audioPicker: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
    marginBottom: spacing[6],
  },
  audioPickerText: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing[3],
  },
  audioPickerHint: {
    fontFamily: fontFamilies.primary,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  audioFileName: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 14,
    color: colors.accentPrimary,
    marginTop: spacing[2],
    maxWidth: '80%',
  },
  audioFileSize: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  // Cover Art
  coverPicker: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing[5],
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  coverPreview: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
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

  // Price
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
  priceInput: { flex: 1 },
  earningsText: {
    fontFamily: fontFamilies.monoSemiBold,
    fontSize: 13,
    color: colors.success,
    marginTop: spacing[1],
    marginBottom: spacing[2],
  },

  // Genre Picker
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

  // Upload Button
  uploadBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  uploadBtnText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
