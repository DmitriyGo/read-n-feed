import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Image } from 'react-native';

import HomeLogin from './screens/HomeLogin';
import HomeProfile from './screens/HomeProfile';
import HomeRegister from './screens/HomeRegister';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function LogoTitle() {
  return (
    <Image
      style={{ width: 45, height: 45 }}
      source={require('../assets/gear.png')}
    />
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4a90e2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#fff',
          width: 240,
        },
        drawerActiveTintColor: '#4a90e2',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: () => <LogoTitle />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={HomeProfile}
        options={{
          title: 'Profile',
        }}
      />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthNavigator() {
  return (
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
    </Stack.Navigator>
  );
}

export default App;
