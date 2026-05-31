package com.tlu.Hybird_Library_SE302.dto.req;

import com.tlu.Hybird_Library_SE302.model.constants.PaymentMethod;
import lombok.Data;

@Data
public class ProcessReturnPaymentReq {
    private PaymentMethod paymentMethod;
}
