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
} from 'react-native';
import axios from 'axios'; // Import Axios
import { WebView } from 'react-native-webview'; // Import WebView for LinkedIn OAuth

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to handle standard login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Both email and password are required!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://192.168.1.2:8080/api/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { firstName, jobOption } = response.data;

      if (firstName && jobOption) {
        navigation.navigate('HomeScreen', { firstName, jobOption });
        setEmail('');
      setPassword('');
      } else {
        Alert.alert('Error', 'User data is incomplete.');
      }
    } catch (error) {
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
        const response = await axios.post('http://192.168.1.2:8080/auth/linkedin', { code });
        const { given_name, email } = response.data;
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <Button title="Login" onPress={handleLogin} disabled={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.createAccount}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkedinButton}
        onPress={handleLinkedInLogin}
      >
        <Text style={styles.linkedinButtonText}>Login with LinkedIn</Text>
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

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}
    </View>
  );
};

export default LoginScreen;

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
  createAccount: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
  },
  linkedinButton: {
    backgroundColor: '#0077B5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  linkedinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});
