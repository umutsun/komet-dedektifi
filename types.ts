/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppState {
  IDLE,
  LOADING,
  GENERATING_IMAGE,
  GENERATING_VIDEO,
  SUCCESS,
  MISSION_COMPLETE,
  ERROR,
}

export interface MissionStep {
  id: string;
  story: string;
  objective: string;
  successPromptKeywords: string[];
  imagePrompt: string;
  videoPrompt: string;
}

export interface InterpretedData {
  summary: string;
  objectName: string;
  distance: string;
  velocity: string;
}

export interface AvatarProps {
  type: 'A' | 'B' | 'C';
  color: string;
}

// Fix: Add PlayerProfile interface for use in character creation components.
export interface PlayerProfile {
  name: string;
  gender: 'male' | 'female';
  avatar: AvatarProps;
}

export interface User extends PlayerProfile {
  uid: string;
  currentShipId?: string;
}

export interface Ship {
    id: string;
    name: string;
    captainId: string;
    crew: string[]; // Array of user UIDs
    currentMissionId: string;
    conversationHistory: {role: 'user' | 'model', content: string}[];
    logEntries: CaptainLogEntry[];
    playerAssets: PlayerAsset[];
}


export type CommandAction = 
  | 'GENERAL_CONVERSATION'
  | 'EDIT_IMAGE'
  | 'ASTROBOT_MISSION'
  | 'INTERPRET_DATA'
  | 'COMPLETE_MISSION'
  | 'UNKNOWN';

export interface InterpretedCommand {
  action: CommandAction;
  isCritical: boolean;
  params: {
    prompt?: string;
    target?: string;
  };
}

export interface CaptainLogEntry {
  id: string;
  timestamp: number; 
  content: string;
  author: string; // User name
}

export interface PlayerAsset {
  id: string;
  timestamp: number;
  type: 'telescope' | 'astrobot';
  prompt: string;
  imageDataUrl: string;
  author: string; // User name
}

export interface TelescopeHotspot {
  id: number;
  x: number;
  y: number;
  label: string;
  prompt: string;
}
