package com.example.vprofile;

import com.assemblyai.api.AssemblyAI;
import com.assemblyai.api.resources.transcripts.types.Transcript;
import com.assemblyai.api.resources.transcripts.types.TranscriptOptionalParams;
import com.assemblyai.api.resources.transcripts.types.TranscriptStatus;
import com.transloadit.sdk.Assembly;
import com.transloadit.sdk.Transloadit;
import com.transloadit.sdk.exceptions.LocalOperationException;
import com.transloadit.sdk.exceptions.RequestException;
import com.transloadit.sdk.response.AssemblyResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Service
public class VideoService {

    private final String uploadDir = "uploads/videos/";

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${assemblyai.api.key}")
    private String assemblyAiApiKey;

    @Value("${transloadit.api.key}")
    private String transloaditApiKey;

    @Value("${transloadit.api.secret}")
    private String transloaditApiSecret;

    private final String templateId = "2c918371ac9b48d589ecd6fd9ef5e992"; // Your template ID

    public Video saveVideo(MultipartFile file, Long userId) throws IOException, InterruptedException {
        System.out.println("Saving video for user ID: " + userId);
        
        validateUser(userId);
        
        Path videoFilePath = saveUploadedFile(file);
        System.out.println("Video file saved at: " + videoFilePath);

        String audioUrl = extractAudioWithTransloadit(videoFilePath);
        System.out.println("Audio file extracted at: " + audioUrl);

        // Download audio from URL
        String downloadedAudioPath = downloadAudio(audioUrl, file.getOriginalFilename());
        System.out.println("Downloaded audio file saved at: " + downloadedAudioPath);

        String transcription = convertAudioToText(downloadedAudioPath);
        System.out.println("Transcription completed: " + transcription);

        Video video = createVideoEntity(file, userId, videoFilePath, downloadedAudioPath, transcription);
        System.out.println("Video entity created: " + video);

        return videoRepository.save(video);
    }

    private void validateUser(Long userId) {
        System.out.println("Validating user with ID: " + userId);
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User with ID " + userId + " does not exist.");
        }
        System.out.println("User validation passed.");
    }

    private Path saveUploadedFile(MultipartFile file) throws IOException {
        System.out.println("Saving uploaded file: " + file.getOriginalFilename());

        File directory = new File(uploadDir);
        if (!directory.exists()) {
            System.out.println("Directory does not exist. Creating: " + uploadDir);
            directory.mkdirs();
        }

        Path filePath = Paths.get(uploadDir + file.getOriginalFilename());
        Files.write(filePath, file.getBytes());
        System.out.println("File saved at: " + filePath);

        return filePath;
    }

    private String extractAudioWithTransloadit(Path videoFilePath) throws IOException {
        Transloadit transloadit = new Transloadit(transloaditApiKey, transloaditApiSecret);

        Assembly assembly = transloadit.newAssembly();
        assembly.addFile(videoFilePath.toFile());
        assembly.addOptions(Map.of("template_id", templateId));

        try {
            // Start the assembly
            AssemblyResponse response = assembly.save();
        
            // Poll for assembly completion
            while (!response.isFinished()) {
                Thread.sleep(5000);
                response = transloadit.getAssemblyByUrl(response.getSslUrl());
            }
        
            // Log the full response for debugging
            System.out.println("Full Response JSON: " + response.json().toString(2));
        
            // Check if 'results' and 'extracted-audio' exist in the JSON response
            if (response.json().has("results") && response.json().getJSONObject("results").has("extracted-audio")) {
                // Get the extracted audio array
                JSONArray extractedAudioArray = response.json().getJSONObject("results").getJSONArray("extracted-audio");

                // Check if the array has at least one audio object
                if (extractedAudioArray.length() > 0) {
                    // Access the first audio object
                    JSONObject audioObject = extractedAudioArray.getJSONObject(0);
                    
                    // Get the audio URL from the audio object
                    String audioUrl = audioObject.getString("url");
                    System.out.println("Extracted Audio URL: " + audioUrl);
                    return audioUrl;
                } else {
                    throw new IOException("Audio extraction failed: 'extracted-audio' array is empty.");
                }
            } else {
                throw new IOException("Audio extraction failed: 'results' or 'extracted-audio' key not found in the response.");
            }
        } catch (RequestException | LocalOperationException | InterruptedException e) {
            throw new IOException("Error during Transloadit execution: " + e.getMessage());
        }
    }

    private String downloadAudio(String audioUrl, String originalFileName) throws IOException {
        String audioFileName = originalFileName.replace(".mp4", ".mp3"); // Change extension if necessary
        Path audioFilePath = Paths.get(uploadDir + "audio/" + audioFileName);

        // Create audio directory if it does not exist
        File audioDirectory = new File(uploadDir + "audio/");
        if (!audioDirectory.exists()) {
            audioDirectory.mkdirs();
        }

        // Download the audio file
        try (InputStream in = new URL(audioUrl).openStream();
             FileOutputStream out = new FileOutputStream(audioFilePath.toFile())) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buffer, 0, buffer.length)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }

        System.out.println("Downloaded audio file to: " + audioFilePath);
        return audioFilePath.toString();
    }

    private String convertAudioToText(String audioFilePath) throws IOException {
        System.out.println("Converting audio to text for file: " + audioFilePath);

        AssemblyAI client = AssemblyAI.builder()
                .apiKey(assemblyAiApiKey)
                .build();

        TranscriptOptionalParams params = TranscriptOptionalParams.builder()
                .speakerLabels(true)
                .build();

        Transcript transcript = client.transcripts().transcribe(new File(audioFilePath), params);

        if (transcript.getStatus().equals(TranscriptStatus.ERROR)) {
            System.err.println("Transcription error: " + transcript.getError().orElse("Unknown error"));
            throw new IOException("Transcription error: " + transcript.getError().orElse("Unknown error"));
        }

        System.out.println("Transcription text: " + transcript.getText().orElse("No transcription text available"));
        return transcript.getText().orElse("No transcription text available");
    }

    private Video createVideoEntity(MultipartFile file, Long userId, Path videoFilePath, String audioFilePath, String transcription) {
        System.out.println("Creating video entity...");

        Video video = new Video();
        video.setFileName(file.getOriginalFilename());
        video.setFilePath(videoFilePath.toString());
        video.setAudioFilePath(audioFilePath);
        video.setUserId(userId);
        video.setTranscription(transcription);

        System.out.println("Video entity created: " + video);
        return video;
    }
}
