import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import {navigation} from '@react-navigation/native';
import User from 'react-native-vector-icons/FontAwesome';
import Menu from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const Header = ({Value, profile, userName, jobOption,industry}) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useState(new Animated.Value(-300))[0];
  const SlidingMenu = () => {
    const [slideAnim] = useState(new Animated.Value(-screenHeight)); // Initially hide menu off-screen
  }  
  const toggleMenu = () => {
    if (menuVisible) {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -300, // Move back off-screen
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      // Slide in
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0, // Bring into view
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  return (
    <ImageBackground
      source={require('./assets/login.jpg')}
      style={styles.header}>
      {/* Left Section - Profile */}
      <View style={styles.profileSection}>
      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <View style={styles.profileContainer}>
          {profile ? (
            <Image source={{uri: profile}} style={styles.profileImage} />
          ) : (
            <User name="user" color="#ffffff" size={30} />
          )}
        </View>
        </TouchableOpacity>
        <View style={styles.option}>
          <Text style={styles.userName}>{userName}</Text>
          {/* <Text style={styles.jobOption}>{industry}</Text> */}
        </View>
      </View>
        <TouchableOpacity style={styles.menuSection}
        onPress={() => navigation.navigate('profile')}>
          <FontAwesome name="search" size={25} color="#ffffff" />
        </TouchableOpacity>

      {/* Right Section - Menu */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Menu name="menufold" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Sliding Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            height:screenHeight,
            transform: [{translateX: slideAnim}], // Sliding animation
          },
        ]}>
        <Text style={styles.menuItem}>Option 1</Text>
        <Text style={styles.menuItem}>Option 2</Text>
        <Text style={styles.menuItem}>Option 3</Text>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    width: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 70,
  },
  profileSection: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:-10,
  },
  profileContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation:20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 20,
  },
  menuSection: {
    padding: 10,
    marginLeft:160,
    marginTop:-10,
  },
  option: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginLeft: -10,
  },
  jobOption: {
    marginLeft: 10,
    paddingLeft: 10,
    color: '#ffffff',
  },
  menuContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    backgroundColor: 'lightblue',
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuItem: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 10,
  },
  menuButton:{
    marginTop:-10,
  }
});

export default Header;
