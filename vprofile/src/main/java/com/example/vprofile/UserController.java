package com.example.vprofile;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // Import MediaType here
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users") // Base URL for this controller
public class UserController {
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Autowired
    private UserService userService;

    @PostMapping // Handle POST requests to /users
    public ResponseEntity<String> createUser(@RequestBody User user) {
        userService.saveUser(user); // Save user details
        return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully."); // Response message
    }

    @PostMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestBody Map<String, String> emailPayload) {
        String email = emailPayload.get("email");
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    @PostMapping("/check-phone")
    public ResponseEntity<Boolean> checkPhone(@RequestBody String phoneNumber) {
        boolean phoneExists = userService.isPhoneExists(phoneNumber);
        return ResponseEntity.ok(phoneExists);
    }
    @GetMapping("/user/{userId}/profilepic")
public ResponseEntity<byte[]> getUserProfilePic(@PathVariable Long userId) {
    Optional<User> userOptional = userRepository.findById(userId);
    if (!userOptional.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    User user = userOptional.get();
    if (user.getProfilePic() != null) {
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)  // Set the appropriate content type
                .body(user.getProfilePic());        // Send the byte array (image) in the response body
    } else {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }
}

    
}
