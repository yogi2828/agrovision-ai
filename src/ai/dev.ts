
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/diagnose-plant-health.ts';
import '@/ai/flows/follow-up-plant-queries.ts';
import '@/ai/flows/summarize-diagnosis-history.ts';
