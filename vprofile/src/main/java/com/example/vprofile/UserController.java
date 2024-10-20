package com.example.vprofile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users") // Base URL for this controller
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping // Handle POST requests to /users
    public ResponseEntity<String> createUser(@RequestBody User user) {
        userService.saveUser(user); // Save user details
        return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully."); // Response message
    }
}
