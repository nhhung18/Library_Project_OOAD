package com.tlu.Hybird_Library_SE302.service.core.impl;
import com.tlu.Hybird_Library_SE302.dto.req.*;
import com.tlu.Hybird_Library_SE302.dto.resp.DamageLevelResp;
import com.tlu.Hybird_Library_SE302.dto.resp.ReturnRecordResp;
import com.tlu.Hybird_Library_SE302.model.PenaltyCost;
import com.tlu.Hybird_Library_SE302.model.ReturnRecord;
import com.tlu.Hybird_Library_SE302.model.BorrowRecord;
import com.tlu.Hybird_Library_SE302.model.DamageLevel;
import com.tlu.Hybird_Library_SE302.model.constants.PenaltyCostName;
import com.tlu.Hybird_Library_SE302.repository.IPenaltyCostRepository;
import com.tlu.Hybird_Library_SE302.repository.IReturnRecordRepository;
import com.tlu.Hybird_Library_SE302.repository.IBorrowRecordRepository;
import com.tlu.Hybird_Library_SE302.repository.IDamageLevelRepository;
import com.tlu.Hybird_Library_SE302.service.core.intf.IReturnRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
@Service
@RequiredArgsConstructor
public class ReturnRecordService implements IReturnRecordService {
    private final IReturnRecordRepository iReturnRecordRepository;
    private final IBorrowRecordRepository iBorrowRecordRepository;
    private final IDamageLevelRepository iDamageLevelRepository;
    private final IPenaltyCostRepository iPenaltyCostRepository;
    
    @Override
    public List<ReturnRecordResp> getAllReturnRecords() {
        return iReturnRecordRepository.findAll().stream().map(this::mapToResp).toList();
    }
    @Override
    public ReturnRecordResp getReturnRecordById(int id) {
        ReturnRecord record = iReturnRecordRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu trả!"));
        return mapToResp(record);
    }
    @Override
    public ReturnRecordResp createReturnRecord(CreateReturnRecordReq request) {
        BorrowRecord borrowRecord = iBorrowRecordRepository.findById(request.getBorrowRecord().getId()).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu mượn!"));
        DamageLevel damageLevel = null;
        PenaltyCost penaltyCost = iPenaltyCostRepository.findByPenaltyCostName(PenaltyCostName.LATE).orElseThrow(() -> new RuntimeException("Không tìm thấy tên phiếu !"));
        if(request.getDamageLevelId() != null) {
            damageLevel = iDamageLevelRepository.findById(request.getDamageLevelId()).orElse(null);
        }
        LocalDateTime returnDate = request.getReturnDate();
        returnDate = LocalDateTime.now();
        long lateDays = Math.max(
                0,
                ChronoUnit.DAYS.between(borrowRecord.getDueDate(), returnDate)
        );
        
        com.tlu.Hybird_Library_SE302.model.constants.ApprovalStatus approvalStatus = request.getApprovalStatus() != null ? request.getApprovalStatus() : com.tlu.Hybird_Library_SE302.model.constants.ApprovalStatus.PENDING;
        if (borrowRecord.getBookType() == com.tlu.Hybird_Library_SE302.model.constants.BookType.EBOOK) {
            approvalStatus = com.tlu.Hybird_Library_SE302.model.constants.ApprovalStatus.APPROVED;
            borrowRecord.setBorrowStatus(com.tlu.Hybird_Library_SE302.model.constants.BorrowStatus.RETURNED);
            iBorrowRecordRepository.save(borrowRecord);
        }
        
        ReturnRecord record = ReturnRecord.builder()
            .borrowRecord(borrowRecord)
            .returnDate(returnDate)
            .returnDelayDays(Integer.valueOf((int) lateDays))
            .fineAmount(penaltyCost.getPrice().multiply(BigDecimal.valueOf(lateDays)))
            .approvalStatus(approvalStatus)
            .damageLevel(damageLevel)
            .isLost(request.getIsLost() != null ? request.getIsLost() : false)
            .returnMethod(request.getReturnMethod() != null ? request.getReturnMethod() : com.tlu.Hybird_Library_SE302.model.constants.ReturnMethod.LIBRARY_RETURN)
            .build();
        return mapToResp(iReturnRecordRepository.save(record));
    }
    @Override
    public ReturnRecordResp updateReturnRecord(int id, UpdateReturnRecordReq request) {
        ReturnRecord record = iReturnRecordRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu trả!"));
        if(request.getDamageLevel() != null) {
            DamageLevel damageLevel = iDamageLevelRepository.findById(request.getDamageLevel().getId()).orElse(null);
            record.setDamageLevel(damageLevel);
        } else {
            record.setDamageLevel(null);
        }
        if(request.getReturnDelayDays() != null) record.setReturnDelayDays(request.getReturnDelayDays());
        if(request.getFineAmount() != null) record.setFineAmount(request.getFineAmount());
        if(request.getApprovalStatus() != null) record.setApprovalStatus(request.getApprovalStatus());
        if(request.getIsLost() != null) record.setIsLost(request.getIsLost());
        if(request.getReturnMethod() != null) record.setReturnMethod(request.getReturnMethod());
        return mapToResp(iReturnRecordRepository.save(record));
    }
    @Override
    public void deleteReturnRecord(int id) {
        ReturnRecord record = iReturnRecordRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu trả!"));
        iReturnRecordRepository.delete(record);
    }
    private ReturnRecordResp mapToResp(ReturnRecord record) {
        DamageLevelResp damageLevelResp = null;
        if (record.getDamageLevel() != null) {
            damageLevelResp = DamageLevelResp.builder()
                .id(record.getDamageLevel().getId())
                .levelName(record.getDamageLevel().getLevelName())
                .percentValue(record.getDamageLevel().getPercentValue())
                .description(record.getDamageLevel().getDescription())
                .build();
        }
        return ReturnRecordResp.builder()
            .id(record.getId())
            .borrowRecord(record.getBorrowRecord() != null ? record.getBorrowRecord() : null)
            .returnDate(record.getReturnDate())
            .returnDelayDays(record.getReturnDelayDays())
            .fineAmount(record.getFineAmount())
            .approvalStatus(record.getApprovalStatus())
            .damageLevel(damageLevelResp)
            .isLost(record.getIsLost())
            .returnMethod(record.getReturnMethod())
            .build();
    }
}