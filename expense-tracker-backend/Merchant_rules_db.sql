INSERT INTO merchant_rules (merchant, category, sub_category) VALUES

-- Travel
('REDBUS','Travel','Bus'),

-- Bills
('MYJIO','Bills','Phone'),
('AIRTEL','Bills','Phone'),

-- Groceries
('S M FRES','Living','Groceries'),
('LULU','Living','Groceries'),
('BBNOW','Living','Groceries'),

-- Food
('SAANKALP','Food','Dinner'),
('BUN WORL','Food','Snacks'),
('THE BAKI','Food','Snacks'),
('VINAYAK','Living','Food'),
('DVS FOOD','Living','Food'),
('NANDHINI','Living','Food'),
('PAAVAI','Living','Food'),
('CREDFOOD','Food','Dinner'),
('RAATA','Food','Dinner'),

-- Shopping
('BATA','Lifestyle','Shopping'),
('DECATHLO','Lifestyle','Shopping'),
('BORN BAB','Lifestyle','Shopping'),
('FLORET','Lifestyle','Shopping'),

-- Entertainment
('EXPLOREX','Lifestyle','Entertainment'),
('BANGALOR','Lifestyle','Entertainment'),

-- Financial
('ADDMONEY','Financial','Money Transfer'),
('INTEREST CREDIT','Financial','Income'),
('UNIFIED','Financial','other'),

-- Other / Miscellaneous
('HELMO','Other','Miscellaneous'),
('MARUTHI','Other','Miscellaneous'),
('SHASHIKA','Other','Miscellaneous'),
('V SENTHA','Other','Miscellaneous'),
('RADHA','Other','Miscellaneous'),
('DINESH B','Other','Miscellaneous'),
('PUTTASWA','Other','Miscellaneous'),
('GAJENDRA','Other','Miscellaneous'),
('SATISH K','Other','Miscellaneous'),
('MR VASU','Other','Miscellaneous'),
('CHINMAY','Other','Miscellaneous'),
('SIDDAPPA','Other','Miscellaneous'),
('MOHAMMED','Other','Miscellaneous'),
('GEORGE P','Other','Miscellaneous'),
('FATHIMA','Other','Miscellaneous'),
('DILIP P','Other','Miscellaneous'),
('RANGASWA','Other','Miscellaneous'),
('ISHWAR G','Other','Miscellaneous'),
('SUMA DEV','Other','Miscellaneous'),
('JITU KUM','Other','Miscellaneous'),
('KANTI SW','Other','Miscellaneous'),
('MRS SAR','Other','Miscellaneous'),
('TUKARAM','Other','Miscellaneous'),
('MURTHY','Other','Miscellaneous'),
('VENKATES','Other','Miscellaneous'),
('GHANAMAT','Other','Miscellaneous'),
('AMANULLA','Other','Miscellaneous'),
('DHANANJA','Other','Miscellaneous')

ON CONFLICT (merchant)
DO UPDATE SET
category = EXCLUDED.category,
sub_category = EXCLUDED.sub_category;