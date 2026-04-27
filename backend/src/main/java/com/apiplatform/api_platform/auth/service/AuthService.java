package com.apiplatform.api_platform.auth.service;

import com.apiplatform.api_platform.auth.dto.request.LoginRequest;
import com.apiplatform.api_platform.auth.dto.request.SignupRequest;
import com.apiplatform.api_platform.auth.dto.response.AuthResponse;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.exception.UserAlreadyExistsException;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder)
    {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User convertSignupRequestDtoToUser(SignupRequest signupDto)
    {
        User user = new User();
        user.setName(signupDto.getName());
        user.setEmail(signupDto.getEmail());
        String encodedPassword = passwordEncoder.encode(signupDto.getPassword());
        user.setPassword(encodedPassword);
        return user;
    }

    private AuthResponse convertUserToAuthResponse(User user, String token)
    {
        AuthResponse authResponse = new AuthResponse();
        authResponse.setUserId(user.getId());
        authResponse.setName(user.getName());
        authResponse.setEmail(user.getEmail());
        authResponse.setToken(token);
        return authResponse;
    }

    public AuthResponse signup(SignupRequest requestDto)
    {
        String email = requestDto.getEmail();
        if(userRepository.findByEmail(email).isPresent())
        {
            throw new UserAlreadyExistsException("User already exists with the given email address");
        }
        User user = convertSignupRequestDtoToUser(requestDto);
        User savedUser = userRepository.save(user);

        String token = "dummy-token";

        return convertUserToAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest loginDto)
    {
        Optional<User> optionalUser = userRepository.findByEmail(loginDto.getEmail());
        if(!optionalUser.isPresent())
        {
            throw new RuntimeException("Invalid credentials");
        }
        User user = optionalUser.get();
        if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword()))
        {
            throw new RuntimeException("Invalid credentials");
        }

        String token = "dummy-token";

        return convertUserToAuthResponse(user, token);
    }
}