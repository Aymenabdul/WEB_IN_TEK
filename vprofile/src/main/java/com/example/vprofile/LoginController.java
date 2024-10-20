package com.example.vprofile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private UserRepository userRepository; // Injecting UserRepository

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> payload) {
        // Extracting email and password directly from the request body
        String email = payload.get("email");
        String password = payload.get("password");

        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(email); // Correctly getting Optional<User>
        
        if (userOptional.isPresent()) {
            User user = userOptional.get(); // Getting the User object

            // Check if password matches
            if (user.getPassword().equals(password)) {
                // Prepare response with firstName and jobOption
                Map<String, String> response = new HashMap<>();
                response.put("firstName", user.getFirstName()); // Assuming getFirstName() method exists
                response.put("jobOption", user.getJobOption()); // Assuming getJobOption() method exists

                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid email or password!");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid email or password!");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
    }
}
