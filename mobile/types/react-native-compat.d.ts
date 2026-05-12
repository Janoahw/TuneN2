import 'react-native';
import type { ReactElement, ComponentType } from 'react';

declare module 'react-native' {
  interface FlatListProps<ItemT> {
    contentContainerStyle?: any;
    refreshControl?: ReactElement | null;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    horizontal?: boolean;
    ItemSeparatorComponent?: ComponentType<any> | ReactElement | null;
    ListEmptyComponent?: ComponentType<any> | ReactElement | null;
    ListFooterComponent?: ComponentType<any> | ReactElement | null;
    ListHeaderComponent?: ComponentType<any> | ReactElement | null;
  }
}
