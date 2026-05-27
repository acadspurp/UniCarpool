# UniCarpool (PUP)

React Native + Expo + Firebase carpooling app tailored for `@iskolarngbayan.pup.edu.ph`.

## Stack

- Frontend: Expo (React Native + TypeScript)
- Backend: Firebase Auth, Firestore, Cloud Functions
- Realtime: Firestore listeners + notifications scaffolding
- Maps: `react-native-maps` (Google Maps provider on Android)

## Implemented MVP Modules

- Auth: signup/login with institutional-email restriction
- Email verification gate before app access
- Core screens: Home, Post Ride, Find Ride, Ride Details, My Rides, Chat, Profile
- Frontend services: auth, profile, rides, bookings, chat, notifications
- Firestore security rules, indexes, and Firebase config
- Cloud Functions: campus claim setup, booking/message triggers, scheduled cleanup

## Project Structure

```txt
src/
  screens/
  components/
  navigation/
  services/
  store/
  hooks/
  utils/
  types/
functions/
firestore.rules
firestore.indexes.json
firebase.json
```

## Setup

1. Copy `.env.example` to `.env` and set Firebase values.
2. Start app:
   - `npm install`
   - `npm run start`
3. Prepare functions:
   - `cd functions`
   - `npm install`
   - `npm run build`

## Firebase Notes

- Set Authentication: Email/Password provider.
- Deploy rules/indexes/functions:
  - `firebase deploy --only firestore:rules,firestore:indexes,functions`
- For strict enforcement, keep Firestore rules requiring verified auth and campus claim/domain.
