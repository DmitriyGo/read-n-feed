import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';

import { CustomDrawerContent } from './components/CustomDrawerContent';
import i18n from './i18n';
import { BookReaderScreen } from './screens/BookReaderScreen';
import { BookRequestsScreen } from './screens/BookRequestsScreen';
import { CreateBookRequestScreen } from './screens/CreateBookRequestScreen';
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
      source={require('../assets/book.png')}
    />
  );
}

function DrawerNavigator() {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
          title: t('common.home'),
          headerTitle: () => <LogoTitle />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={HomeProfile}
        options={{
          title: t('common.profile'),
        }}
      />
      <Drawer.Screen
        name="BookRequests"
        component={BookRequestsScreen}
        options={{
          title: t('common.bookRequests'),
        }}
      />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen
            name="CreateBookRequest"
            component={CreateBookRequestScreen}
            options={{
              headerShown: true,
              title: 'Create Book Request',
              headerStyle: {
                backgroundColor: '#4a90e2',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="BookReader"
            component={BookReaderScreen}
            options={{
              headerShown: true,
              title: 'Book Reader',
              headerStyle: {
                backgroundColor: '#4a90e2',
              },
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeLogin"
        component={HomeLogin}
        options={{ headerTitle: () => <LogoTitle />, title: 'Вхід' }}
      />
      <Stack.Screen
        name="HomeRegister"
        component={HomeRegister}
        options={{ headerTitle: () => <LogoTitle />, title: 'Реєстрація' }}
      />
    </Stack.Navigator>
  );
}

export default App;
