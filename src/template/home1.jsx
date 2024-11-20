import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  ImageBackground,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from './header';
import axios from 'axios';
import {Buffer} from 'buffer';
import Video from 'react-native-video';

const Home1 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {firstName, industry, userId} = route.params;

  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [videos, setVideos] = useState([]);
  // const [numColumns, setNumColumns] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscriptionModalVisible, setIsTranscriptionModalVisible] =
    useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfilePic(userId);
      fetchUserVideos(userId);
    } else {
      console.error('No userId found');
      setLoading(false);
    }
  }, [userId, firstName, industry, route.params]);
  console.log('====================================');
  console.log(userId, firstName, industry, route.params);
  console.log('====================================');
  // Fetch profile image
  const fetchProfilePic = async userId => {
    try {
      const response = await axios.get(
        `http://172.20.10.4:8080/users/user/${userId}/profilepic`,
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
        console.error('Profile picture not found in response');
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error fetching profile pic:', error);
      setProfileImage(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's videos
  const BASE_URL = 'http://172.20.10.4:8080';

  const fetchUserVideos = async userId => {
    setLoading(true); // Show loading indicator during refresh

    try {
      const response = await axios.get(`${BASE_URL}/api/videos/user/${userId}`);
      console.log('Response Data:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const videosWithFullPaths = response.data
          .map(video => {
            if (!video.filePath) {
              console.error('Invalid file path for video:', video);
              return null;
            }

            console.log('hii', video.filePath);

            // Constructing video path with file://
            const videoPath = `file://${video.filePath}`;
            console.log('Constructed Video Path:', videoPath);

            // Returning the video object with the new url
            return {...video, url: videoPath};
          })
          .filter(Boolean); // Filter out null values

        setVideos(videosWithFullPaths);
        console.log('Video paths:', videosWithFullPaths);
      } else {
        console.error('No videos found in response');
        alert('No videos available for this user.');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      alert('Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Fetch transcription for selected video

  const fetchTranscription = async videoId => {
    try {
      const response = await axios.get(
        `http://172.20.10.4:8080/api/videos/${videoId}/transcription`,
      );
      if (response.data && response.data.transcription) {
        setTranscription(response.data.transcription);
        setIsTranscriptionModalVisible(true);
      } else {
        console.error('No transcription found');
      }
    } catch (error) {
      console.error('Error fetching transcription:', error);
    }
  };

  // Update transcription for selected video
  const updateTranscription = async (videoId, newTranscription) => {
    try {

      console.log(newTranscription);
        // Make sure the videoId and transcription are valid before making the request
    //     if (!videoId || !newTranscription) {
    //       console.log('====================================');
    // console.log(videoId, newTranscription);
    // console.log('====================================');
    //         console.error('Invalid videoId or transcription');
    //         return;
    //     }

        const response = await axios.put(
            `http://172.20.10.4:8080/api/videos/1/transcription`,
            {
                transcription: newTranscription,
            }
        );

        console.log('Transcription updated successfully:', response.data);
        Alert.alert('Transcription updated successfully');
        setIsTranscriptionModalVisible(false);
    } catch (error) {
        console.error('Error updating transcription:', error.response ? error.response.data : error.message);
    }
};
  const deleteVideo = async videoId => {
    if (!videoId || isNaN(videoId)) {
      console.error('Invalid video ID');
      return;
    }

    try {
      const response = await axios.delete(
        `http://172.20.10.4:8080/api/videos/delete/${videoId}`,
      );
      console.log('Video deleted successfully', response);

      // Show success message
      Alert.alert('Success', 'Video deleted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reload the list of videos after deletion
            fetchUserVideos(userId);
          },
        },
      ]);
    } catch (error) {
      console.error('Error deleting video:', error);
      // Show error message in case of failure
      Alert.alert('Error', 'Failed to delete video. Please try again.');
    }
  };

  // Render each video item
  const renderVideoItem = ({item}) => (
    <View style={styles.videoItem}>
      <TouchableOpacity
        onPress={() => {
          setSelectedVideo(item);
          setModalVisible(true);
        }}>
        <Video
          source={{uri: 'file://uploads/videos/uploadedVideo.mp4'}} // Play the video using the local URL
          style={styles.videoPlayer}
          resizeMode="contain"
          repeat
          controls={true}
        />
      </TouchableOpacity>
      <Text style={styles.videoName}>{item.name}</Text>
      <View style={styles.btnctnr}>
        <TouchableOpacity
          style={styles.transcriptionButton}
          onPress={() => fetchTranscription(item.id)}>
          <Text style={styles.transcriptionButtonText}>Transcription</Text>
        </TouchableOpacity>
        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteVideo(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <Header
          profile={profileImage}
          userName={firstName}
          jobOption={industry}
        />
      </View>
      <ImageBackground
        source={require('./assets/login.jpg')}
        style={styles.imageBackground}>
        <View>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <>
              <FlatList
                data={videos}
                keyExtractor={item => item.id.toString()}
                renderItem={renderVideoItem}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>No videos available.</Text>
                }
                style={styles.videoList}
              />
              {videos.length === 0 && (
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() => navigation.navigate('CameraPage', {userId})}>
                  <Text style={styles.plusButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Modal for playing selected video */}
        <Modal
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="slide"
          transparent>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Video
                source={{uri: selectedVideo?.url}}
                style={styles.modalVideoPlayer}
                resizeMode="contain"
                controls
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Transcription Modal */}
        <Modal
          visible={isTranscriptionModalVisible}
          onRequestClose={() => setIsTranscriptionModalVisible(false)}
          animationType="slide"
          transparent>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.transcriptionTitle}>Transcription</Text>
              <TextInput
                style={styles.transcriptionText}
                multiline
                numberOfLines={6}
                value={transcription}
                onChangeText={setTranscription}
              />
              <View style={styles.modelbtn}>
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() =>
                    updateTranscription(selectedVideo?.id, transcription)
                  }>
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsTranscriptionModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 13,
  },
  container: {
    flex: 1,
    resizeMode: 'contain',
  },
  videoList: {
    paddingLeft: 10,
    paddingTop: 10,
  },
  videoItem: {
    flex: 1,
    marginBottom: 20,
    marginRight: 10,
  },
  videoName: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 10,
  },
  videoPlayer: {
    height: 700,
    borderRadius: 10,
  },
  transcriptionButton: {
    marginTop: -15,
    backgroundColor: '#2e80d8',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  transcriptionButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  plusButton: {
    position: 'absolute',
    top: 680,
    right: '10%',
    backgroundColor: '#2e80d8',
    height: 60,
    width: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    fontSize: 40,
    color: '#fff',
  },
  emptyListText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: '100%',
    color: '#ffffff',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalVideoPlayer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#2e80d8',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
  },
  transcriptionText: {
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  transcriptionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
  },
  updateButton: {
    backgroundColor: '#2e80d8',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  btnctnr: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleteButton: {
    marginTop: -15,
    backgroundColor: '#2e80d8',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modelbtn: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});

export default Home1;
