import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground } from 'react-native';
import User from 'react-native-vector-icons/FontAwesome';
import Menu from 'react-native-vector-icons/AntDesign';

const Header = ({ Value, profile, userName,jobOption,navigation }) => {
  return (
    <ImageBackground source={require('./assets/login.jpg')} style={styles.header}>
      {/* Left Section - Profile */}
      <View style={styles.profileSection}>
        <View style={styles.profileContainer}>
          {profile ? (
            <Image
              source={{ uri: profile }}
              style={styles.profileImage}
            />
          ) : (
            <User name="user" color="black" size={30} />
          )}
      </View>
      <View style={styles.option}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.jobOption}>{jobOption}</Text>
        </View>
</View>
      {/* Center Section - Logo
      <View style={styles.logoSection}>
        <Image source={Value} style={styles.logo} />
      </View> */}

      {/* Right Section - Menu */}
      <TouchableOpacity style={styles.menuSection}
      >
        <Menu name="menufold" size={28} color="#ffffff" />
      </TouchableOpacity>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    width:'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff', // Change as per your theme
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 70, // Adjust the height of the header
  },
  profileSection: {
    marginLeft:10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures the profile image is clipped to the border radius
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft:20,
  },
  logoSection: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  option:{
  flexDirection:'column',
  justifyContent:'center',
  alignItems:'base-line',
  marginLeft:-10,
  },
  jobOption:{
    marginLeft:10,
    paddingLeft:10,
    color:'#ffffff',
  },
});

export default Header;
