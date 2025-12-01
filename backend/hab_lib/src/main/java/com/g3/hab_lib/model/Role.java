package com.g3.hab_lib.model;

import com.g3.hab_lib.model.base.BaseIdObject;
import com.g3.hab_lib.model.constants.RoleName;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity
@Table(name = "roles")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Role extends BaseIdObject {
    @Enumerated(EnumType.STRING)
    @Column(name = "role_name")
    private RoleName roleName;
}
