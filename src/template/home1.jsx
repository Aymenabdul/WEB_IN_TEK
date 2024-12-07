import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
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
import Delete from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-vector-icons/Ionicons';

const Home1 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {firstName, industry, userId} = route.params;
  const [videoUri, setVideoUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [newTranscription, setNewTranscription] = useState('');
  const [videos, setVideos] = useState([]);
  const [isTranscriptionModalVisible, setIsTranscriptionModalVisible] =
    useState(false);
  const [hasVideo, setHasVideo] = useState(false); // Track if video is uploaded
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  useEffect(() => {
    if (userId) {
      fetchProfilePic(userId);
      fetchVideo(userId);
    } else {
      console.error('No userId found');
      setLoading(false);
    }
  }, [userId]);


  // Function to parse SRT subtitle format
  const parseSRT = srtText => {
    const lines = srtText.split('\n');
    const parsedSubtitles = [];
    let i = 0;

    while (i < lines.length) {
      if (lines[i].match(/\d+/)) {
        const startEnd = lines[i + 1].split(' --> ');
        const startTime = parseTimeToSeconds(startEnd[0]);
        const endTime = parseTimeToSeconds(startEnd[1]);
        const text = lines[i + 2];
        parsedSubtitles.push({startTime, endTime, text});
        i += 4;
      } else {
        i++;
      }
    }

    return parsedSubtitles;
  };
  // Function to convert time format to seconds
  const parseTimeToSeconds = timeStr => {
    const [hours, minutes, seconds] = timeStr.split(':');
    const [sec, milli] = seconds.split(',');
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(sec) +
      parseInt(milli) / 1000
    );
  };
  // Function to check which subtitle is currently active based on video time
  useEffect(() => {
    const activeSubtitle = subtitles.find(
      subtitle =>
        currentTime >= subtitle.startTime && currentTime <= subtitle.endTime,
    );
    setCurrentSubtitle(activeSubtitle ? activeSubtitle.text : '');
  }, [currentTime, subtitles]);

   // Fetch subtitles when component is mounted
   useEffect(() => {
    const fetchSubtitles = async () => {
      try {
        const response = await fetch(subtitlesUrl);
        const text = await response.text();
        const parsedSubtitles = parseSRT(text);
        setSubtitles(parsedSubtitles);
      } catch (error) {
        console.error('Error fetching subtitles:', error);
      }
    };
    fetchSubtitles();
  },[subtitlesUrl]);

  // Fetch profile image
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
  // Fetch user's video
  const fetchVideo = async userId => {
    try {
      const response = await fetch(
        `http://192.168.1.5:8080/api/videos/user/${userId}`,
      );
      if (!response.ok) throw new Error('Failed to fetch video');

      const videoUri = `http://192.168.1.5:8080/api/videos/user/${userId}`;
      setVideoUri(videoUri);
      setHasVideo(true); // Set to true if video is available
    } catch (error) {
      alert('Welcome , you can now start recording the video');
      setHasVideo(false); // Set to false if no video is available
    } finally {
      setLoading(false);
    }
  };

  // Fetch transcription
  const fetchTranscription = async userId => {
    try {
      const response = await axios.get(
        `http://192.168.1.5:8080/api/videos/${userId}/transcription`,
      );
      if (response.data.transcription) {
        setTranscription(response.data.transcription);
        setIsTranscriptionModalVisible(true); // Show modal after fetching
      } else {
        alert('No transcription available for this user.');
      }
    } catch (error) {
      console.error('Error fetching transcription:', error.message);
      alert('Failed to fetch transcription.');
    }
  };

  // Delete video
  const deleteVideo = async userId => {
    Alert.alert(
      'Delete Video', // Title of the alert
      'Are you sure you want to delete this video?', // Message
      [
        {
          text: 'Cancel', // Button label
          style: 'cancel', // Button style
          onPress: () => console.log('Delete cancelled'), // Optional cancel action
        },
        {
          text: 'Delete', // Button label
          style: 'destructive', // Destructive style for the delete button (iOS)
          onPress: async () => {
            // Proceed with the deletion
            try {
              const response = await fetch(
                `http://192.168.1.5:8080/api/videos/delete/${userId}`,
                {
                  method: 'DELETE',
                },
              );

              if (!response.ok) throw new Error('Failed to delete video');

              const message = await response.text();
              console.log(message); // "Video deleted successfully for userId: <userId>"
              setHasVideo(false); // Hide the + icon when video is deleted
              setVideoUri(null); // Clear the video URI
            } catch (error) {
              console.error('Error deleting video:', error);
            }
          },
        },
      ],
      {cancelable: false}, // Prevent dismissing by tapping outside the alert
    );
  };

  // Update transcription
  const updateTranscription = async (userId, transcription) => {
    try {
      const response = await axios.put(
        `http://192.168.1.5:8080/api/videos/${userId}/transcription`,
        {transcription},
      );
      console.log('Update successful:', response.data.message);
      setTranscription(transcription);
      // Close the transcription modal on successful update
      setIsTranscriptionModalVisible(false);
    } catch (error) {
      console.error(
        'Error updating transcription:',
        error.response?.data?.message || error.message,
      );
    }
  };
  const subtitlesUrl = `http://192.168.1.5:8080/api/videos/${userId}/subtitles.srt`;
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
        <View style={styles.centerContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : videoUri ? (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.videoContainer}>
              <Video
                source={{uri: videoUri}}
                style={styles.videoPlayer}
                resizeMode="contain"
                controls={true}
                onProgress={e => setCurrentTime(e.currentTime)} // Track current time
              />
              <Text style={styles.subtitle}>{currentSubtitle}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noVideoText}>
              No video available for this user.
            </Text>
          )}
          {/* Conditionally render the + icon */}
          {!hasVideo && (
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => navigation.navigate('CameraPage', {userId})}>
              <Text style={styles.plusButtonText}>+</Text>
            </TouchableOpacity>
          )}
          {hasVideo && (
            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={styles.transcriptionButton}
                onPress={() => fetchTranscription(userId)}>
                <Share name={'share-social-outline'} size={28} style={styles.transcriptionButtonText}/>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteVideo(userId)}>
                <Delete  name={'delete-empty-outline'} size={28} style={styles.deleteButtonText}/>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>

      {/* Transcription Modal */}
      <Modal
        visible={isTranscriptionModalVisible}
        animationType="slide"
        transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Transcription</Text>
            <TextInput
              value={newTranscription || transcription}
              onChangeText={setNewTranscription}
              style={styles.input}
              multiline
            />
            <View style={styles.modelbtn}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => updateTranscription(userId, newTranscription)}>
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
    marginLeft: 10,
    marginRight: 10,
    height: 700,
    borderRadius: 10,
    elevation: 10,
  },
  transcriptionButton: {
    marginTop: -15,
    backgroundColor: '#2e80d8',
    padding: 10,
    borderRadius:50,
    marginHorizontal: 10,
    elevation: 10,
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
    elevation: 10,
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
    elevation: 10,
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
    padding: 10,
    marginHorizontal: 10,
     backgroundColor: '#2e80d8',
     borderRadius:50,
    elevation: 10,
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
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  noVideoText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: '20%',
    color: '#ffffff',
  },
  subtitle: {
    position: 'absolute',
    bottom:50,
    left: '10%',
    right: '10%',
    color: 'white',
    fontSize: 18,
    padding: 5,
    textAlign: 'center',
  },
});

export default Home1;
