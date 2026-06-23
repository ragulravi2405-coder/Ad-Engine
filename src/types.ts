export interface CampaignScene {
  sceneNumber: number;
  visualDescription: string;
  audioSpeech: string;
}

export interface PosterTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  backgroundImagePrompt: string;
}

export interface BrandingCampaign {
  id: string;
  timestamp: string;
  companyName: string;
  productDetails: string;
  promoOffer: string;
  targetAudience: string;
  adType: string;
  
  // AI-generated fields
  slogan: string;
  headline: string;
  subheading: string;
  promoCallout: string;
  bulletPoints: string[];
  posterTheme: PosterTheme;
  socialCaption: string;
  reelScript: {
    title: string;
    scenes: CampaignScene[];
  };
  voiceScript: string;
  
  // Generated asset data
  aiBackdropUrl?: string;
  generatedAudioUrl?: string;
}

export type AdType = 
  | "Instagram Reel"
  | "Marketing Banner"
  | "Promotional Poster"
  | "Social Media Advertisement";

export const AD_TYPES: AdType[] = [
  "Instagram Reel",
  "Marketing Banner",
  "Promotional Poster",
  "Social Media Advertisement"
];
