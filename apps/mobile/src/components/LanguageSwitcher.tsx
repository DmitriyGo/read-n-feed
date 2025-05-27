import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'uk', label: 'Українська' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language')}</Text>
      <View style={styles.languageContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageButton,
              i18n.language === lang.code && styles.activeLanguage,
            ]}
            onPress={() => i18n.changeLanguage(lang.code)}
          >
            <Text
              style={[
                styles.languageText,
                i18n.language === lang.code && styles.activeLanguageText,
              ]}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeLanguage: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  languageText: {
    fontSize: 14,
    color: '#666',
  },
  activeLanguageText: {
    color: '#fff',
  },
});
