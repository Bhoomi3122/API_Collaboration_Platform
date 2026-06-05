package com.apiplatform.api_platform.activity.entity;

import com.apiplatform.api_platform.activity.enums.ActivityType;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activities")
public class Activity {
    private Long id;

    @Enumerated(EnumType.STRING)
    private ActivityType type;

    private String message;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne
    @JoinColumn(name = "collection_id")
    private Collection collection;

    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
