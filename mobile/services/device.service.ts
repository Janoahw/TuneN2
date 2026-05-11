import { api } from './api';
import { ENDPOINTS } from './endpoints';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface DeviceTokenParams {
  token: string;
  platform: 'ios' | 'android';
}

/**
 * Device token service for push notifications
 */
export class DeviceService {
  /**
   * Register Expo push token with backend
   */
  static async registerToken(params: DeviceTokenParams) {
    const response = await api.post(ENDPOINTS.devices.register, params);
    return response.data;
  }

  /**
   * Remove push token (logout from this device)
   */
  static async removeToken(token: string) {
    const response = await api.delete(ENDPOINTS.devices.remove, {
      data: { token },
    });
    return response.data;
  }

  /**
   * Get Expo push token for this device
   */
  static async getExpoPushToken(): Promise<string | null> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '483c0d36-76de-4db0-92c8-510cf7fa324d',
      });

      return tokenData.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Register current device push token with backend
   */
  static async registerCurrentDevice() {
    const token = await this.getExpoPushToken();
    if (!token) return null;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    return this.registerToken({ token, platform });
  }
}
