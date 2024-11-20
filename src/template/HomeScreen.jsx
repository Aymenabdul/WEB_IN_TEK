import React from 'react';
import { View, Text, Button, StyleSheet, Alert,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ route }) => {
  const { firstName, jobOption } = route.params; // Destructure props to get user info
  const navigation = useNavigation();

  const jobOptionsMap = {
    employee: 'Employee Page',
    employer: 'Employer Page',
    entrepreneur: 'Entrepreneur Page',
    investor: 'Investor Page',
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          // Navigate back to the Login screen
          navigation.replace('LoginScreen'); // Replace with the correct route name for your Login screen
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, {firstName}!</Text>
        <Text style={styles.jobText}>{jobOptionsMap[jobOption]}</Text>
      </View>

      <Text style={styles.contentText}>This is your home screen.</Text>
      <View style={styles.container}>
      <Image source={require('./assets/video.jpg')} style={styles.fullScreenImage}/>
    
      {/* Logout button */}
      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#FF6347" />
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   justifyContent: 'flex-start',
  //   padding: 16,
  //   backgroundColor: '#fff',
  // },
  container: {
    flex: 1,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // or 'contain' if you want the entire image visible
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  jobText: {
    fontSize: 18,
    color: '#555',
  },
  contentText: {
    fontSize: 16,
    marginTop: 20,
  },
  logoutButton: {
    marginTop:0,
    alignSelf: 'center',
    width: '50%',
  },
});

export default HomeScreen;
