import React, { useState } from 'react';
import { Image, TextInput, Button, StyleSheet, Text, Alert, ActivityIndicator,ScrollView,TouchableOpacity  } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
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
      const response = await axios.post('http://172.20.10.3:8080/users', userData, {
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
    <LinearGradient colors={['#70bdff','#2e80d8']} style={styles.linearGradient}>
     <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
    <Image style={styles.img} source={require('./assets/Png-02.png')} />
    <LinearGradient colors={['#d3e4f6','#a1d1ff']} style={styles.container}>
    <Image style={styles.img2} source={require('./assets/logo.png')}/>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.loginsub}>Create an account So you can explore all the existing jobs.</Text>
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
        <Picker.Item style={{fontSize:12}} label="Select your job" value="" />
        <Picker.Item style={{fontSize:12}} label="Employer" value="employer" />
        <Picker.Item style={{fontSize:12}} label="Employee" value="employee" />
        <Picker.Item style={{fontSize:12}} label="Entrepreneur" value="entrepreneur" />
        <Picker.Item style={{fontSize:12}} label="Investor" value="investor" />
      </Picker>

      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#000" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#000" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      {/* Show loading indicator while signup is processing */}
      {loading ? (
        <ActivityIndicator size="large" color="#0077B5" style={styles.loadingIndicator} />
      ) : (
        <LinearGradient colors={['#70bdff','#2e80d8']} style={styles.btn}>
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
      <Text style={styles.signupButtonText}>Sign Up</Text>
    </TouchableOpacity>
    </LinearGradient>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.logAccount}>Already Have An Account ?<Text style={{color:'blue'}}> Login..</Text></Text>
      </TouchableOpacity>
</LinearGradient>
 </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient:{
    flex:1,
justifyContent:'center',
alignItems:'center',
width:'100%',
height:'100%',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  img:{
    width:300,
    height:320,
    marginBottom:-110,
    marginTop:-30,
  },
  img2:{
    width:'100%',
    height:100,
    marginTop:-60,
  },
  container: {
    width:'90%',
    borderColor:'#fff',
    borderWidth:1,
    borderStyle:'solid',
    paddingLeft:15,
    paddingRight:10,
    paddingVertical:60,
    borderRadius:10,
    marginTop:-50,
    // marginLeft:-15,
    elevation:5,
  },
  title: {
    fontSize:20,
    marginBottom:8,
    textAlign: 'center',
    marginTop:-40,
    color:'#4e4b51',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingLeft:15,
    color:'black',
    backgroundColor:'#ffffff',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color:'black',
  },
  picker: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#fffff',
    marginBottom: 20,
    color:'black',
    backgroundColor:'#ffffff',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  loginsub:{
    textAlign:'center',
    marginBottom:10,
  },
  logAccount:{
    marginBottom:-40,
    marginTop:15,
    textAlign:'center',
    color:'#000',
  },
  signupButton:{
   height:40,
   justifyContent:'center',
   alignItems:'center',
   padding:7,
   marginHorizontal:10,
  },
  signupButtonText:{
    fontWeight:'500',
    color:'#ffffff',
    fontSize:20,
  },
  btn:{
    width:150,
    marginHorizontal:90,
    borderRadius:10,
    elevation:5,
  },
});

export default SignupScreen;
