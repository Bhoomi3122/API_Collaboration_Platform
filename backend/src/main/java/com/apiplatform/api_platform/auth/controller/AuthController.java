package com.apiplatform.api_platform.auth.controller;

import com.apiplatform.api_platform.auth.dto.request.LoginRequest;
import com.apiplatform.api_platform.auth.dto.request.SignupRequest;
import com.apiplatform.api_platform.auth.dto.response.AuthResponse;
import com.apiplatform.api_platform.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService=authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request){
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }
}
