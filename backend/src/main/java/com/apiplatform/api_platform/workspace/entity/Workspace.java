package com.apiplatform.api_platform.workspace.entity;

import com.apiplatform.api_platform.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="workspace")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Workspace {
    // Primary Key
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    // Workspace basic info
    private String name;

    private String description;

    // Workspace owner
    @ManyToOne
    @JoinColumn(name="owner_id")
    private User owner;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
