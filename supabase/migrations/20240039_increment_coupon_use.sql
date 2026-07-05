create or replace function increment_coupon_use(coupon_code text)
returns void as $$
begin
  update coupons set uses = uses + 1 where code = coupon_code;
end;
$$ language plpgsql security definer;