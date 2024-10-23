import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = ({ route }) => {
  const { firstName, jobOption } = route.params; // Destructure props to get user info

  const jobOptionsMap = {
    employee: 'Employee Page',
    employer: 'Employer Page',
    entrepreneur: 'Entrepreneur Page',
    investor: 'Investor Page',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, {firstName}!</Text>
        <Text style={styles.jobText}>{jobOptionsMap[jobOption]}</Text>
      </View>

      {/* Add additional content for the home screen here */}
      <Text style={styles.contentText}>This is your home screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
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
    color:'#000'
  },
  jobText: {
    fontSize: 18,
    color: '#555',
  },
  contentText: {
    fontSize: 16,
    marginTop: 20,
  },
});

export default HomeScreen;
