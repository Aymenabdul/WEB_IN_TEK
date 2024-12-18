import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  Linking,
} from 'react-native';
import axios from 'axios';
import {Buffer} from 'buffer';
import Video from 'react-native-video';
import Header from './header';
import {useRoute} from '@react-navigation/native';
import Ant from 'react-native-vector-icons/AntDesign';
import Shares from 'react-native-vector-icons/Entypo';
import Like from 'react-native-vector-icons/Foundation';
import Phone from 'react-native-vector-icons/FontAwesome6';
import Whatsapp from 'react-native-vector-icons/FontAwesome';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Share from 'react-native-share'; // Import the share module
import { PermissionsAndroid, Platform } from 'react-native';
import notifee from '@notifee/react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [videourl, setVideoUrl] = useState([]); // Array of video objects
  const [hasVideo, setHasVideo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);
  // Add separate states for Modal
  const [modalProfileImage, setModalProfileImage] = useState(null);
  const [modalFirstName, setModalFirstName] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState({});
  const [videoId, setVideoId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sheetRef = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState(null); // To store owner's phone number

  const route = useRoute(); // Access route parameters
  

  // Check if filtered videos are passed in route params
  const {filteredVideos, firstName, industry, userId} = route.params;

  const requestCallPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          {
            title: 'Phone Call Permission',
            message: 'This app needs access to make phone calls.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const fetchPhoneNumber = () => {
    console.log("Fetching phone number for videoId:", videoId); // Log videoId to ensure it's correct
    axios
      .get(`http://192.168.1.9:8080/api/videos/getOwnerByVideoId/${videoId}`)
      .then(response => {
        console.log('API Response:', response); // Log the entire response
        if (response.data && response.data.phoneNumber) {
          setPhoneNumber(response.data.phoneNumber);
          console.log('Phone number found:', response.data.phoneNumber); // Log the phone number
        } else {
          Alert.alert('Error', 'Owner not found or no phone number available.');
        }
      })
      .catch(error => {
        console.error('Error fetching owner data:', error); // Log the error
        Alert.alert('Error', 'Failed to fetch owner details.');
      });
};

const makeCall = () => {
  console.log("videoId in makeCall:", videoId);  // Log the videoId being passed
  if (phoneNumber) {
    console.log('Making call to:', phoneNumber);
    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      console.error('Error making call:', err);
      Alert.alert('Error', 'Call failed. Make sure the app has permission to make calls.');
    });
  } else {
    console.log("No phone number, fetching phone number...");  // Log that we're fetching the phone number
  }
  fetchPhoneNumber(videoId);
};

// Function to send a WhatsApp message
const sendWhatsappMessage = () => {
  console.log('sendWhatsappMessage function called');  // Log when the function is called

  if (phoneNumber) {
    const message = `Hello, ${modalFirstName} it's nice to connect with you.`; // Customize your message
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    console.log('Phone number:', phoneNumber);  // Log the phone number
    console.log('Message:', message);  // Log the message
    console.log('Constructed URL:', url);  // Log the URL being used for the WhatsApp message

    Linking.openURL(url).catch(err => {
      console.error('Error sending WhatsApp message:', err);
      Alert.alert('Error', 'Failed to send message. Make sure WhatsApp is installed and the phone number is correct.');
    });
  } else {
    console.log("No phone number, fetching phone number...");  // Log that we're fetching the phone number
  }
  fetchPhoneNumber(videoId);
};

  const handleGesture = event => {
    const {translationY} = event.nativeEvent;

    // Swipe up to go to the next video
    if (translationY < -100) {
      // Swiped up (threshold can be adjusted)
      moveToNextVideo();
    }

    // Swipe down to go to the previous video
    if (translationY > 100) {
      // Swiped down (threshold can be adjusted)
      moveToPreviousVideo();
    }
  };

  const moveToNextVideo = () => {
    if (currentIndex < videosToDisplay.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex); // Move to the next video
      setSelectedVideoUri(videosToDisplay[nextIndex].uri);
      // Update the profile image and name for the next video
      setModalProfileImage(videosToDisplay[nextIndex].modelprofileImage); // Assuming each video has a profile image
      setModalFirstName(videosToDisplay[nextIndex].modelfirstName); // Assuming each video has a firstName
    }
  };

  const moveToPreviousVideo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex); // Move to the previous video
      setSelectedVideoUri(videosToDisplay[prevIndex].uri);

      // Update the profile image and name for the previous video
      setModalProfileImage(videosToDisplay[prevIndex].modalProfileImage); // Assuming each video has a profile image
      setModalFirstName(videosToDisplay[prevIndex].modelfirstName); // Assuming each video has a firstName
    }
  };

  // useEffect(() => {
  //   console.log('selectedVideoUri:', selectedVideoUri);
  //   console.log('currentIndex:', currentIndex);
  //   console.log('videosToDisplay:', videosToDisplay);

  //   if (
  //     selectedVideoUri &&
  //     currentIndex >= 0 &&
  //     currentIndex < videosToDisplay.length
  //   ) {
  //     const currentVideo = videosToDisplay[currentIndex];
  //     console.log('currentVideo:', currentVideo);

  //     // Fallback in case the properties are missing
  //     const profileImage =
  //       currentVideo?.modelProfileImage || 'defaultProfileImageUrl';
  //     const firstName = currentVideo?.modelFirstName || 'Default Name';

  //     setModalProfileImage(profileImage);
  //     setModalFirstName(firstName);
  //   }
  // }, [selectedVideoUri, currentIndex, videosToDisplay]);

  const fetchLikeStatus = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.9:8080/api/videos/likes/status`,
        {
          params: {userId},
        },
      );
      const likeStatus = response.data; // Expecting { videoId: true/false }
      setIsLiked(likeStatus); // Set initial like status
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  useEffect(() => {
    if (!filteredVideos) {
      fetchVideos();
      fetchProfilePic(userId); // Fetch all videos if no filteredVideos are provided
    }
    fetchProfilePic(userId);
  }, [filteredVideos, userId]);

  const fetchLikeCount = videoId => {
    console.log('Fetching like count for videoId:', videoId); // Check if the videoId is correct
    axios
      .get(`http://192.168.1.9:8080/api/videos/${videoId}/like-count`)
      .then(response => {
        console.log('API response:', response.data);
        setLikeCount(response.data); // Update state with the correct count
      })
      .catch(error => {
        console.error('Error fetching like count:', error);
      });
  };

  const handleLike = async () => {
    const newLikedState = !isLiked[videoId]; // Toggle the like status
    setIsLiked(prevState => ({
      ...prevState,
      [videoId]: newLikedState,
    }));
  
    try {
      if (newLikedState) {
        // If liked, send like request
        await axios.post(
          `http://192.168.1.9:8080/api/videos/${videoId}/like`,
          null,
          {params: {userId}},
        );
        setLikeCount(prevCount => prevCount + 1); // Increment like count
  
        // Trigger notification for video owner (after the like request is successful)
        await saveLikeNotification(videoId, firstName);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const saveLikeNotification = async (videoId, firstName) => {
    try {
      const notifications = JSON.parse(await AsyncStorage.getItem('likeNotifications')) || [];
      notifications.push({ videoId,firstName, timestamp: Date.now() });
      await AsyncStorage.setItem('likeNotifications', JSON.stringify(notifications));
      console.log('====================================');
      console.log(firstName);
      console.log('====================================');
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  // Handle dislike action
  const handleDislike = async () => {
    const newLikedState = !isLiked[videoId]; // Toggle the dislike status (opposite of like)
    setIsLiked(prevState => ({
      ...prevState,
      [videoId]: newLikedState,
    }));

    try {
      if (!newLikedState) {
        // If disliked, send dislike request
        await axios.post(
          `http://192.168.1.9:8080/api/videos/${videoId}/dislike`,
          null,
          {params: {userId}},
        );
        setLikeCount(prevCount => prevCount - 1); // Decrement like count (dislike removes like)
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  const openModal = async (uri, videoId) => {
    console.log('Video ID:', videoId); // Debugging: Check if videoId is passed correctly
    setVideoId(videoId);

    try {
      // Fetch user details by videoId
      const response = await axios.get(
        `http://192.168.1.9:8080/api/videos/user/${videoId}/details`,
      );

      // Log response data for debugging
      // console.log('Fetched user details:', response.data);

      const {firstName: fetchedFirstName, profileImage: fetchedProfileImage} =
        response.data;

      // Convert profile image to Base64 with the correct MIME type prefix
      // Ensure the MIME type matches the returned profile image type (JPEG, PNG, etc.)
      const base64Image = `data:image/jpeg;base64,${fetchedProfileImage}`;

      // Set modal-specific states
      setModalFirstName(fetchedFirstName);
      setModalProfileImage(base64Image);
    } catch (error) {
      console.error('Error fetching user details:', error);

      // Reset on error to prevent showing stale data
      setModalFirstName('');
      setModalProfileImage(null);
    } finally {
      // Set modal visibility and selected video URI
      fetchLikeCount(videoId);
      fetchLikeStatus(videoId);
      setSelectedVideoUri(uri);
      setIsModalVisible(true);
    }
  };

  const fetchProfilePic = async userId => {
    try {
      const response = await axios.get(
        `http://192.168.1.9:8080/users/user/${userId}/profilepic`,
        {
          responseType: 'arraybuffer',
        },
      );
      if (response.data) {
        const base64Image = `data:image/jpeg;base64,${Buffer.from(
          response.data,
          'binary',
        ).toString('base64')}`;
        setProfileImage(base64Image);
      } else {
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error fetching profile pic:', error);
      setProfileImage(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://192.168.1.9:8080/api/videos/videos');
      if (!response.ok)
        throw new Error(`Failed to fetch videos: ${response.statusText}`);

      const videoData = await response.json();
      console.log('Video Data:', videoData); // Log to check response structure

      if (Array.isArray(videoData) && videoData.length > 0) {
        const videoURIs = videoData.map(video => ({
          id: video.id,
          title: video.title || 'Untitled Video',
          uri: `http://192.168.1.9:8080/api/videos/user/${video.userId}`,
        }));
        console.log('Generated URIs:', videoURIs); // Log generated URLs
        setVideoUrl(videoURIs);
        setHasVideo(true);
      } else {
        console.warn('No videos available');
        setVideoUrl([]);
        setHasVideo(false);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setHasVideo(false);
    } finally {
      setLoading(false);
    }
  };
  const closeModal = () => {
    // fetchLikeCount();
    //   fetchLikeStatus();
    setIsModalVisible(false);
    setSelectedVideoUri(null);
  };
  const shareOption = async () => {
    const share = {
      title: 'Share User Video',
      message: `Check out this video shared by ${firstName}`,
      url: selectedVideoUri, // Must be a valid URI
    };

    try {
      const shareResponse = await Share.open(share);
      console.log('Share successful:', shareResponse);
    } catch (error) {
    }
  };
  // Use filteredVideos if passed, otherwise use fetched videos
  const videosToDisplay = filteredVideos
    ? filteredVideos.map(video => ({
        ...video,
        uri: `http://192.168.1.9:8080/api/videos/user/${video.id}`, // Ensure each filtered video has its URI
      }))
    : videourl;

  return (
    <View style={styles.container}>
      <Header
        profile={profileImage}
        userName={firstName}
        jobOption={industry}
      />
      <ImageBackground
        source={require('./assets/login.jpg')}
        style={styles.imageBackground}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : videosToDisplay?.length > 0 ? (
          <FlatList
            data={videosToDisplay}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => openModal(item.uri, item.id)} // Pass video URI and ID
                style={styles.videoItem}>
                <Video
                  source={{uri: item.uri}}
                  style={styles.videoPlayer}
                  resizeMode="contain"
                  onError={error =>
                    console.error('Video playback error:', error)
                  }
                />
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id.toString()}
            numColumns={4}
            contentContainerStyle={styles.videoList}
          />
        ) : (
          <Text style={styles.emptyListText}>No videos available</Text>
        )}
      </ImageBackground>

      {/* Modal for full-screen video */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}>
        <GestureHandlerRootView>
          <PanGestureHandler onGestureEvent={handleGesture}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.userDetails}>
                  {modalProfileImage && (
                    <Image
                      source={{uri: modalProfileImage}}
                      style={styles.profileImage}
                    />
                  )}
                  <Text style={styles.userName}>{modalFirstName}</Text>
                </View>
                <View style={styles.fullScreen}>
                  <Video
                    source={{uri: selectedVideoUri}}
                    style={styles.fullScreenVideo}
                    controls
                    resizeMode="cover"
                    onError={error =>
                      console.error('Video playback error:', error)
                    }
                  />
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.buttoncls}>
                    <Ant name={'arrowleft'} style={styles.buttoncls} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      isLiked[videoId] ? handleDislike() : handleLike()
                    }>
                    <Like
                      name={'heart'}
                      style={[
                        styles.buttonheart,
                        {color: isLiked[videoId] ? 'red' : 'white'}, // Dynamically change color
                      ]}
                    />
                    <Text style={styles.count}>{likeCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={shareOption}>
                    <Shares name={'share'} style={styles.buttonshare} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={sendWhatsappMessage}>
                    <Whatsapp name={'whatsapp'} style={styles.buttonmsg} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={makeCall}>
                    <Phone name={'phone-volume'} style={styles.buttonphone} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  videoItem: {
    flex: 1,
    margin: 1,
    marginTop:-30,
    marginBottom:5, // Spacing between videos
  },
  videoPlayer: {
    height: 230,
    width: '100%', // Adjust width for a uniform layout
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  videoList: {
    paddingHorizontal:2, // Padding around the list
    paddingTop: 10,
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark background for the modal
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullScreen: {
    flex: 1,
    flexDirection: 'row',
  },
  userDetails: {
    position: 'absolute',
    top: '85%',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1, // Ensure it appears above the video
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
    elevation: 10,
  },
  userName: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    elevation: 10,
  },
  buttoncls: {
    color: '#ffffff',
    position: 'absolute',
    top: 15,
    right: '89%',
    fontSize: 24,
    fontWeight: '900',
  },
  buttonheart: {
    position: 'absolute',
    top: '62%',
    right: '10%',
    color: '#ffffff',
    paddingRight: 20,
    fontSize: 30,
  },
  buttonshare: {
    position: 'absolute',
    top: '71%',
    right: '5%',
    color: '#ffffff',
    paddingRight: 20,
    fontSize: 30,
  },
  buttonphone: {
    position: 'absolute',
    top: '78%',
    right: '5%',
    paddingRight: 20,
    color: '#ffffff',
    fontSize: 22,
  },
  buttonmsg: {
    position: 'absolute',
    top: '84%',
    right: '5%',
    paddingRight: 20,
    color: '#ffffff',
    fontSize: 30,
  },
  txtheart: {
    position: 'absolute',
    right: '5%',
    top: '67%',
    paddingRight: 18,
    color: '#ffffff',
    fontWeight: '800',
  },
  txtshare: {
    position: 'absolute',
    right: '5%',
    top: '74%',
    paddingRight: 18,
    color: '#ffffff',
    fontWeight: '800',
  },
  txtapp: {
    position: 'absolute',
    right: '5%',
    top: '88%',
    paddingRight: 10,
    color: '#ffffff',
    fontWeight: '800',
  },
  txtcall: {
    position: 'absolute',
    right: '5%',
    top: '81%',
    paddingRight: 18,
    color: '#ffffff',
    fontWeight: '800',
  },
  count: {
    position: 'absolute',
    right: 0,
    color: '#ffffff',
    padding: 28,
    top: '62%',
    fontWeight: '900',
  },
});

export default HomeScreen;
