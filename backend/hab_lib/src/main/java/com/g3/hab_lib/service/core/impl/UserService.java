package com.g3.hab_lib.service.core.impl;

import com.g3.hab_lib.dto.resp.UserResp;
import com.g3.hab_lib.model.User;
import com.g3.hab_lib.repository.IUserRepository;
import com.g3.hab_lib.service.core.intf.IUserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {

    @Autowired
    private IUserRepository IUserRepository;
    @Autowired
    private ModelMapper modelMapper;


    @Override
    public Page<UserResp> getAllUser(Pageable pageable) {
        Page<User> userList = IUserRepository.findAll(pageable);
        return userList.map(user -> modelMapper.map(user, UserResp.class));
    }

//    @Override
//    public void createUser(UserReq form) throws Exception {
//
//    }
}
