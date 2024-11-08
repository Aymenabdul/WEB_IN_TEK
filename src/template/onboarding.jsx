import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      onSkip={() => navigation.replace('LoginScreen')} // Navigate to home screen after skipping
      onDone={() => navigation.replace('LoginScreen')} // Navigate to home screen after completion
      pages={[
        {
          backgroundColor: '#187bcd',
          image: <Image source={require('./assets/circle.png')} style={styles.image} />,
          title: <Text style={styles.Text}>Wezume</Text>,
          subtitle:'Connect, create, and grow with video.Build your professional identity, one video at a time.',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  Text: {
    color: 'white',
    fontSize: 40,
    fontWeight: '600', // You may want to use a valid value for fontWeight (e.g., 'bold', 'normal', or a number like 400).
    marginTop:-40,
},
});

export default OnboardingScreen;
