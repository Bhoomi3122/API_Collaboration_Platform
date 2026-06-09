package com.apiplatform.api_platform.apiRequest.entity;

import com.apiplatform.api_platform.apiRequest.converter.HeadersConverter;
import com.apiplatform.api_platform.collection.entity.Collection;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "api_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String method; // GET, POST, PUT, DELETE, etc.

    @Column(nullable = false)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = HeadersConverter.class)
    private Map<String, String> headers;

    @Column(columnDefinition = "TEXT")
    private String body;

    // ── Authorization (persisted per request) ──────────────────────────────────
    // Stored so the Auth tab is fully pre-filled when the request is reopened.

    @Column
    private String authType;          // NONE | BEARER_TOKEN | BASIC_AUTH | API_KEY

    @Column(columnDefinition = "TEXT")
    private String authToken;         // Bearer token value

    @Column
    private String authUsername;      // Basic Auth username

    @Column(columnDefinition = "TEXT")
    private String authPassword;      // Basic Auth password

    @Column
    private String authApiKeyName;    // API Key header name (e.g. X-API-Key)

    @Column(columnDefinition = "TEXT")
    private String authApiKeyValue;   // API Key value

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "collection_id", nullable = false)
    private Collection collection;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

