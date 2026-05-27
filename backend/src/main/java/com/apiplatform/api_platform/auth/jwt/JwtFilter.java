package com.apiplatform.api_platform.auth.jwt;

import java.io.IOException;
import java.util.ArrayList;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil)
    {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(

            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain

    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if(authHeader == null || !authHeader.startsWith("Bearer "))
        {
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        if(jwtUtil.validateToken(token, email))
        {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            new ArrayList<>()
                    );
            SecurityContextHolder.getContext()
                    .setAuthentication(authenticationToken);
        }
        filterChain.doFilter(request, response);
    }
}
