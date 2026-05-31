package com.tlu.Hybird_Library_SE302.dto.resp;
import com.tlu.Hybird_Library_SE302.model.constants.BookType;
import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResp {
    private Integer id;
    private Integer cartId;
    private Integer bookId;
    private BookType bookType;
    private BookResp book;
}