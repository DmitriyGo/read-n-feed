import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';

import { LanguageSwitcher } from './LanguageSwitcher';

export function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <LanguageSwitcher />
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerItems: {
    flex: 1,
    paddingTop: 8,
  },
});
