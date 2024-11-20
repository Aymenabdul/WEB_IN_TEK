package com.example.vprofile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;

    @Autowired
    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        if (userId == null || userId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID.");
        }

        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No file uploaded.");
        }

        try {
            // Save the video and process the file
            Video video = videoService.saveVideo(file, userId); // Ensure this method handles the file and user association properly
            return ResponseEntity.status(HttpStatus.CREATED).body(video);
        } catch (IOException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed: " + e.getMessage());
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @GetMapping("/user/{userId}")
    public List<Video> getVideosByUserId(@PathVariable Long userId) {
        return videoService.getVideosByUserId(userId);
    }

    @GetMapping("/{videoId}/transcription")
public ResponseEntity<Map<String, String>> getTranscription(@PathVariable String videoId) {
    try {
        // Convert videoId from String to Long
        Long videoIdLong = Long.parseLong(videoId);

        // Fetch transcription from the service
        String transcription = videoService.getTranscription(videoIdLong);

        // Check if transcription is available
        if (transcription != null && !transcription.isEmpty()) {
            return ResponseEntity.ok(Map.of("transcription", transcription));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Transcription not found"));
        }
    } catch (NumberFormatException e) {
        // Handle invalid videoId format (non-numeric)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid video ID"));
    }
}

@PutMapping("/{videoId}/transcription")
public ResponseEntity<Map<String, String>> updateTranscription(
    @PathVariable Long videoId, @RequestBody Map<String, String> requestBody) {

    String transcriptionContent = requestBody.get("transcription");

    if (transcriptionContent == null || transcriptionContent.isEmpty()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Transcription content is required"));
    }

    try {
        // Call service to update transcription
        Video updatedVideo = videoService.updateTranscription(videoId, transcriptionContent);

        // Return the updated video as a response
        return ResponseEntity.ok(Map.of("message", "Transcription updated successfully", "video", updatedVideo.toString()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error updating transcription", "error", e.getMessage()));
    }
}


    @DeleteMapping("/delete/{videoId}")
    public ResponseEntity<String> deleteVideo(@PathVariable Long videoId) {
        boolean isDeleted = videoService.deleteVideo(videoId);
        if (isDeleted) {
            return ResponseEntity.ok("Video deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Video not found.");
        }
    }
    
}
