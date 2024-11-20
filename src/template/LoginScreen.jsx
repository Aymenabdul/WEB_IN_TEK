import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import axios from 'axios'; // Import Axios
import { WebView } from 'react-native-webview'; // Import WebView for LinkedIn OAuth
import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [loading, setLoading] = useState(false);


  // async storage
  // const saveStorage = async (userId) => {
  //   try{
  //     await AsyncStorage.setItem('userId', userId);
  //   } catch(error){
  //     console.log(error);
  //   }
  // }


  // Function to handle standard login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Both email and password are required!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://172.20.10.4:8080/api/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );


      // const userId = response.data.userId
      const { firstName, jobOption, userId, profilepic,industry } = response.data;
console.log('====================================');
console.log(response.data);
console.log('====================================');
      if (firstName && jobOption) {
        // Check jobOption to navigate to the appropriate screen
        if (jobOption === 'Employee' || jobOption === 'entrepreneur') {
          // await saveStorage(userId)
          navigation.navigate('home1', { firstName, jobOption, userId, profilepic,industry });
        } else if (jobOption === 'employer' || jobOption === 'investor') {
          navigation.navigate('home1', { firstName, jobOption, userId, profilepic,industry });
        }
        setEmail('');
        setPassword('');
      } else {
        Alert.alert('Error', 'User data is incomplete.');
      }
    } catch (error) {
      console.log(error);
      console.error('Login failed:', error.response ? error.response.data : error.message);
      Alert.alert('Login Failed', 'Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  // Function to initiate LinkedIn login
  const handleLinkedInLogin = () => {
    setShowLinkedInModal(true);
  };

  // Custom function to extract query parameters from a URL
  const getQueryParams = (url) => {
    const params = {};
    const urlParts = url.split('?');
    if (urlParts.length > 1) {
      const queryString = urlParts[1];
      const pairs = queryString.split('&');
      pairs.forEach((pair) => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }
    return params;
  };

  // Function to handle WebView navigation state changes
 // Function to handle WebView navigation state changes
const handleWebViewNavigationStateChange = async (navState) => {
  if (navState.url.startsWith('https://www.linkedin.com/developers/tools/oauth/redirect')) { // Replace with your actual redirect URI
    const params = getQueryParams(navState.url);
    const code = params.code;

    if (code) {
      setShowLinkedInModal(false); // Close the LinkedIn modal
      setLoading(true);
      try {
        const response = await axios.post('http://172.20.10.4:8080/auth/linkedin', { code });
        const { given_name, email } = response.data;
        console.log('====================================');
        console.log(response.data);
        console.log('====================================');
        if (given_name && email) {
          console.log('LinkedIn User Details:', { given_name, email });
          // Navigate to HomeScreen with user details
          navigation.navigate('HomeScreen', { firstName: given_name, email });

          // Refresh the page (reloading the HomeScreen)
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeScreen', params: { firstName: given_name, email } }],
          });
        } else {
          Alert.alert('Error', 'User data is incomplete.');
        }
      } catch (error) {
        console.error('Error during LinkedIn login:', error.response ? error.response.data : error.message);
        Alert.alert('Login Failed', error.response ? error.response.data : 'Could not retrieve user data.');
      } finally {
        setLoading(false);
      }
    }
  }
};

  return (
    <FastImage
        style={styles.backgroundImage}
        source={require('./assets/onbor.gif')}
        resizeMode={FastImage.resizeMode.cover}
      >
    <Image style={styles.img} source={require('./assets/Png-01.png')} />
    <LinearGradient colors={['#d3e4f6','#a1d1ff']} style={styles.ModelGradient}>
    <Image style={styles.img2} source={require('./assets/logo.png')}/>
    <Text style={styles.loginhead}>Login</Text>
    {/* <Text style={styles.loginsub}>Welcome back , you've been missed!</Text> */}
    <TouchableOpacity
        style={styles.linkedinButton}
        onPress={handleLinkedInLogin}
      >
        <Text style={styles.linkedinButtonText}>LinkedIn</Text>
      </TouchableOpacity>

      <Modal
        visible={showLinkedInModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <WebView
            source={{
              uri: 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=869zn5otx0ejyt&redirect_uri=https://www.linkedin.com/developers/tools/oauth/redirect&scope=profile%20email%20openid', // Replace with your values
            }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            startInLoadingState={true}
          />

          <Button title="Close" onPress={() => setShowLinkedInModal(false)} />
        </View>
      </Modal>


    <View style={styles.dividerContainer}>
  <View style={styles.horizontalLine} />
  <Text style={styles.dividerText}>or Login with</Text>
  <View style={styles.horizontalLine} />
</View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#000"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#000"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

<LinearGradient colors={['#70bdff','#2e80d8']} style={styles.btn}>
        <TouchableOpacity style={styles.signupButton} onPress={handleLogin}>
      <Text style={styles.signupButtonText}>Login</Text>
    </TouchableOpacity>
    </LinearGradient>
      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.createAccount}>Don't Have An Account ? <Text style={{color:'blue'}}> SignUp..</Text></Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}
    </LinearGradient>
    </FastImage>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  backgroundImage:{
flex:1,
justifyContent:'center',
alignItems:'center',
width:'100%',
height:'100%',
  },
  img:{
    width:300,
    height:350,
    marginBottom:-70,
  },
  ModelGradient: {
    width:'90%',
    borderColor:'#fff',
    borderWidth:1,
    borderStyle:'solid',
    paddingHorizontal:15,
    paddingVertical:60,
    backgroundColor: 'rgba(255, 255, 255,0.7)',
    borderRadius:10,
    marginTop:-50,
    elevation:5,
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#187bcd',
    padding: 10,
    marginBottom: 10,
    borderRadius:7,
    color:'black',
    backgroundColor:'#fff',
  },
  createAccount: {
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
  },
  linkedinButton: {
    backgroundColor: '#ffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop:20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  linkedinButtonText: {
    color: '#0077B5',
    fontSize: 20,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  img2:{
    width:200,
    height:100,
    marginTop:-60,
    marginHorizontal:65,
  },
  loginhead:{
    width:'100%',
    marginHorizontal:145,
    marginTop:-41,
    marginBottom:10,
    fontSize:24,
    fontWeight:'500',
    color:'#4e4b51',
  },
  loginsub:{
    width:'100%',
    marginLeft:40,
    marginTop:7,
    marginBottom:7,
  },
  signupButton:{
   height:40,
   justifyContent:'center',
   alignItems:'center',
   marginHorizontal:20,
   padding:7,
  },
  signupButtonText:{
    fontWeight:'500',
    color:'#ffffff',
    fontSize:20,
  },
  btn:{
    width:150,
    marginHorizontal:100,
    borderRadius:10,
    elevation:5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  horizontalLine: {
    flex: 1,
    height:2,
    backgroundColor: '#0B0705',
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 16,
    color: '#555',
  },
});
