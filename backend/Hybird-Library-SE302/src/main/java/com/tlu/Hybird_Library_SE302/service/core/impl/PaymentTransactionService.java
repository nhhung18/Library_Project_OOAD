package com.tlu.Hybird_Library_SE302.service.core.impl;
import com.tlu.Hybird_Library_SE302.dto.req.*;
import com.tlu.Hybird_Library_SE302.dto.resp.PaymentTransactionResp;
import com.tlu.Hybird_Library_SE302.model.PaymentTransaction;
import com.tlu.Hybird_Library_SE302.model.User;
import com.tlu.Hybird_Library_SE302.repository.IPaymentTransactionRepository;
import com.tlu.Hybird_Library_SE302.repository.IUserRepository;
import com.tlu.Hybird_Library_SE302.service.core.intf.IPaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.tlu.Hybird_Library_SE302.model.ReturnRecord;
import com.tlu.Hybird_Library_SE302.model.PaymentItem;
import com.tlu.Hybird_Library_SE302.model.constants.PaymentItemType;
import com.tlu.Hybird_Library_SE302.model.constants.PaymentStatus;
import com.tlu.Hybird_Library_SE302.repository.IReturnRecordRepository;
import com.tlu.Hybird_Library_SE302.repository.IPaymentItemRepository;
import com.tlu.Hybird_Library_SE302.repository.IBorrowRecordRepository;
import com.tlu.Hybird_Library_SE302.model.constants.ApprovalStatus;
import com.tlu.Hybird_Library_SE302.model.constants.BorrowStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class PaymentTransactionService implements IPaymentTransactionService {
    private final IPaymentTransactionRepository iPaymentTransactionRepository;
    private final IUserRepository iUserRepository;
    private final IReturnRecordRepository iReturnRecordRepository;
    private final IPaymentItemRepository iPaymentItemRepository;
    private final IBorrowRecordRepository iBorrowRecordRepository;
    @Override
    public List<PaymentTransactionResp> getAllPaymentTransactions() {
        return iPaymentTransactionRepository.findAll().stream().map(this::mapToResp).toList();
    }
    @Override
    public PaymentTransactionResp getPaymentTransactionById(int id) {
        PaymentTransaction pt = iPaymentTransactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch!"));
        return mapToResp(pt);
    }
    @Override
    public PaymentTransactionResp createPaymentTransaction(CreatePaymentTransactionReq request) {
        if(iPaymentTransactionRepository.existsByTransactionCode(request.getTransactionCode())) throw new RuntimeException("Mã giao dịch đã tồn tại!");
        User user = iUserRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
        PaymentTransaction pt = PaymentTransaction.builder()
            .transactionCode(request.getTransactionCode())
            .user(user)
            .amount(request.getAmount())
            .status(request.getStatus() != null ? request.getStatus() : PaymentStatus.PENDING)
            .paymentMethod(request.getPaymentMethod())
            .paidAt(request.getPaidAt())
            .build();
        return mapToResp(iPaymentTransactionRepository.save(pt));
    }
    @Override
    public PaymentTransactionResp updatePaymentTransaction(int id, UpdatePaymentTransactionReq request) {
        PaymentTransaction pt = iPaymentTransactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch!"));
        if(request.getTransactionCode() != null && !request.getTransactionCode().equals(pt.getTransactionCode())) {
            if(iPaymentTransactionRepository.existsByTransactionCode(request.getTransactionCode())) throw new RuntimeException("Mã giao dịch đã tồn tại!");
            pt.setTransactionCode(request.getTransactionCode());
        }
        if(request.getAmount() != null) pt.setAmount(request.getAmount());
        if(request.getStatus() != null) pt.setStatus(request.getStatus());
        if(request.getPaymentMethod() != null) pt.setPaymentMethod(request.getPaymentMethod());
        if(request.getPaidAt() != null) pt.setPaidAt(request.getPaidAt());
        return mapToResp(iPaymentTransactionRepository.save(pt));
    }
    @Override
    public void deletePaymentTransaction(int id) {
        PaymentTransaction pt = iPaymentTransactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch!"));
        iPaymentTransactionRepository.delete(pt);
    }
    private PaymentTransactionResp mapToResp(PaymentTransaction pt) {
        return PaymentTransactionResp.builder()
            .id(pt.getId())
            .transactionCode(pt.getTransactionCode())
            .userId(pt.getUser() != null ? pt.getUser().getId() : null)
            .amount(pt.getAmount())
            .status(pt.getStatus())
            .paymentMethod(pt.getPaymentMethod())
            .paidAt(pt.getPaidAt())
            .build();
    }

    @Override
    public com.tlu.Hybird_Library_SE302.dto.resp.PaymentCalculationResp calculateReturnPayment(int returnRecordId) {
        ReturnRecord record = iReturnRecordRepository.findById(returnRecordId).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu trả!"));
        BigDecimal lateFee = record.getFineAmount() != null ? record.getFineAmount() : BigDecimal.ZERO;
        
        BigDecimal damageFee = BigDecimal.ZERO;
        if(record.getDamageLevel() != null && record.getBorrowRecord() != null && record.getBorrowRecord().getBook() != null) {
            BigDecimal basePrice = record.getBorrowRecord().getBook().getReplacementPrice();
            if (basePrice == null) basePrice = BigDecimal.valueOf(100000);
            BigDecimal percent = record.getDamageLevel().getPercentValue();
            if(percent != null) {
                damageFee = basePrice.multiply(percent).divide(BigDecimal.valueOf(100));
            }
        }
        
        BigDecimal lostFee = BigDecimal.ZERO;
        if(Boolean.TRUE.equals(record.getIsLost()) && record.getBorrowRecord() != null && record.getBorrowRecord().getBook() != null) {
            BigDecimal basePrice = record.getBorrowRecord().getBook().getReplacementPrice();
            if (basePrice == null) basePrice = BigDecimal.valueOf(100000);
            lostFee = basePrice;
        }
        
        BigDecimal total = lateFee.add(damageFee).add(lostFee);
        return com.tlu.Hybird_Library_SE302.dto.resp.PaymentCalculationResp.builder()
                .lateFee(lateFee)
                .damageFee(damageFee)
                .lostFee(lostFee)
                .totalAmount(total)
                .build();
    }
    
    @Override
    public PaymentTransactionResp processReturnPayment(int returnRecordId, ProcessReturnPaymentReq request) {
        ReturnRecord record = iReturnRecordRepository.findById(returnRecordId).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu trả!"));
        com.tlu.Hybird_Library_SE302.dto.resp.PaymentCalculationResp calc = calculateReturnPayment(returnRecordId);
        
        PaymentTransaction pt = PaymentTransaction.builder()
                .transactionCode("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(record.getBorrowRecord() != null ? record.getBorrowRecord().getUser() : null)
                .amount(calc.getTotalAmount())
                .status(PaymentStatus.PAID)
                .paymentMethod(request.getPaymentMethod())
                .paidAt(LocalDateTime.now())
                .build();
                
        PaymentTransaction savedPt = iPaymentTransactionRepository.save(pt);
        
        if (calc.getLateFee().compareTo(BigDecimal.ZERO) > 0) {
            PaymentItem item = PaymentItem.builder()
                    .paymentTransaction(savedPt)
                    .itemType(PaymentItemType.LATE_PENALTY)
                    .amount(calc.getLateFee())
                    .description("Phí trả muộn đơn trả " + returnRecordId)
                    .build();
            iPaymentItemRepository.save(item);
        }
        if (calc.getDamageFee().compareTo(BigDecimal.ZERO) > 0) {
            PaymentItem item = PaymentItem.builder()
                    .paymentTransaction(savedPt)
                    .itemType(PaymentItemType.DAMAGED_BOOK)
                    .amount(calc.getDamageFee())
                    .description("Phí hỏng sách đơn trả " + returnRecordId)
                    .build();
            iPaymentItemRepository.save(item);
        }
        if (calc.getLostFee().compareTo(BigDecimal.ZERO) > 0) {
            PaymentItem item = PaymentItem.builder()
                    .paymentTransaction(savedPt)
                    .itemType(PaymentItemType.LOST_BOOK)
                    .amount(calc.getLostFee())
                    .description("Phí làm mất sách đơn trả " + returnRecordId)
                    .build();
            iPaymentItemRepository.save(item);
        }
        
        // Update ReturnRecord statuses
        record.setApprovalStatus(ApprovalStatus.APPROVED);
        record.setBorrowStatus(BorrowStatus.RETURNED);
        iReturnRecordRepository.save(record);
        
        // Update associated BorrowRecord status
        if (record.getBorrowRecord() != null) {
            record.getBorrowRecord().setBorrowStatus(BorrowStatus.RETURNED);
            iBorrowRecordRepository.save(record.getBorrowRecord());
        }
        
        return mapToResp(savedPt);
    }
}