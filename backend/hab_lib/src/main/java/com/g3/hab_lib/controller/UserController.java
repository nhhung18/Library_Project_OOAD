package com.g3.hab_lib.controller;

import com.g3.hab_lib.service.core.ResponseWrapper;
import com.g3.hab_lib.service.core.intf.IUserService;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.filters.AddDefaultCharsetFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private IUserService iUserService;

    @GetMapping()
    public ResponseEntity<?> getAllUser(Pageable pageable){
        return ResponseEntity.ok (
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(iUserService.getAllUser(pageable))
                        .build()
        );
    }

//    @PostMapping()
//    public ResponseEntity<?> createUser(@RequestBody UserReq form) throws Exception {
//        iUserService.createUser(form);
//        return new ResponseEntity<String>("Create User is Successfully", HttpStatus.OK)
//    }
}
