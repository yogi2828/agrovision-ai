import type { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  language: string;
  voiceEnabled: boolean;
  voiceSpeed: number;
}
