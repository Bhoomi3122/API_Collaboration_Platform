package com.apiplatform.api_platform.auth.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {

    @NotBlank(message="Name is required")
    private String name;

    @NotBlank(message="Email address is required")
    @Email(message="Invalid email format")
    private String email;

    @NotBlank(message="Password is required")
    @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%&?*]).{8,}$",
    message="Password must be atleast 8 characters long and include atleast one uppercase character, lowercase character, special character and digit")
    private String password;
}
