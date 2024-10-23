import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SignupScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobOption, setJobOption] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading indicator

  const navigation = useNavigation();

  const validateInputs = () => {
    if (!firstName || !lastName || !email || !phoneNumber || !jobOption || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'All fields are required!');
      return false;
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Invalid email format!');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match!');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) {return;}

    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      jobOption,
      password,
    };

    setLoading(true); // Show loading indicator

    try {
      const response = await axios.post('http://192.168.1.2:8080/users', userData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log('User created:', response.data);
      Alert.alert('Success', 'Signup successful!', [{
        text: 'OK',
        onPress: () => {
          // Reset form fields
          navigation.navigate('LoginScreen');
          setFirstName('');
          setLastName('');
          setEmail('');
          setPhoneNumber('');
          setJobOption('');
          setPassword('');
          setConfirmPassword('');
        },
      }]);
    } catch (error) {
      console.error('Signup failed:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(true); // Hide loading indicator
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#000" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#000" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#000" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#000" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

      <Text style={styles.label}>Select Job</Text>
      <Picker
        selectedValue={jobOption}
        style={styles.picker}
        onValueChange={(itemValue) => setJobOption(itemValue)}
      >
        <Picker.Item label="Select your job" value="" />
        <Picker.Item label="Employer" value="employer" />
        <Picker.Item label="Employee" value="employee" />
        <Picker.Item label="Entrepreneur" value="entrepreneur" />
        <Picker.Item label="Investor" value="investor" />
      </Picker>

      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#000" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#000" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      {/* Show loading indicator while signup is processing */}
      {loading ? (
        <ActivityIndicator size="large" color="#0077B5" style={styles.loadingIndicator} />
      ) : (
        <Button title="Create Account" onPress={handleSignup} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color:'black',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color:'black',
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    color:'black',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});

export default SignupScreen;
