import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  Image,
} from 'react-native';
import axios from 'axios';
import {Buffer} from 'buffer';
import Video from 'react-native-video';
import Header from './header';
import {useRoute} from '@react-navigation/native';
import Ant from 'react-native-vector-icons/AntDesign';
import Share from 'react-native-vector-icons/Entypo';
import Like from 'react-native-vector-icons/Foundation';
import Phone from 'react-native-vector-icons/FontAwesome6';
import Whatsapp from 'react-native-vector-icons/FontAwesome';
import {log} from 'console';

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
  const [isLiked, setIsLiked] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const route = useRoute(); // Access route parameters

  // Check if filtered videos are passed in route params
  const {filteredVideos, firstName, industry, userId} = route.params;

  useEffect(() => {
    if (!filteredVideos) {
      fetchVideos();
      fetchProfilePic(userId); // Fetch all videos if no filteredVideos are provided
    }
    fetchProfilePic(userId);
  }, [filteredVideos, userId]);

  useEffect(() => {
    if (!videoId) {
      console.error('Invalid videoId');
      return; // Exit early if videoId is null or undefined
    }

    console.log('Fetching like count for videoId:', videoId); // Debugging

    axios
      .get(`http://192.168.1.5:8080/api/videos/${videoId}/like-count`)
      .then(response => {
        setLikeCount(response.data.likeCount);
      })
      .catch(error => {
        console.error('Error fetching like count:', error);
      });
  }, [videoId]); // Dependency array, effect triggers when videoId changes

  const handleLike = () => {
    console.log('User ID:', userId); // Log userId
    console.log('Video ID:', videoId); // Log videoId

    // Add like to the video using query parameters
    axios
      .post(`http://192.168.1.5:8080/api/videos/${videoId}/like`, null, {
        params: {userId}, // Pass userId as a query parameter
      })
      .then(() => {
        setIsLiked(true);
        setLikeCount(likeCount + 1); // Increment like count
      })
      .catch(error => {
        console.error('Error liking video:', error);
      });
  };

  const openModal = async (uri, videoId) => {
    console.log('Video ID:', videoId); // Debugging: Check if videoId is passed correctly
    setVideoId(videoId);

    try {
      // Fetch user details by videoId
      const response = await axios.get(
        `http://192.168.1.5:8080/api/videos/user/${videoId}/details`,
      );

      // Log response data for debugging
      console.log('Fetched user details:', response.data);

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
      setSelectedVideoUri(uri);
      setIsModalVisible(true);
    }
  };

  const fetchProfilePic = async userId => {
    try {
      const response = await axios.get(
        `http://192.168.1.5:8080/users/user/${userId}/profilepic`,
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
      const response = await fetch(
        'http://192.168.1.5:8080/api/videos/videos',
      );
      if (!response.ok) throw new Error('Failed to fetch videos');

      const videoData = await response.json();
      if (Array.isArray(videoData) && videoData.length > 0) {
        const videoURIs = videoData.map(video => ({
          id: video.id,
          title: video.title || 'Untitled Video',
          uri: `http://192.168.1.5:8080/api/videos/user/${video.id}`,
        }));
        setVideoUrl(videoURIs);
        setHasVideo(true);
      } else {
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
    setIsModalVisible(false);
    setSelectedVideoUri(null);
  };

  // Use filteredVideos if passed, otherwise use fetched videos
  const videosToDisplay = filteredVideos
    ? filteredVideos.map(video => ({
        ...video,
        uri: `http://192.168.1.5:8080/api/videos/user/${video.id}`, // Ensure each filtered video has its URI
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
            numColumns={3}
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
                onError={error => console.error('Video playback error:', error)}
              />
              <TouchableOpacity onPress={closeModal} style={styles.buttoncls}>
                <Ant name={'arrowleft'} style={styles.buttoncls} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLike}>
                <Like
                  name={'heart'}
                  style={[
                    styles.buttonheart,
                    {color: isLiked ? 'red' : 'white'}, // Change color based on `liked` state
                  ]}
                />
                <Text style={styles.count}>{likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={''}>
                <Share name={'share'} style={styles.buttonshare} />
              </TouchableOpacity>
              <TouchableOpacity onPress={''}>
                <Whatsapp name={'whatsapp'} style={styles.buttonmsg} />
              </TouchableOpacity>
              <TouchableOpacity onPress={''}>
                <Phone name={'phone-volume'} style={styles.buttonphone} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    margin: 1, // Spacing between videos
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
    paddingHorizontal: 10, // Padding around the list
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
