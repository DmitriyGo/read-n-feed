import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Image } from 'react-native';

import HomeLogin from './screens/HomeLogin';
import HomeProfile from './screens/HomeProfile';
import HomeRegister from './screens/HomeRegister';

const Stack = createStackNavigator();

function LogoTitle() {
  return (
    <Image
      style={{ width: 45, height: 45 }}
      source={require('../assets/gear.png')}
    />
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeLogin"
          component={HomeLogin}
          options={{ headerTitle: () => <LogoTitle /> }}
        />
        <Stack.Screen
          name="HomeRegister"
          component={HomeRegister}
          options={{ title: 'Register' }}
        />
        <Stack.Screen
          name="HomeProfile"
          component={HomeProfile}
          options={{ title: 'Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
