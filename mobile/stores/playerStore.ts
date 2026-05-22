import { create } from 'zustand';
import TrackPlayer, { Capability, RepeatMode as RNRepeatMode } from 'react-native-track-player';

interface Track {
  id: string;
  title: string;
  artistName: string;
  coverArtUrl: string;
  streamUrl: string;
}

type RepeatMode = 'off' | 'one' | 'all';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isReady: boolean;
  queue: Track[];
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  setReady: (ready: boolean) => void;
  play: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  loadPreview: (track: Track & { previewUrl: string }) => Promise<void>;
  stopPreview: () => Promise<void>;
  addToQueue: (track: Track) => void;
  clearQueue: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isReady: false,
  queue: [],
  shuffleEnabled: false,
  repeatMode: 'off',

  setReady: (ready) => set({ isReady: ready }),

  play: async (track) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add([
        {
          id: track.id,
          url: track.streamUrl,
          title: track.title,
          artist: track.artistName,
          artwork: track.coverArtUrl ?? undefined,
        },
      ]);
      await TrackPlayer.play();
      set({ currentTrack: track, isPlaying: true });
    } catch {
      // Player not set up yet — update state only
      set({ currentTrack: track, isPlaying: true });
    }
  },

  pause: async () => {
    try {
      await TrackPlayer.pause();
    } catch {
      // ignore
    }
    set({ isPlaying: false });
  },

  resume: async () => {
    try {
      await TrackPlayer.play();
    } catch {
      // ignore
    }
    set({ isPlaying: true });
  },

  next: async () => {
    const { queue, currentTrack, shuffleEnabled } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;

    let nextIndex: number;
    if (shuffleEnabled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }

    const nextTrack = queue[nextIndex];
    try {
      await TrackPlayer.skipToNext();
    } catch {
      // If skip fails (e.g. single track), reload
      await get().play(nextTrack);
      return;
    }
    set({ currentTrack: nextTrack, isPlaying: true });
  },

  prev: async () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : 0;

    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    const prevTrack = queue[prevIndex];
    try {
      await TrackPlayer.skipToPrevious();
    } catch {
      await get().play(prevTrack);
      return;
    }
    set({ currentTrack: prevTrack, isPlaying: true });
  },

  loadPreview: async (track) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add([
        {
          id: track.id,
          url: track.previewUrl,
          title: track.title,
          artist: track.artistName,
          artwork: track.coverArtUrl ?? undefined,
        },
      ]);
      await TrackPlayer.play();
      set({ currentTrack: track, isPlaying: true });
    } catch {
      set({ currentTrack: track, isPlaying: true });
    }
  },

  stopPreview: async () => {
    try {
      await TrackPlayer.reset();
    } catch {
      // ignore
    }
    set({ isPlaying: false, currentTrack: null });
  },

  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

  clearQueue: async () => {
    try {
      await TrackPlayer.reset();
    } catch {
      // ignore
    }
    set({ queue: [], currentTrack: null, isPlaying: false });
  },

  toggleShuffle: () => set((state) => ({ shuffleEnabled: !state.shuffleEnabled })),

  toggleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      const rnModeMap: Record<RepeatMode, RNRepeatMode> = {
        off: RNRepeatMode.Off,
        one: RNRepeatMode.Track,
        all: RNRepeatMode.Queue,
      };
      TrackPlayer.setRepeatMode(rnModeMap[nextMode]).catch(() => {});
      return { repeatMode: nextMode };
    }),
}));
