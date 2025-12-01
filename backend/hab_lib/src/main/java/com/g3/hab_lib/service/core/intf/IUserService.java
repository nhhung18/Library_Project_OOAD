package com.g3.hab_lib.service.core.intf;

import com.g3.hab_lib.dto.req.UserReq;
import com.g3.hab_lib.dto.resp.UserResp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

public interface IUserService {

    Page<UserResp> getAllUser(Pageable pageable);

//    void createUser(UserReq form) throws Exception;
}
