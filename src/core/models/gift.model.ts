export interface Gift {
  id: string;
  code: string;
  vendorName: string;
  vendorLogoUrl: string;
  amount: number;
  currency: 'NOK';
  personalMessage?: string;
  senderName: string;
  animationType: 'birthday' | 'wedding' | 'generic' | 'christmas';
  expiryDate?: Date;
  isOpened: boolean;
  isActivated: boolean;
}

export interface RevealState {
  step: 'loading' | 'ready' | 'shaking' | 'unwrapping' | 'revealed' | 'transferred';
  tapsRemaining: number;
  animationProgress: number;
  error?: string;
}

export interface TransferResponse {
  success: boolean;
  appDeepLink: string;
  fallbackUrl: string;
}