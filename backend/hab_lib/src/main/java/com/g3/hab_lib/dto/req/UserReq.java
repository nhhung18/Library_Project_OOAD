package com.g3.hab_lib.dto.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserReq {
    private String userName;
    private String fullName;
    private String email;
    private String password;
    private String address;
//    private int roleId;
    private String phoneNum;
    private String avatarUrl;
}
