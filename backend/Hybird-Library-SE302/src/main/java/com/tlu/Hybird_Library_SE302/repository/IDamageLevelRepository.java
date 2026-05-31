package com.tlu.Hybird_Library_SE302.repository;
import com.tlu.Hybird_Library_SE302.model.DamageLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface IDamageLevelRepository extends JpaRepository<DamageLevel, Integer> {
    boolean existsByLevelName(String levelName);
    boolean existsById(Integer id);

}