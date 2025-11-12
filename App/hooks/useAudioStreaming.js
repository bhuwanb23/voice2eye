/**
 * Audio Streaming Hook
 * Custom hook for handling audio recording and streaming
 */
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const useAudioStreaming = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recording, setRecording] = useState(null);
  const [audioData, setAudioData] = useState([]);
  
  const recordingRef = useRef(null);

  // Request audio recording permissions
  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      setHasPermission(false);
      return false;
    }
  };

  // Start audio recording
  const startRecording = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        console.error('Audio recording permission not granted');
        return false;
      }
    }

    try {
      // Configure audio recording settings
      const recording = new Audio.Recording();
      
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOS_AUDIO_QUALITY_MIN,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      
      console.log('Recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      return false;
    }
  };

  // Stop audio recording
  const stopRecording = async () => {
    if (!recordingRef.current) {
      return;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      console.log('Recording stopped and stored at', uri);
      
      // Read the audio file data
      if (uri) {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
          const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          setAudioData(prev => [...prev, {
            uri,
            base64: base64Data,
            size: info.size,
            timestamp: new Date().toISOString(),
          }]);
        }
      }
      
      recordingRef.current = null;
      setIsRecording(false);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      return null;
    }
  };

  // Get audio data for streaming
  const getAudioData = () => {
    return audioData;
  };

  // Clear audio data
  const clearAudioData = () => {
    setAudioData([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  return {
    isRecording,
    hasPermission,
    audioData,
    requestPermissions,
    startRecording,
    stopRecording,
    getAudioData,
    clearAudioData,
  };
};

export default useAudioStreaming;