-- Optional demo data. Run while signed in as the demo user, or adapt user_id.
-- Replace YOUR_USER_UUID with the authenticated user's UUID.
insert into public.orders
(user_id, customer_name, customer_phone, product_description, delivery_date, status)
values
('YOUR_USER_UUID','Ardit Hoxha','0691234567','Birthday cake, chocolate, 2 kg',current_date + 1,'Pending'),
('YOUR_USER_UUID','Elira Kola','0687654321','Custom gift box',current_date + 3,'Preparing');
