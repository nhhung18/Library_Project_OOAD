package com.tlu.Hybird_Library_SE302.model;
import com.tlu.Hybird_Library_SE302.model.base.BaseIdObject;
import com.tlu.Hybird_Library_SE302.model.constants.BookType;
import com.tlu.Hybird_Library_SE302.model.constants.BookCondition;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
@Entity
@Table(name = "books")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Book extends BaseIdObject {
    @Column(name = "title", nullable = false)
    private String title;
    @Column(name = "author")
    private String author;
    @Column(name = "publisher")
    private String publisher;
    @Column(name = "publish_year")
    private Integer publishYear;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "book_type", nullable = false)
    private BookType bookType;
    
    @Column(name = "likes", nullable = false)
    @Builder.Default
    private Integer likes = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "`condition`")
    @Builder.Default
    private BookCondition condition = BookCondition.GOOD;
    
    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 0;
    
    @Column(name = "book_url")
    private String bookUrl;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "avg_rating", precision = 2, scale = 1)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;
    
    @Column(name = "replacement_price", precision = 10, scale = 1)
    @Builder.Default
    private BigDecimal replacementPrice = BigDecimal.ZERO;
}