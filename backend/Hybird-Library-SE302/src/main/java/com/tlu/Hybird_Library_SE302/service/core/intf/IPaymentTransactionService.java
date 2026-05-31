package com.tlu.Hybird_Library_SE302.service.core.intf;
import com.tlu.Hybird_Library_SE302.dto.req.*;
import com.tlu.Hybird_Library_SE302.dto.resp.PaymentTransactionResp;
import java.util.List;
public interface IPaymentTransactionService {
    List<PaymentTransactionResp> getAllPaymentTransactions();
    PaymentTransactionResp getPaymentTransactionById(int id);
    PaymentTransactionResp createPaymentTransaction(CreatePaymentTransactionReq request);
    PaymentTransactionResp updatePaymentTransaction(int id, UpdatePaymentTransactionReq request);
    void deletePaymentTransaction(int id);
    
    com.tlu.Hybird_Library_SE302.dto.resp.PaymentCalculationResp calculateReturnPayment(int returnRecordId);
    PaymentTransactionResp processReturnPayment(int returnRecordId, ProcessReturnPaymentReq request);
}