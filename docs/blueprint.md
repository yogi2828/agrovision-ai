# **App Name**: AgroVoice AI

## Core Features:

- AI-Powered Disease Detection: Allows users to upload plant images or use voice queries to detect plant diseases using the Gemini-2.5-Flash model, providing detailed analysis and treatment recommendations.
- Multilingual Voice Assistant: Implements a voice-enabled AI chatbot supporting multiple Indian languages (English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali) for answering predefined questions about plant care and diseases.
- User Authentication and Data Storage: Enables users to sign in securely via Google Sign-In, storing user preferences, interaction history, and language settings in Firestore.
- Dynamic FAQ Expansion tool: Leverages Gemini to provide intelligent reasoning regarding appropriate response given the selected predefined question. It then generates output appropriate to the request.
- History Tracking: Maintains a history of disease detection results (text only) and chatbot conversations for each user, allowing users to review past interactions.
- Language and Voice Settings: Provides a settings page where users can select their preferred language, enable/disable voice input/output, and adjust voice speed.
- Profile Management: Allows users to manage their profile information, update preferences, and securely log out.

## Style Guidelines:

- Primary color: Forest green (#388E3C), evoking plant life and nature.
- Background color: Light green (#E8F5E9), providing a calming and natural feel, complementing the primary color.
- Accent color: Burnt orange (#FF7043) for call-to-action buttons and highlights, contrasting with the green to draw attention.
- Headline font: 'Belleza', a humanist sans-serif, lends a fashionable and artistic touch to headlines. Body font: 'Alegreya', a humanist serif, offers elegance and readability.
- Code font: 'Source Code Pro' for displaying any code snippets (such as Firebase data structure).
- Use nature-inspired icons, with rounded edges and filled style for better readability. These icons will visually represent diseases, plants and treatments in the UI.
- Implement a responsive and user-friendly layout with a sticky, animated navbar. Utilize grid and card-based designs to present features and information effectively.
- Incorporate subtle animations, such as transitions on button hovers and loading screens, to enhance user experience.