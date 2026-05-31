package com.tlu.Hybird_Library_SE302.service.core.impl;
import com.tlu.Hybird_Library_SE302.dto.req.*;
import com.tlu.Hybird_Library_SE302.dto.resp.CartResp;
import com.tlu.Hybird_Library_SE302.model.Cart;
import com.tlu.Hybird_Library_SE302.model.User;
import com.tlu.Hybird_Library_SE302.repository.ICartRepository;
import com.tlu.Hybird_Library_SE302.repository.IUserRepository;
import com.tlu.Hybird_Library_SE302.service.core.intf.ICartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
@RequiredArgsConstructor
public class CartService implements ICartService {
    private final ICartRepository iCartRepository;
    private final IUserRepository iUserRepository;
    @Override
    public List<CartResp> getAllCarts() {
        return iCartRepository.findAll().stream().map(this::mapToResp).toList();
    }
    @Override
    public CartResp getCartById(int id) {
        Cart cart = iCartRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng!"));
        return mapToResp(cart);
    }
    @Override
    public CartResp getCartByUserId(int userId) {
        return iCartRepository.findByUserId(userId)
            .map(this::mapToResp)
            .orElseGet(() -> {
                User user = iUserRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
                Cart cart = Cart.builder().user(user).build();
                return mapToResp(iCartRepository.save(cart));
            });
    }
    @Override
    public CartResp createCart(CreateCartReq request) {
        if(iCartRepository.existsByUserId(request.getUserId())) throw new RuntimeException("User đã có giỏ hàng!");
        User user = iUserRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
        Cart cart = Cart.builder().user(user).build();
        return mapToResp(iCartRepository.save(cart));
    }
    @Override
    public CartResp updateCart(int id, UpdateCartReq request) {
        Cart cart = iCartRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng!"));
        if(request.getUserId() != null && !request.getUserId().equals(cart.getUser().getId())) {
            if(iCartRepository.existsByUserId(request.getUserId())) throw new RuntimeException("User đã có giỏ hàng!");
            User user = iUserRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
            cart.setUser(user);
        }
        return mapToResp(iCartRepository.save(cart));
    }
    @Override
    public void deleteCart(int id) {
        Cart cart = iCartRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng!"));
        iCartRepository.delete(cart);
    }
    private CartResp mapToResp(Cart cart) {
        return CartResp.builder()
            .id(cart.getId())
            .userId(cart.getUser() != null ? cart.getUser().getId() : null)
            .build();
    }
}