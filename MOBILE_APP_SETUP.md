# FitWithNii Mobile App Setup Guide

This guide will help you set up the React Native mobile app for FitWithNii on Android.

## Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Java Development Kit (JDK)** 11 or higher
4. **Android Studio** with Android SDK
5. **React Native CLI**

## Step 1: Install React Native CLI

```bash
npm install -g react-native-cli
```

## Step 2: Create the Mobile App

From the FitnessApp root directory:

```bash
npx react-native init FitWithNiiMobile
cd FitWithNiiMobile
```

## Step 3: Install Required Dependencies

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install react-native-image-picker
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
```

## Step 4: Configure Android

### Update android/build.gradle

Add the following to `android/build.gradle`:

```gradle
buildscript {
    ext {
        buildToolsVersion = "31.0.0"
        minSdkVersion = 21
        compileSdkVersion = 31
        targetSdkVersion = 31
    }
}
```

### Link Vector Icons

```bash
npx react-native link react-native-vector-icons
```

## Step 5: API Configuration

Create `src/config/api.js`:

```javascript
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// For physical device, use your computer's IP address:
// const API_BASE_URL = 'http://192.168.1.XXX:5000/api';

export default API_BASE_URL;
```

## Step 6: Project Structure

Organize your React Native app:

```
FitWithNiiMobile/
├── src/
│   ├── components/
│   │   ├── ClientCard.js
│   │   ├── WorkoutCard.js
│   │   └── PaymentCard.js
│   ├── screens/
│   │   ├── Dashboard.js
│   │   ├── ClientList.js
│   │   ├── ClientDetail.js
│   │   ├── WorkoutList.js
│   │   └── PaymentTracker.js
│   ├── services/
│   │   └── api.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   └── config/
│       └── api.js
├── App.js
└── index.js
```

## Step 7: Sample App.js

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Dashboard from './src/screens/Dashboard';
import ClientList from './src/screens/ClientList';
import WorkoutList from './src/screens/WorkoutList';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = 'dashboard';
            } else if (route.name === 'Clients') {
              iconName = 'people';
            } else if (route.name === 'Workouts') {
              iconName = 'fitness-center';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Clients" component={ClientList} />
        <Tab.Screen name="Workouts" component={WorkoutList} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
```

## Step 8: Sample Client List Screen

Create `src/screens/ClientList.js`:

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ClientList = ({ navigation }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const renderClient = ({ item }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
    >
      {item.profile_picture ? (
        <Image
          source={{ uri: `http://10.0.2.2:5000${item.profile_picture}` }}
          style={styles.profilePicture}
        />
      ) : (
        <View style={styles.profilePlaceholder}>
          <Text style={styles.placeholderText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
        {item.goals && <Text style={styles.clientGoals}>{item.goals}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  clientCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  placeholderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clientEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  clientGoals: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});

export default ClientList;
```

## Step 9: Running the App

### Start the Backend Server

Make sure your backend is running on port 5000:

```bash
cd /path/to/FitnessApp
npm start
```

### Start Metro Bundler

```bash
npx react-native start
```

### Run on Android

In a new terminal:

```bash
npx react-native run-android
```

## Step 10: Building APK for Distribution

### Debug APK

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK

1. Generate a keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore fitwithnii-release-key.keystore -alias fitwithnii-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Place the keystore in `android/app/`

3. Update `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=fitwithnii-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=fitwithnii-key-alias
MYAPP_RELEASE_STORE_PASSWORD=****
MYAPP_RELEASE_KEY_PASSWORD=****
```

4. Update `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

5. Build release APK:

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Features to Implement

The mobile app should mirror the web app features:

1. **Client Management**
   - View all clients with profile pictures
   - View client details
   - Add/edit client information
   - Upload profile pictures from camera or gallery

2. **Workout Management**
   - View workout library
   - Create new workouts
   - Assign workouts to clients

3. **Payment Tracking**
   - View payment records
   - See countdown to next payment
   - Add new payments
   - Push notifications for upcoming payments

4. **Progress Tracking**
   - Log workouts
   - Record body measurements
   - View progress charts

## Troubleshooting

### Common Issues

1. **Cannot connect to backend**
   - Use `10.0.2.2` for Android emulator
   - Use your computer's IP address for physical devices
   - Ensure backend is running on the correct port

2. **Build errors**
   - Clear cache: `cd android && ./gradlew clean`
   - Reset Metro: `npx react-native start --reset-cache`

3. **Image picker not working**
   - Add permissions to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   ```

## Next Steps

1. Implement push notifications for payment reminders
2. Add offline mode with local data sync
3. Implement charts for progress visualization
4. Add camera integration for before/after photos
5. Create workout timer and exercise tracking
6. Add export functionality for reports

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- [React Native Image Picker](https://github.com/react-native-image-picker/react-native-image-picker)

