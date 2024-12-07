package com.example.vprofile;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserIdAndVideoId(Long userId, Long videoId);  // Check if a user has liked the video

    Long countByVideoId(Long videoId);  // Count likes for a specific video
}

