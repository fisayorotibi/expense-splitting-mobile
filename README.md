# Expense Splitting Mobile App

A mobile application that revolutionizes how groups of friends, family, or colleagues in Nigeria manage and settle shared expenses, using React Native, Expo, and Supabase.

## Features

- **User Authentication**: Secure login, registration, and password reset
- **Group Management**: Create, edit, and manage expense groups
- **Expense Tracking**: Add and categorize expenses, with support for Nigerian Naira (₦)
- **Expense Splitting**: Automatically calculate each member's share
- **Settlement Recommendations**: Optimize transactions to minimize payments
- **Activity Feed**: Real-time updates on expense activities
- **User Profiles**: Customize user profiles and manage account settings

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Context API
- **Navigation**: React Navigation
- **UI Components**: Custom components with theming support
- **Icons**: Expo Vector Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/expense-splitting-mobile.git
cd expense-splitting-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Update the Supabase configuration in `app/services/supabase.ts` with your project credentials.

### Running the App

```bash
npm start
```

This will start the Expo development server. You can run the app on:
- iOS simulator
- Android emulator
- Physical device using the Expo Go app

## Project Structure

```
expense-splitting-mobile/
├── App.tsx              # Main application entry point
├── app/
│   ├── assets/          # Images, fonts, and other static assets
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Application screens
│   │   ├── auth/        # Authentication screens
│   │   └── main/        # Main app screens
│   ├── services/        # API and service integrations
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions and constants
├── assets/              # Expo assets directory
└── package.json         # Project dependencies
```

## Database Schema

The application uses the following database tables:

- `profiles` - User profiles and personal information
- `groups` - Expense groups
- `group_members` - Group membership details
- `expenses` - Expense records
- `expense_splits` - How expenses are split among users
- `settlements` - Payment settlements between users
- `categories` - Expense categories
- `notifications` - User notifications

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Splitwise - Inspiration for the expense splitting concept
- Supabase - Backend-as-a-Service platform
- React Native and Expo community 