package com.apiplatform.api_platform.auth.controller;

import com.apiplatform.api_platform.auth.dto.request.DeleteAccountRequest;
import com.apiplatform.api_platform.auth.dto.response.UserStatsResponse;
import com.apiplatform.api_platform.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
        userService.deleteAccount(request.getPassword());
        return ResponseEntity.noContent().build();
    }
}

