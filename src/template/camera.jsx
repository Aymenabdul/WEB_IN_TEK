import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import Flash from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import Media from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import PlayPause from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const CameraPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params || null;
  console.log('UserId passed:', userId); // Log UserId

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(30); // 30-second timer
  const [onFlash, setOnFlash] = useState('off');
  const [videoPath, setVideoPath] = useState(null); // Store video path
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [isUploading, setUploading] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [videoUri, setVideoUri] = useState('');
  const [videos, setVideos] = useState([]);
  const cameraRef = useRef(null);
  const {hasPermission, requestPermission} = useCameraPermission();
  let timerInterval = useRef(null);
  const device = useCameraDevice(isFrontCamera ? 'front' : 'back');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);
  // Debug log for permission status
  console.log('Camera permission:', hasPermission);

  if (!device) {
    console.log('No camera device found.');
    return <ActivityIndicator style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} />;
  }
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://172.20.10.4:8080/api/videos/${userId}`);
      console.log('Fetched user data:', response.data);
      setVideos(response.data.videos); // Update the videos state with the fetched data
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleUploadVideo = async () => {
    if (!videoUri) {
      alert('No video found to upload.');
      return;
    }

    setUploading(true);

    let formattedUri =
      Platform.OS === 'android' ? 'file://' + videoUri : videoUri;

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: formattedUri,
        type: 'video/mp4',
        name: 'uploadedVideo.mp4',
      });
      formData.append('userId', userId);

      const response = await axios.post(
        'http://172.20.10.4:8080/api/videos/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Upload Response:', response.data);

      const {filePath, fileName, id} = response.data;
      if (filePath && id) {
        alert('Video uploaded successfully!');
        fetchUserData();

        const videoUrl = `http://172.20.10.4:8080/${filePath.replace(
          /\\/g,
          '/',
        )}`;
        const newvideos = {
          id,
          name: fileName,
          url: videoUrl,
        };

        navigation.reset({
          index: 0,
          routes: [
            {name: 'home1', params: {userId, videos: [...videos, newvideos]}},
          ],
        });
      } else {
        alert('Unexpected response from server. Missing required fields.');
      }
    } catch (error) {
      console.error(
        'Upload Error:',
        error.response ? error.response.data : error.message,
      );
      alert('Error uploading video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        setIsPaused(false);

        console.log('Starting recording...');
        cameraRef.current.startRecording({
          onRecordingFinished: async video => {
            console.log('Recording finished. Video saved at:', video.path);
            setVideoPath(video.path);
            setVideoUri(video.path);
            setIsRecording(false);
            setCurrentTimer(30);
          },
          onRecordingError: error => {
            console.error('Recording error:', error);
            setIsRecording(false);
            setCurrentTimer(30);
          },
        });

        // Set a countdown timer for 30 seconds
        timerInterval.current = setInterval(() => {
          setCurrentTimer(prev => {
            if (prev === 1) {
              clearInterval(timerInterval.current);
              stopRecording();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
      }
    } else {
      console.warn('Camera reference is not available or already recording.');
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      console.log('Stopping recording...');
      await cameraRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerInterval.current);
    }
  };

  const pauseRecording = async () => {
    if (isRecording && !isPaused) {
      setIsPaused(true);
      clearInterval(timerInterval.current);
      console.log('Recording paused.');
    }
  };

  const resumeRecording = async () => {
    if (isRecording && isPaused) {
      setIsPaused(false);
      console.log('Resuming recording...');
      timerInterval.current = setInterval(() => {
        setCurrentTimer(prev => {
          if (prev === 1) {
            clearInterval(timerInterval.current);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
      }}>
      <Camera
        ref={cameraRef}
        device={device}
        isActive={true}
        style={{position: 'absolute', height: '100%', width: '100%'}}
        video={true}
        audio={true} // Ensure audio is enabled
        torch={onFlash}
      />

      {/* Flash Toggle */}
      <TouchableOpacity
        style={styles.flashButton}
        onPress={() =>
          setOnFlash(currentVal => (currentVal === 'off' ? 'on' : 'off'))
        }>
        <Flash
          name={onFlash === 'off' ? 'flash-on' : 'flash-off'}
          color="white"
          size={30}
        />
      </TouchableOpacity>

      {/* Exit Button */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.exitText}>X</Text>
      </TouchableOpacity>
      {/* Camera Switch Button */}
      <TouchableOpacity
        style={styles.switchCameraButton}
        onPress={() => setIsFrontCamera(prev => !prev)}>
        <MaterialCommunityIcons
          name={'camera-flip-outline'}
          size={35}
          style={styles.camicon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.infoButton}>
        <AntDesign
          name={'infocirlce'}
          size={30}
          style={styles.infoicon}
        />
      </TouchableOpacity>
      {/* Timer */}
      <View style={styles.timer}>
        <Text style={styles.timerText}>
          {isRecording ? currentTimer.toString().padStart(2, '0') : '00:30'}
        </Text>
      </View>
      {/* Record Button */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording ? styles.recording : styles.notRecording,
        ]}
        onPress={isRecording ? stopRecording : startRecording}>
        <View style={styles.innerCircle}></View>
      </TouchableOpacity>

      {/* Pause/Resume Control */}
      {isRecording && (
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={isPaused ? resumeRecording : pauseRecording}>
            <PlayPause
              name={isPaused ? 'play-circle' : 'pause-circle'}
              size={50}
              color={'white'}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal for Playback */}
      {videoPath && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Play Recorded Video</Text>
            <Video
              source={{uri: videoPath}}
              style={styles.videoPlayer}
              controls={true}
              resizeMode="contain"
            />
            <View
              style={{
                justifyContent: 'space-around',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
              }}>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowModal(false)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUploadVideo}
                style={{
                  backgroundColor: 'green',
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 20,
                }}>
                <Text style={styles.closeModalText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Loading Spinner */}
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </Modal>
      )}

      {/* Show Modal Button */}
      {videoPath && !isRecording && (
        <TouchableOpacity
          style={styles.showModalButton}
          onPress={() => setShowModal(true)}>
          <Media name="photo-library" size={35} color={'white'} />
        </TouchableOpacity>
      )}

      {/* Loading Spinner */}
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flashButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  exitButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitText: {color: 'white', fontSize: 20, fontWeight: 'bold'},
  timer: {position: 'absolute', bottom: '90%'},
  timerText: {color: 'white', fontSize: 24, fontWeight: '700'},
  recordButton: {
    position: 'absolute',
    bottom: 50,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  recording: {backgroundColor: 'red', borderWidth: 2, borderColor: 'white'},
  notRecording: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  innerCircle: {
    height: '90%',
    width: '90%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  modalHeader: {color: 'white', fontSize: 20, marginBottom: 20},
  videoPlayer: {width: '100%', height: '70%'},
  closeModalButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeModalText: {color: 'white', fontSize: 16},
  showModalButton: {
    position: 'absolute',
    bottom:130,
    padding: 10,
    borderRadius: 5,
    left:'80%',
  },
  showModalText: {color: 'white', fontSize: 16},
  controlButtons: {
    position: 'absolute',
    bottom:120,
    right:145,
    // flexDirection: 'row',
    width: '100%',
    // backgroundColor:'pink',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    // backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginLeft: '70%',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchCameraButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{translateX: -50}],
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
  },
  infoButton:{
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{translateX: -50}],
    padding: 10,
  },
  switchCameraText: {
    color: 'white',
    fontSize: 18,
  },
  camicon: {
    color: '#ffffff',
    position: 'absolute',
    bottom:40,
    right:90,
  },
  infoicon:{
    color:'#ffffff',
    left:176,
    bottom:38,
  },
});

export default CameraPage;