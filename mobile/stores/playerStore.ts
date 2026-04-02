import { create } from 'zustand';

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
  queue: Track[];
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  shuffleEnabled: false,
  repeatMode: 'off',

  play: (track) => set({ currentTrack: track, isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, currentTrack, shuffleEnabled } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack
      ? queue.findIndex((t) => t.id === currentTrack.id)
      : -1;

    let nextIndex: number;
    if (shuffleEnabled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }

    set({ currentTrack: queue[nextIndex], isPlaying: true });
  },

  prev: () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack
      ? queue.findIndex((t) => t.id === currentTrack.id)
      : 0;

    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    set({ currentTrack: queue[prevIndex], isPlaying: true });
  },

  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

  clearQueue: () => set({ queue: [], currentTrack: null, isPlaying: false }),

  toggleShuffle: () => set((state) => ({ shuffleEnabled: !state.shuffleEnabled })),

  toggleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeatMode);
      return { repeatMode: modes[(currentIndex + 1) % modes.length] };
    }),
}));
