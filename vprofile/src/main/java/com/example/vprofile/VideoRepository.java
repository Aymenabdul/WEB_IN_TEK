package com.example.vprofile;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoRepository extends JpaRepository<Video, Long> {
    // You can add custom query methods if needed
    
}


