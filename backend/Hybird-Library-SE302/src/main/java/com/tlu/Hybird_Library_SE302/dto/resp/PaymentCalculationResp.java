package com.tlu.Hybird_Library_SE302.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCalculationResp {
    private BigDecimal lateFee;
    private BigDecimal damageFee;
    private BigDecimal lostFee;
    private BigDecimal totalAmount;
}
