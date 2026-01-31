package com.moviereview.backend.controller;

import com.moviereview.backend.model.Review;
import com.moviereview.backend.model.User;
import com.moviereview.backend.repository.LikeRepository;
import com.moviereview.backend.repository.ReviewRepository;
import com.moviereview.backend.repository.UserRepository;
import com.moviereview.backend.security.JwtUtils;
import com.moviereview.backend.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ReviewControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private UserRepository userRepository;

        @MockitoBean
        private ReviewRepository reviewRepository;

        @MockitoBean
        private LikeRepository likeRepository;

        @MockitoBean
        private JwtUtils jwtUtils;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        @Test
        public void testCheckReviewStatus_HasReview() throws Exception {
                User user = new User();
                user.setId(5L);
                user.setEmail("test@example.com");

                Mockito.when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

                Review review = new Review();
                review.setId(1L);
                review.setMovieId("27205");
                review.setRating(5.0);
                review.setContent("Goat");
                review.setUser(user);

                Mockito.when(reviewRepository.findAllByUserIdAndMovieId(5L, "27205"))
                                .thenReturn(Collections.singletonList(review));

                Authentication auth = Mockito.mock(Authentication.class);
                Mockito.when(auth.getName()).thenReturn("test@example.com");

                mockMvc.perform(get("/api/reviews/movie/27205/check")
                                .principal(auth)
                                .contentType(MediaType.APPLICATION_JSON_VALUE))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.hasReview").value(true))
                                .andExpect(jsonPath("$.rating").value(5.0))
                                .andExpect(jsonPath("$.review.content").value("Goat"))
                                .andExpect(jsonPath("$.review").exists());
        }

        @Test
        public void testCheckReviewStatus_NoReview() throws Exception {
                User user = new User();
                user.setId(5L);
                user.setEmail("test@example.com");

                Mockito.when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

                Mockito.when(reviewRepository.findAllByUserIdAndMovieId(5L, "27205"))
                                .thenReturn(Collections.emptyList());

                Authentication auth = Mockito.mock(Authentication.class);
                Mockito.when(auth.getName()).thenReturn("test@example.com");

                mockMvc.perform(get("/api/reviews/movie/27205/check")
                                .principal(auth)
                                .contentType(MediaType.APPLICATION_JSON_VALUE))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.hasReview").value(false));
        }
}
