import * as LocalAuthentication from 'expo-local-authentication';

export const BiometricService = {
  async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  },

  async getBiometricType(): Promise<'face' | 'fingerprint' | 'iris' | null> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';
    return null;
  },

  async authenticate(reason: string = 'Authenticate'): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  },

  async getBiometricLabel(): Promise<string> {
    const type = await this.getBiometricType();
    switch (type) {
      case 'face': return 'FaceID';
      case 'fingerprint': return 'Fingerprint';
      case 'iris': return 'Iris';
      default: return 'Biometrics';
    }
  },

  async getBiometricIcon(): Promise<'face-recognition' | 'fingerprint' | 'scan'> {
    const type = await this.getBiometricType();
    switch (type) {
      case 'face': return 'face-recognition';
      case 'fingerprint': return 'fingerprint';
      default: return 'scan';
    }
  },

  async checkStatus(): Promise<{ hasHardware: boolean; enrolled: boolean; type: string; available: boolean }> {
    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    const type = await this.getBiometricLabel();
    return { hasHardware, enrolled, type, available: hasHardware && enrolled };
  },
};
