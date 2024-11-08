// Import necessary modules
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Video from 'react-native-video';
import axios from 'axios';

const Home1 = ({ UserId }) => {
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();
  const [isCameraActive, setCameraActive] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);

  const handleOpenCamera = () => {
    setCameraActive(true);
  };

  const handleStartRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      try {
        await cameraRef.current.startRecording({
          onRecordingFinished: (video) => {
            console.log('Recording finished:', video);
            setVideoUri(video.path);
          },
          onRecordingError: (error) => console.error('Recording error:', error),
          quality: '480p',
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        setRecording(false);
      }
    }
  };

  const handleStopRecording = async () => {
    if (cameraRef.current) {
      await cameraRef.current.stopRecording();
      setRecording(false);
    }
  };

  const handleNavigateHome = () => {
    setCameraActive(false);
    setVideoUri(null);
  };

  // Debugging code added to handleUploadVideo function
  const handleUploadVideo = async () => {
    if (!videoUri) {
      console.log('No video URI found.');
      return;
    }
    console.log('Starting upload...');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
      type: 'video/mp4',
      name: 'uploadedVideo.mp4',
    });

    // Debugging: Log the form data to ensure it is set correctly
    console.log('Form data prepared:', formData);

    try {
      const response = await axios.post(
        'http://172.20.10.4:8080/api/videos/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Video uploaded successfully:', response.data);
      alert('Video uploaded successfully!');
    } catch (error) {
      // Enhanced error logging
      console.error('Error uploading video:', error);
      if (error.response) {
        console.log('Server responded with:', error.response.status);
        console.log('Response data:', error.response.data);
      } else if (error.request) {
        console.log('No response received from server.');
      } else {
        console.log('Error in setting up request:', error.message);
      }
      alert('Error uploading video: ' + (error.response ? error.response.data : 'Network error'));
    } finally {
      setUploading(false);
    }
  };

  if (!hasPermission) {
    return <Text style={styles.message}>Camera permission is required.</Text>;
  }

  if (!device) {
    return <Text style={styles.message}>No camera device found.</Text>;
  }

  return (
    <View style={styles.container}>
      {isCameraActive ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isCameraActive}
          video={true}
          audio={true}
        />
      ) : (
        <TouchableOpacity style={styles.plusButton} onPress={handleOpenCamera}>
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
      )}
      {isCameraActive && (
        <View style={styles.recordButtonContainer}>
          {isRecording ? (
            <TouchableOpacity style={styles.recordButton} onPress={handleStopRecording}>
              <Text style={styles.recordButtonText}>Stop</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.recordButton} onPress={handleStartRecording}>
              <Text style={styles.recordButtonText}>Record</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {videoUri && (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: videoUri }}
            style={styles.video}
            controls={true}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.navigateHomeButton} onPress={handleNavigateHome}>
            <Text style={styles.navigateHomeButtonText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadVideo}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload Video</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    right: 50,
  },
  plusButtonText: {
    fontSize: 30,
    color: '#000',
    marginBottom: 6,
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  videoContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    height: 300,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  navigateHomeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  navigateHomeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  uploadButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  message: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Home1;
