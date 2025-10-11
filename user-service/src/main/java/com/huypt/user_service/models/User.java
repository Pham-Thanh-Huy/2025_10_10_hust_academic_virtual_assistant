package com.huypt.user_service.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;


    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private Profile profile;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<UserToken> userTokens = new ArrayList<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @ToString.Exclude
    @Builder.Default
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"), // đây là ID của User
            inverseJoinColumns = @JoinColumn(name = "role_id") // đây là ID của Role
    )
    @JsonIgnore
    private List<Role> roles = new ArrayList<>();



    // ----> MANY TO MANY
    public void setRelationRole(List<Role> roles) {
        for (Role role : roles) {
            if (!this.roles.contains(role)) {
                this.roles.add(role);
                role.getUsers().add(this);
            }
        }
    }

    // -------> ONE TO
    public void setRelationProfile(Profile profile) {
        this.profile = profile;
        if (profile != null) {
            profile.setUser(this);
        }
    }
}
