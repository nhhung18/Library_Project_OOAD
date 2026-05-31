package com.tlu.Hybird_Library_SE302.dto.resp;
import com.tlu.Hybird_Library_SE302.model.BorrowRecord;
import com.tlu.Hybird_Library_SE302.model.DamageLevel;
import com.tlu.Hybird_Library_SE302.model.constants.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRecordResp {
    private Integer id;
    private BorrowRecord borrowRecord;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private Integer returnDelayDays;
    private BigDecimal fineAmount;
    private ApprovalStatus approvalStatus;
    private DamageLevelResp damageLevel;
    private Boolean isLost;
    private ReturnMethod returnMethod;
}