package com.g3.hab_lib.service.core.impl;

import com.g3.hab_lib.dto.req.UserReq;
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
    public Page<UserResp> getAllCustomer(Pageable pageable) {
        Page<User> userList = IUserRepository.findAllCustomer(pageable);
        return userList.map(user -> modelMapper.map(user, UserResp.class));
    }

    @Override
    public Page<UserResp> getAllStaff(Pageable pageable) {
        Page<User> userList = IUserRepository.findAllStaff(pageable);
        return userList.map(user -> modelMapper.map(user, UserResp.class));
    }

    @Override
    public UserReq createUser(UserReq form) throws Exception {
        User user = new User();
        user.setUserName(form.getUserName());
        user.setFullName(form.getFullName());
        user.setPassword(form.getPassword());
        user.setEmail(form.getEmail());
        user.setPhoneNum(form.getPhoneNum());
        user.setAddress(form.getAddress());
        user.setRoleId(form.getRoleId());
        IUserRepository.save(user);
        return modelMapper.map(user, UserReq.class);
    }
}
