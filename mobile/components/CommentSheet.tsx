import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useSongInteraction';
import type { CommentPage, SongComment } from '@/services/song-interaction.service';
import { colors, fontFamilies, fontSizes, spacing, radius } from '@/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Helpers ───────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Comment row ───────────────────────────────────────────

interface CommentRowProps {
  comment: SongComment;
  currentUserId: string | null;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function CommentRow({ comment, currentUserId, onDelete, isDeleting }: CommentRowProps) {
  const isOwn = comment.user.id === currentUserId;

  return (
    <View style={rowStyles.container}>
      {/* Avatar */}
      <View style={rowStyles.avatar}>
        <Text style={rowStyles.initials}>{getInitials(comment.user.displayName)}</Text>
      </View>

      {/* Body */}
      <View style={rowStyles.content}>
        <View style={rowStyles.nameRow}>
          <Text style={rowStyles.name} numberOfLines={1}>
            {comment.user.displayName}
          </Text>
          <Text style={rowStyles.time}>{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={rowStyles.body}>{comment.body}</Text>
      </View>

      {/* Delete button (own comments only) */}
      {isOwn && (
        <TouchableOpacity
          onPress={() => onDelete(comment.id)}
          disabled={isDeleting}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={rowStyles.deleteBtn}
        >
          {isDeleting ? (
            <ActivityIndicator size={14} color={colors.textSecondary} />
          ) : (
            <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  initials: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.xs,
    color: colors.accentPrimary,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 3,
  },
  name: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  time: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  body: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  deleteBtn: {
    paddingTop: 2,
    flexShrink: 0,
  },
});

// ── CommentSheet ──────────────────────────────────────────

interface CommentSheetProps {
  visible: boolean;
  songId: string | null;
  onClose: () => void;
}

export function CommentSheet({ visible, songId, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [inputText, setInputText] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(
    visible ? songId : null,
  );

  const createMutation = useCreateComment(songId);
  const deleteMutation = useDeleteComment(songId);
  // This RN type set is missing some FlatList props, so keep the runtime component and cast locally.
  const CommentList = FlatList as any;

  const pages = data?.pages as CommentPage[] | undefined;
  const allComments = pages?.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;
  const sheetHeight = Math.min(SHEET_HEIGHT, SCREEN_HEIGHT - insets.top - spacing[4]);
  const sheetOffset = Math.max(0, keyboardHeight - insets.bottom);

  // Slide-up animation on open
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(0);
      setInputText('');
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || createMutation.isPending) return;
    Keyboard.dismiss();
    setInputText('');
    createMutation.mutate(text);
  }, [inputText, createMutation]);

  const handleDelete = useCallback(
    (commentId: string) => {
      setDeletingId(commentId);
      deleteMutation.mutate(commentId, {
        onSettled: () => setDeletingId(null),
      });
    },
    [deleteMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: SongComment }) => (
      <CommentRow
        comment={item}
        currentUserId={userId}
        onDelete={handleDelete}
        isDeleting={deletingId === item.id}
      />
    ),
    [userId, handleDelete, deletingId],
  );

  const keyExtractor = useCallback((item: SongComment) => item.id, []);

  const sheetTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={sheetStyles.overlay}>
        {/* Tap backdrop to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            sheetStyles.sheet,
            { height: sheetHeight, paddingBottom: insets.bottom, marginBottom: sheetOffset },
            { transform: [{ translateY: sheetTranslate }] },
          ]}
        >
          {/* Handle bar */}
          <View style={sheetStyles.handleBar} />

          {/* Header */}
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.headerTitle}>
              Comments{totalCount > 0 ? ` (${totalCount})` : ''}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={sheetStyles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.bottom}
          >
            {/* Comment list */}
            {isLoading ? (
              <View style={sheetStyles.centered}>
                <ActivityIndicator color={colors.accentPrimary} />
              </View>
            ) : allComments.length === 0 ? (
              <View style={sheetStyles.centered}>
                <Ionicons name="chatbubble-outline" size={36} color={colors.textSecondary} />
                <Text style={sheetStyles.emptyText}>No comments yet</Text>
                <Text style={sheetStyles.emptySubtext}>Be the first to comment</Text>
              </View>
            ) : (
              <CommentList
                data={allComments}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={sheetStyles.listContent}
                ItemSeparatorComponent={() => <View style={sheetStyles.separator} />}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <ActivityIndicator
                      style={{ paddingVertical: spacing[4] }}
                      color={colors.accentPrimary}
                    />
                  ) : null
                }
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* Input bar */}
            {isAuthenticated ? (
              <View style={sheetStyles.inputBar}>
                <TextInput
                  ref={inputRef}
                  style={sheetStyles.input}
                  placeholder="Add a comment…"
                  placeholderTextColor={colors.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={[
                    sheetStyles.sendBtn,
                    (!inputText.trim() || createMutation.isPending) && sheetStyles.sendBtnDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator size={18} color={colors.bgPrimary} />
                  ) : (
                    <Ionicons name="send" size={18} color={colors.bgPrimary} />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={sheetStyles.authPrompt}>
                <Text style={sheetStyles.authPromptText}>Sign in to leave a comment</Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const SHEET_HEIGHT = 560;

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderDefault,
  },
  headerTitle: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  emptyText: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  listContent: {
    paddingTop: spacing[1],
    paddingBottom: spacing[2],
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderDefault,
    marginHorizontal: spacing[4],
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.bgCard,
    gap: spacing[2],
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.xl,
    paddingHorizontal: spacing[3],
    paddingVertical: Platform.OS === 'ios' ? spacing[2] : spacing[1],
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: colors.bgSecondary,
  },
  authPrompt: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDefault,
    alignItems: 'center',
  },
  authPromptText: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
