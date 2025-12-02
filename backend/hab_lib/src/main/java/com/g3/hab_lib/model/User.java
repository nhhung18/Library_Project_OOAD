package com.g3.hab_lib.model;

import com.g3.hab_lib.model.base.BaseIdObject;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder

public class User extends BaseIdObject {
    @Column(name = "user_name", unique = true, nullable = false, length = 255)
    private String userName;

    @Column(name = "full_name", unique = true, nullable = false, length = 255)
    private String fullName;

    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "address")
    private String address;

    @Column(name = "role_id", nullable = true)
    private int roleId;

    @Column(name = "phone_num", unique = true, nullable = false, length = 20)
    private String phoneNum;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @UpdateTimestamp
    @Column(name = "update_at", updatable = false, insertable = false)
    private Timestamp updateAt;

    @CurrentTimestamp
    @Column(name = "create_at", updatable = false, insertable = false)
    private Timestamp createAt;
}
