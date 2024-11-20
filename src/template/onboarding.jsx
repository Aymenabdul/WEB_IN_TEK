import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import FastImage from 'react-native-fast-image';
const OnboardingScreen = ({ navigation }) => {
  return (
    <FastImage
    source={require('./assets/login.jpg')} // Replace with your background image path
    style={styles.backgroundImage} // Add style for the background image
  >
    <Onboarding
      onSkip={() => navigation.replace('LoginScreen')}
      onDone={() => navigation.replace('LoginScreen')}
      pages={[
        {
          backgroundColor: 'transparent', // Make it transparent to show the background image
          image: <FastImage source={require('./assets/logo.gif')} style={styles.image} />,
          title: <Text style={styles.Text}>wezume</Text>,
          subtitle: 'Connect, create, and grow with video. Build your professional identity, one video at a time.',
        },
      ]}
    />
  </FastImage>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
  Text: {
    color: 'white',
    fontSize: 40,
    fontWeight: '600', // You may want to use a valid value for fontWeight (e.g., 'bold', 'normal', or a number like 400).
    marginTop:-40,
},
backgroundImage:{
  flex:1,
  justifyContent:'center',
  alignItems:'center',
  width:'100%',
  height:'100%',
    },
});

export default OnboardingScreen;
