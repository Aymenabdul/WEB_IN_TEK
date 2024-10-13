import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';


const SignupScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [jobOption, setJobOption] = useState('');

  const handleSignup = () => {
    // Logic for handling signup with entered data
    console.log('Signup with:', firstName, lastName, email, phoneNumber, password, confirmPassword, jobOption);
  };

  const handleLinkedInSignup = () => {
    // Logic for LinkedIn integration (e.g., OAuth)
    console.log('Continue with LinkedIn');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Select Job</Text>
      <Picker
        selectedValue={jobOption}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) => setJobOption(itemValue)}
      >
        <Picker.Item label="Select your job" value="" />
        <Picker.Item label="Employer" value="employer" />
        <Picker.Item label="Employee" value="employee" />
        <Picker.Item label="Entrepreneur" value="entrepreneur" />
        <Picker.Item label="Investor" value="investor" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button title="Create Account" onPress={handleSignup} />

      <TouchableOpacity style={styles.linkedinButton} onPress={handleLinkedInSignup}>
        <Text style={styles.linkedinText}>Continue with LinkedIn</Text>
      </TouchableOpacity>
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
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  linkedinButton: {
    marginTop: 20,
    backgroundColor: '#2867B2',  // LinkedIn's brand color
    padding: 15,
    borderRadius: 5,
  },
  linkedinText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SignupScreen;
