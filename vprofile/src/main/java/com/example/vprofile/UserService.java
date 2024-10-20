package com.example.vprofile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        return userRepository.save(user); // Save user details to the database
    }

    public boolean authenticateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        // Check if user exists and the password matches
        if (userOptional.isPresent()) {
            User user = userOptional.get(); // Retrieve the User object
            return user.getPassword().equals(password);
        }
        return false; // User not found or password doesn't match
    }
}
