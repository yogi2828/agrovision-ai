import { PlaceHolderImages } from './placeholder-images';

export const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'te', label: 'Telugu (తెలుగు)' },
  { value: 'ta', label: 'Tamil (தமிழ்)' },
  { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'ml', label: 'Malayalam (മലയാളം)' },
  { value: 'mr', label: 'Marathi (मराठी)' },
  { value: 'bn', label: 'Bengali (বাংলা)' },
];

export const detectionHistory = [
  {
    id: 'DET-001',
    date: new Date('2024-07-20T10:30:00Z'),
    crop: 'Tomato',
    disease: 'Late Blight',
    confidence: '95.2%',
    image: PlaceHolderImages.find(img => img.id === 'plant-disease-1'),
  },
  {
    id: 'DET-002',
    date: new Date('2024-07-18T14:00:00Z'),
    crop: 'Potato',
    disease: 'Early Blight',
    confidence: '92.8%',
    image: PlaceHolderImages.find(img => img.id === 'plant-disease-2'),
  },
  {
    id: 'DET-003',
    date: new Date('2024-07-15T09:15:00Z'),
    crop: 'Tomato',
    disease: 'Bacterial Spot',
    confidence: '88.5%',
    image: PlaceHolderImages.find(img => img.id === 'plant-disease-3'),
  },
    {
    id: 'DET-004',
    date: new Date('2024-07-12T16:45:00Z'),
    crop: 'Bell Pepper',
    disease: 'Powdery Mildew',
    confidence: '97.1%',
    image: PlaceHolderImages.find(img => img.id === 'plant-disease-1'),
  },
  {
    id: 'DET-005',
    date: new Date('2024-07-10T11:00:00Z'),
    crop: 'Rose',
    disease: 'Black Spot',
    confidence: '99.0%',
    image: PlaceHolderImages.find(img => img.id === 'plant-disease-2'),
  },
];

export const cropTypes = [...new Set(detectionHistory.map(item => item.crop))];
