-- Nutrition Awareness Website - MySQL Database Schema & Sample Data
CREATE DATABASE IF NOT EXISTS nutrition_awareness
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nutrition_awareness;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Nutrients Table
CREATE TABLE IF NOT EXISTS nutrients (
  nutrient_id INT AUTO_INCREMENT PRIMARY KEY,
  nutrient_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  functions TEXT NOT NULL,
  food_sources TEXT NOT NULL
);

-- 3. Vitamins Table
CREATE TABLE IF NOT EXISTS vitamins (
  vitamin_id INT AUTO_INCREMENT PRIMARY KEY,
  vitamin_name VARCHAR(100) NOT NULL,
  functions TEXT NOT NULL,
  food_sources TEXT NOT NULL,
  deficiency_information TEXT NOT NULL
);

-- 4. Deficiency Diseases Table
CREATE TABLE IF NOT EXISTS deficiency_diseases (
  disease_id INT AUTO_INCREMENT PRIMARY KEY,
  disease_name VARCHAR(150) NOT NULL,
  nutrient_deficiency VARCHAR(100) NOT NULL,
  symptoms TEXT NOT NULL,
  causes TEXT NOT NULL,
  prevention TEXT NOT NULL
);

-- 5. Healthy Foods Table
CREATE TABLE IF NOT EXISTS healthy_foods (
  food_id INT AUTO_INCREMENT PRIMARY KEY,
  food_name VARCHAR(120) NOT NULL,
  food_category VARCHAR(80) NOT NULL,
  benefits TEXT NOT NULL,
  image_url VARCHAR(255) NOT NULL
);

-- 6. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Nutrition Seed Data
INSERT INTO nutrients (nutrient_name, description, functions, food_sources) VALUES
('Carbohydrates', 'Primary body fuel source broken down into glucose.', 'Supplies energy for brain and muscles; spares protein; provides digestive fiber.', 'Rolled Oats, Quinoa, Brown Rice, Sweet Potatoes, Lentils'),
('Proteins', 'Amino acid chains forming body structures and enzymes.', 'Builds and repairs tissues; synthesizes enzymes, hormones, and antibodies.', 'Wild Salmon, Farm Eggs, Lentils, Greek Yogurt, Chickpeas'),
('Fats', 'Lipid molecules vital for hormones and cell membranes.', 'Aids Vitamin A/D/E/K absorption; protects organs; supplies essential omega-3s.', 'Avocado, Walnuts, Olive Oil, Wild Salmon, Almonds'),
('Vitamins', 'Organic micronutrients supporting metabolic pathways.', 'Catalyzes energy metabolism, immune defense, and cellular repair.', 'Spinach, Yellow Bell Peppers, Oranges, Kiwi, Salmon'),
('Minerals', 'Inorganic elements needed for bones, blood, and nerves.', 'Supports bone density, oxygen transport, thyroid hormones, and fluid balance.', 'Milk, Yogurt, Spinach, Broccoli, Lentils, Iodized Salt'),
('Water', 'Essential biological solvent making up 60% of body mass.', 'Transports nutrients, regulates temperature, and clears kidney waste.', 'Drinking Water, Herbal Tea, Cucumber, Citrus Fruits');

INSERT INTO vitamins (vitamin_name, functions, food_sources, deficiency_information) VALUES
('Vitamin A', 'Supports retinal night vision, skin barriers, and immune cell regulation.', 'Sweet Potatoes, Spinach, Carrots, Eggs, Fortified Milk', 'Night blindness (nyctalopia), xerophthalmia, and higher infection risk.'),
('Vitamin B Complex', 'Drives cellular ATP energy conversion, DNA synthesis, and nerve health.', 'Oats, Quinoa, Lentils, Spinach, Salmon, Eggs, Yogurt', 'Fatigue, megaloblastic anaemia, and peripheral neuropathy.'),
('Vitamin C', 'Builds collagen, neutralizes free radicals, and boosts iron uptake.', 'Yellow Bell Peppers, Kiwi, Oranges, Broccoli, Blueberries', 'Scurvy with bleeding gums, slow wound healing, and joint aches.'),
('Vitamin D', 'Enhances calcium and phosphorus absorption for bone mineralization.', 'Wild Salmon, Fortified Milk, Egg Yolks, Safe Sunlight', 'Rickets in children and osteomalacia or osteoporosis in adults.'),
('Vitamin E', 'Protects lipid cell membranes from oxidative damage.', 'Almonds, Avocado, Sunflower Seeds, Spinach, Olive Oil', 'Nerve damage, muscle weakness, and impaired coordination.'),
('Vitamin K', 'Activates blood clotting factors and bone calcium-binding proteins.', 'Spinach, Broccoli, Kale, Edamame, Fermented Foods', 'Easy bruising, prolonged bleeding, and weaker bone density.');

INSERT INTO deficiency_diseases (disease_name, nutrient_deficiency, symptoms, causes, prevention) VALUES
('Iron Deficiency & Anaemia', 'Iron', 'Fatigue, pale skin, shortness of breath, dizziness, brittle nails.', 'Low dietary iron intake, blood loss, or elevated needs during growth/pregnancy.', 'Eat lentils, spinach, and chickpeas paired with Vitamin C-rich citrus or peppers.'),
('Vitamin A Deficiency', 'Vitamin A', 'Night blindness, dry eyes, rough skin, frequent respiratory infections.', 'Low intake of colorful vegetables, dairy, or eggs; fat malabsorption.', 'Consume sweet potatoes, leafy greens, and healthy fats daily.'),
('Vitamin D Deficiency', 'Vitamin D', 'Bone ache, muscle weakness, rickets in children, fracture risk.', 'Minimal sunlight exposure and low intake of fatty fish or fortified dairy.', 'Safe midday sunlight and foods like salmon, egg yolks, and fortified milk.'),
('Vitamin C Deficiency', 'Vitamin C', 'Bleeding gums, slow wound healing, pinpoint skin spots, fatigue.', 'Lack of fresh produce or over-boiling heat-sensitive vegetables.', 'Eat raw or lightly steamed citrus, kiwi, broccoli, and bell peppers daily.'),
('Iodine Deficiency', 'Iodine', 'Neck swelling (goiter), sluggish metabolism, cold sensitivity, fatigue.', 'Iodine-poor inland soils and use of non-iodized salt without dairy/seafood.', 'Use iodized salt moderately alongside dairy, eggs, and marine seafood.');

INSERT INTO healthy_foods (food_name, food_category, benefits, image_url) VALUES
('Amla (Indian Gooseberry)', 'Fruits', 'Extraordinary Vitamin C density supporting immunity, collagen synthesis, and iron absorption.', '/src/assets/images/indian_fruits_vegetables_1794996553855.jpg'),
('Fresh Pomegranate (Anar)', 'Fruits', 'Antioxidant-rich arils supporting hemoglobin recovery and cardiovascular health.', '/src/assets/images/indian_fruits_vegetables_1794996553855.jpg'),
('Pink Guava (Amrood)', 'Fruits', 'High Vitamin C and pectin fiber supporting digestion and glycemic control.', '/src/assets/images/indian_fruits_vegetables_1794996553855.jpg'),
('Ripe Papaya (Papita)', 'Fruits', 'Supplies beta-carotene Vitamin A and natural papain digestive enzymes.', '/src/assets/images/indian_fruits_vegetables_1794996553855.jpg'),
('Drumstick Pods (Moringa)', 'Vegetables', 'South Asian staple rich in calcium, iron, Vitamin C, and phytonutrients.', '/src/assets/images/indian_fruits_vegetables_1794996553855.jpg'),
('Fenugreek Leaves (Methi)', 'Vegetables', 'Iron-rich leafy green supporting blood sugar regulation and Vitamin K.', '/src/assets/images/indian_fruits_vegetables_1794996553855.jpg'),
('Homemade Curd (Dahi)', 'Milk Products', 'Probiotic cultured dairy delivering calcium, B12, and digestive flora.', '/src/assets/images/indian_dairy_nuts_seeds_1794996558741.jpg'),
('Spiced Buttermilk (Chaas)', 'Milk Products', 'Hydrating probiotic drink aiding post-meal digestion and electrolytes.', '/src/assets/images/indian_dairy_nuts_seeds_1794996558741.jpg'),
('Fresh Paneer', 'Milk Products', 'Complete slow-digesting vegetarian dairy protein with bone calcium.', '/src/assets/images/indian_dals_paneer_protein_1794996552634.jpg'),
('Roasted Makhana (Fox Nuts)', 'Nuts', 'Light mineral-dense puffed lotus seeds with magnesium and potassium.', '/src/assets/images/indian_dairy_nuts_seeds_1794996558741.jpg'),
('Soaked Almonds (Badam)', 'Nuts', 'Rich in Vitamin E, magnesium, and healthy monounsaturated fats.', '/src/assets/images/indian_dairy_nuts_seeds_1794996558741.jpg'),
('Ragi (Finger Millet)', 'Whole Grains', 'Plant-based calcium and iron powerhouse supporting strong bones.', '/src/assets/images/indian_whole_grains_millets_1794996552212.jpg'),
('Jowar & Bajra Millets', 'Whole Grains', 'Gluten-free Indian millets high in fiber, iron, zinc, and magnesium.', '/src/assets/images/indian_whole_grains_millets_1794996552212.jpg'),
('Yellow Moong Dal & Sprouts', 'Protein-Rich Foods', 'Easily digestible plant protein, folate, and sprouted Vitamin C.', '/src/assets/images/indian_dals_paneer_protein_1794996552634.jpg'),
('Kala Chana & Rajma', 'Protein-Rich Foods', 'High-fiber legumes supplying plant protein, iron, and sustained energy.', '/src/assets/images/indian_dals_paneer_protein_1794996552634.jpg'),
('Wild Caught Salmon', 'Protein-Rich Foods', 'Bioavailable protein rich in Vitamin D and EPA/DHA omega-3s.', '/src/assets/images/food_protein_wholesome_1794995822998.jpg');
