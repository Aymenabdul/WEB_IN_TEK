package com.example.vprofile;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoRepository extends JpaRepository<Video, Long> {
    // You can add custom query methods if needed
    List<Video> findByUserId(Long userId);
    Optional<Video> findById(Long videoId);
}


