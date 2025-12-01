package com.g3.hab_lib.dto.resp;

import lombok.*;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResp {
    private int id;
    private String userName;
    private String fullName;
    private String email;
    private String password;
    private String address;
    private int roleId;
    private String phoneNum;
    private String avatarUrl;
    private Timestamp updateAt;
    private Timestamp createAt;

}
