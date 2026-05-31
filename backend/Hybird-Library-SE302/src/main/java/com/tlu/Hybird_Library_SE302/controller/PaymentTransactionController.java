package com.tlu.Hybird_Library_SE302.controller;
import com.tlu.Hybird_Library_SE302.dto.req.*;
import com.tlu.Hybird_Library_SE302.service.core.ResponseWrapper;
import com.tlu.Hybird_Library_SE302.service.core.intf.IPaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("api/payment-transactions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PaymentTransactionController {
    private final IPaymentTransactionService iPaymentTransactionService;
    @GetMapping
    public ResponseEntity<?> getAllPaymentTransactions() {
        return ResponseEntity.ok(ResponseWrapper.builder().status(HttpStatus.OK).code(200).data(iPaymentTransactionService.getAllPaymentTransactions()).build());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentTransactionById(@PathVariable int id) {
        return ResponseEntity.ok(ResponseWrapper.builder().status(HttpStatus.OK).code(200).data(iPaymentTransactionService.getPaymentTransactionById(id)).build());
    }
    @PostMapping
    public ResponseEntity<?> createPaymentTransaction(@RequestBody CreatePaymentTransactionReq request) {
        return ResponseEntity.ok(ResponseWrapper.builder().status(HttpStatus.CREATED).code(201).data(iPaymentTransactionService.createPaymentTransaction(request)).build());
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePaymentTransaction(@PathVariable int id, @RequestBody UpdatePaymentTransactionReq request) {
        return ResponseEntity.ok(ResponseWrapper.builder().status(HttpStatus.OK).code(200).data(iPaymentTransactionService.updatePaymentTransaction(id, request)).build());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePaymentTransaction(@PathVariable int id) {
        iPaymentTransactionService.deletePaymentTransaction(id);
        return ResponseEntity.ok(ResponseWrapper.builder().status(HttpStatus.OK).code(200).data("Xóa thành công!").build());
    }
    
    @GetMapping("/calculate-return/{returnId}")
    public ResponseEntity<?> calculateReturnPayment(@PathVariable int returnId) {
        return ResponseEntity.ok(ResponseWrapper.builder().status(HttpStatus.OK).code(200).data(iPaymentTransactionService.calculateReturnPayment(returnId)).build());
    }

    @PostMapping("/process-return/{returnId}")
    public ResponseEntity<?> processReturnPayment(@PathVariable int returnId, @RequestBody com.tlu.Hybird_Library_SE302.dto.req.ProcessReturnPaymentReq request) {
        return ResponseEntity.ok(ResponseWrapper.builder().status(HttpStatus.CREATED).code(201).data(iPaymentTransactionService.processReturnPayment(returnId, request)).build());
    }
}