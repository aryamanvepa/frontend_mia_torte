# Test label data (made up)

**For testing only. None of these values come from a pack label or a laboratory.**
They are plausible estimates written so that every product page can be tested with full information:
- ingredients, allergens, veg/vegan, best before
- the full nutrition table

On the site, every value carries a **Test data** tag.

Where real values exist they replace these automatically. Real values are entered in the ops app under Admin → Products.

Source file: `src/content/test-labels.ts`. To switch it off before launch, set `TEST_LABELS = false`.

FSSAI requires the label information on the website to match the printed pack. None of this can go live.

29 products (two of them, Oreo Cookies n Cream and Assorted Cookie Gift Box, not in the catalogue yet).

## Nutrition per 100 g

| Product | kcal | Protein g | Carbs g | Sugars g | Added sugars g | Fibre g | Fat g | Sat. fat g | Trans fat g | Cholesterol mg | Sodium mg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Classic Chocolate Chip | 492 | 5.8 | 63 | 32 | 30 | 2.1 | 24 | 14 | 0 | 38 | 290 |
| Mocha Me Happy | 486 | 6.2 | 61 | 30 | 28 | 3.4 | 24 | 14 | 0 | 36 | 270 |
| Red Velvet Melt | 488 | 5.5 | 64 | 34 | 32 | 1.6 | 23 | 14 | 0 | 35 | 260 |
| Nutella Brownie Bliss | 505 | 6.4 | 60 | 36 | 34 | 2.8 | 26 | 13 | 0 | 30 | 220 |
| Carrot Crème Melt | 468 | 5.2 | 62 | 31 | 29 | 2.0 | 22 | 13 | 0 | 34 | 240 |
| Biscoff Indulgence | 498 | 5.0 | 64 | 33 | 31 | 1.5 | 25 | 13 | 0 | 32 | 310 |
| Berry Nutty About Pista | 484 | 7.1 | 59 | 28 | 26 | 2.9 | 24 | 12 | 0 | 33 | 230 |
| Oreo Cookies n Cream | 494 | 5.4 | 64 | 33 | 31 | 1.8 | 24 | 14 | 0 | 34 | 300 |
| Assorted Cookie Gift Box | 492 | 5.7 | 63 | 33 | 31 | 2.2 | 24 | 14 | 0 | 35 | 270 |
| Jowar Jeera Delight (8 nos.) | 468 | 8.1 | 63 | 14 | 12 | 5.2 | 20 | 11 | 0 | 26 | 380 |
| Fruit & Nut Muesli | 402 | 10.8 | 63 | 17 | 9 | 8.2 | 12 | 2.1 | 0 | 0 | 95 |
| Nutty Mango Millets & Nuts Muesli | 398 | 10.2 | 64 | 16 | 8 | 8.6 | 11 | 1.9 | 0 | 0 | 60 |
| Nutty Orange Millets & Nuts Muesli | 396 | 10.1 | 64 | 15 | 8 | 8.8 | 11 | 1.9 | 0 | 0 | 60 |
| Crunchy Strawberry Millets & Nuts Muesli | 404 | 9.6 | 66 | 18 | 10 | 7.9 | 11 | 1.8 | 0 | 0 | 70 |
| Peri Peri Vegie Chips | 518 | 4.6 | 56 | 9 | 2 | 9.4 | 30 | 3.6 | 0 | 0 | 640 |
| Pudina Millet Crunch | 476 | 9.4 | 59 | 3 | 1 | 6.8 | 22 | 4.1 | 0 | 0 | 720 |
| Salted Nuts & Bean Crunch | 528 | 21 | 29 | 4 | 0 | 9.1 | 36 | 5.2 | 0 | 0 | 480 |
| Peri Peri Trail Mix | 534 | 18 | 31 | 10 | 3 | 7.6 | 38 | 5.4 | 0 | 0 | 520 |
| Masala Protein Bean Mix | 432 | 23 | 46 | 4 | 1 | 13 | 16 | 2.6 | 0 | 0 | 610 |
| Multigrain Superseed Atta (MGA) | 362 | 13.4 | 65 | 1.6 | 0 | 11.2 | 5.2 | 0.9 | 0 | 0 | 9 |
| Gluten Free Superseed Atta | 378 | 10.9 | 66 | 1.3 | 0 | 10.4 | 7.6 | 1.1 | 0 | 0 | 12 |
| Ragi Flour | 328 | 7.3 | 72 | 0.6 | 0 | 11.5 | 1.3 | 0.3 | 0 | 0 | 11 |
| Bajra Flour | 361 | 11.6 | 67 | 1.0 | 0 | 11.3 | 5.0 | 1.0 | 0 | 0 | 10 |
| Jowar Flour | 349 | 10.4 | 72.6 | 1.5 | 0 | 9.7 | 1.9 | 0.3 | 0 | 0 | 7 |
| Sattu (Roasted Gram Flour) | 406 | 22 | 65 | 2.0 | 0 | 18 | 5.3 | 0.7 | 0 | 0 | 25 |
| Instant MultiMillet Dosa Mix | 348 | 11.2 | 69 | 1.4 | 0 | 8.1 | 2.6 | 0.5 | 0 | 0 | 880 |
| Instant Multigrain Dosa Mix | 352 | 12.4 | 68 | 1.6 | 0 | 6.9 | 2.9 | 0.6 | 0 | 0 | 900 |
| Instant Pesarattu Dosa Mix | 341 | 21.6 | 58 | 2.1 | 0 | 12.3 | 2.0 | 0.4 | 0 | 0 | 850 |
| Instant Peanut Putana Chutney | 522 | 24 | 30 | 5 | 2 | 10.2 | 34 | 5.6 | 0 | 0 | 1380 |

## Ingredients, allergens, diet, best before

### Classic Chocolate Chip
- **Ingredients:** Refined wheat flour, butter, brown sugar, dark chocolate chips (sugar, cocoa solids, cocoa butter, emulsifier (soy lecithin)), sugar, milk solids, raising agent (sodium bicarbonate), vanilla, salt.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts, peanuts and soy.
- **Diet:** Vegetarian
- **Best before:** 60 days from packing

### Mocha Me Happy
- **Ingredients:** Refined wheat flour, butter, sugar, dark chocolate (sugar, cocoa solids, cocoa butter, emulsifier (soy lecithin)), cocoa powder, coffee (2%), milk solids, raising agent (sodium bicarbonate), salt.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts, peanuts and soy.
- **Diet:** Vegetarian
- **Best before:** 60 days from packing

### Red Velvet Melt
- **Ingredients:** Refined wheat flour, butter, sugar, white chocolate chips (sugar, cocoa butter, milk solids, emulsifier (soy lecithin)), cocoa powder, milk solids, beetroot powder (for colour), raising agent (sodium bicarbonate), vanilla, salt.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts, peanuts and soy.
- **Diet:** Vegetarian
- **Best before:** 60 days from packing

### Nutella Brownie Bliss
- **Ingredients:** Hazelnut cocoa spread (sugar, palm oil, hazelnuts 13%, skimmed milk powder, cocoa, emulsifier (soy lecithin), vanillin), refined wheat flour, butter, brown sugar, dark chocolate, cocoa powder, raising agent (sodium bicarbonate), salt.
- **Allergens:** Contains wheat (gluten), milk, hazelnuts and soy. May contain other nuts and peanuts.
- **Diet:** Vegetarian
- **Best before:** 45 days from packing

### Carrot Crème Melt
- **Ingredients:** Refined wheat flour, butter, brown sugar, carrot (10%), white chocolate (sugar, cocoa butter, milk solids, emulsifier (soy lecithin)), milk solids, cinnamon, nutmeg, raising agent (sodium bicarbonate), salt.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts, peanuts and soy.
- **Diet:** Vegetarian
- **Best before:** 30 days from packing

### Biscoff Indulgence
- **Ingredients:** Refined wheat flour, butter, Biscoff spread (12%) (caramelised biscuits (wheat flour, sugar, vegetable oils, candy sugar syrup, raising agent, soy flour, salt, cinnamon), rapeseed oil, sugar, emulsifier (soy lecithin)), brown sugar, Biscoff biscuit pieces, milk solids, raising agent (sodium bicarbonate), salt.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts, peanuts and soy.
- **Diet:** Vegetarian
- **Best before:** 60 days from packing

### Berry Nutty About Pista
- **Ingredients:** Refined wheat flour, butter, sugar, pistachios (10%), dried cranberries (8%) (cranberries, sugar, sunflower oil), white chocolate (sugar, cocoa butter, milk solids, emulsifier (soy lecithin)), milk solids, raising agent (sodium bicarbonate), cardamom, salt.
- **Allergens:** Contains wheat (gluten), milk, pistachios and soy. May contain other nuts and peanuts.
- **Diet:** Vegetarian
- **Best before:** 60 days from packing

### Oreo Cookies n Cream
- **Ingredients:** Refined wheat flour, butter, brown sugar, chocolate sandwich biscuit pieces (15%) (wheat flour, sugar, palm oil, cocoa, raising agents, salt, emulsifier (soy lecithin), vanillin), white chocolate (sugar, cocoa butter, milk solids, emulsifier (soy lecithin)), sugar, milk solids, raising agent (sodium bicarbonate), vanilla, salt.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts, peanuts and soy.
- **Diet:** Vegetarian
- **Best before:** 60 days from packing

### Assorted Cookie Gift Box
- **Ingredients:** Assorted eggless cookies: Red Velvet Melt, Classic Chocolate Chip and Triple Choco Bliss. Refined wheat flour, butter, sugar, brown sugar, dark and white chocolate (sugar, cocoa solids, cocoa butter, milk solids, emulsifier (soy lecithin)), cocoa powder, milk solids, beetroot powder (for colour), raising agent (sodium bicarbonate), vanilla, salt.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts, peanuts and soy.
- **Diet:** Vegetarian
- **Best before:** 45 days from packing

### Jowar Jeera Delight (8 nos.)
- **Ingredients:** Jowar (sorghum) flour (45%), whole wheat flour, butter, sugar, cumin seeds (2%), milk solids, raising agent (sodium bicarbonate), salt, ajwain.
- **Allergens:** Contains wheat (gluten) and milk. May contain nuts and sesame.
- **Diet:** Vegetarian
- **Best before:** 90 days from packing

### Fruit & Nut Muesli
- **Ingredients:** Rolled oats (40%), corn flakes (corn, sugar, salt), almonds (8%), raisins (7%), cashews (5%), pumpkin seeds, dried cranberries (cranberries, sugar, sunflower oil), honey, wheat flakes.
- **Allergens:** Contains oats and wheat (gluten), almonds and cashews. May contain peanuts, milk and sesame.
- **Diet:** Vegetarian
- **Best before:** 180 days from packing

### Nutty Mango Millets & Nuts Muesli
- **Ingredients:** Millet flakes (jowar, ragi, bajra) (38%), rolled oats, puffed amaranth, almonds (7%), cashews (5%), dried mango pieces (6%) (mango, sugar), pumpkin seeds, jaggery, natural mango flavour.
- **Allergens:** Contains oats (gluten), almonds and cashews. May contain peanuts, milk and sesame.
- **Diet:** Vegetarian (vegan)
- **Best before:** 180 days from packing

### Nutty Orange Millets & Nuts Muesli
- **Ingredients:** Millet flakes (jowar, ragi, bajra) (38%), rolled oats, puffed amaranth, almonds (7%), cashews (5%), candied orange peel (5%) (orange peel, sugar), pumpkin seeds, jaggery, natural orange flavour.
- **Allergens:** Contains oats (gluten), almonds and cashews. May contain peanuts, milk and sesame.
- **Diet:** Vegetarian (vegan)
- **Best before:** 180 days from packing

### Crunchy Strawberry Millets & Nuts Muesli
- **Ingredients:** Millet flakes (jowar, ragi, bajra) (36%), corn flakes, rolled oats, almonds (6%), cashews (5%), freeze-dried strawberry (4%), strawberry-flavoured cereal bites (rice flour, sugar, beetroot powder), pumpkin seeds, jaggery, natural strawberry flavour.
- **Allergens:** Contains oats (gluten), almonds and cashews. May contain peanuts, milk and sesame.
- **Diet:** Vegetarian (vegan)
- **Best before:** 180 days from packing

### Peri Peri Vegie Chips
- **Ingredients:** Sweet potato, beetroot, tapioca, carrot, sunflower oil, peri peri seasoning (6%) (chilli, garlic, onion, paprika, salt, sugar, citric acid, oregano).
- **Allergens:** May contain milk, gluten and sesame.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Pudina Millet Crunch
- **Ingredients:** Jowar (sorghum) flour, ragi flour, bajra flour, chana dal flour, rice bran oil, mint (pudina) powder (3%), salt, dry mango powder, black salt, cumin, green chilli powder.
- **Allergens:** May contain wheat (gluten), peanuts and sesame.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Salted Nuts & Bean Crunch
- **Ingredients:** Peanuts (30%), roasted green peas, almonds (12%), cashews (10%), roasted chana, moong dal, rice bran oil, salt.
- **Allergens:** Contains peanuts, almonds and cashews. May contain sesame and gluten.
- **Diet:** Vegetarian (vegan)
- **Best before:** 150 days from packing

### Peri Peri Trail Mix
- **Ingredients:** Almonds (20%), cashews (18%), peanuts, pumpkin seeds, sunflower seeds, raisins, roasted chana, rice bran oil, peri peri seasoning (4%) (chilli, garlic, onion, paprika, salt, sugar, citric acid).
- **Allergens:** Contains tree nuts. May contain peanuts, sesame and gluten.
- **Diet:** Vegetarian (vegan)
- **Best before:** 150 days from packing

### Masala Protein Bean Mix
- **Ingredients:** Roasted chana (40%), roasted soybeans (25%), roasted green peas, moong dal, rice bran oil, masala (chilli, coriander, cumin, dry mango powder, black salt, turmeric, salt).
- **Allergens:** Contains soy. May contain peanuts, gluten and sesame.
- **Diet:** Vegetarian (vegan)
- **Best before:** 150 days from packing

### Multigrain Superseed Atta (MGA)
- **Ingredients:** Whole wheat (60%), jowar, bajra, ragi, oats, soybean, chana, flaxseed (2%), chia seeds (1%), pumpkin seeds (1%).
- **Allergens:** Contains wheat and oats (gluten) and soy. Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Gluten Free Superseed Atta
- **Ingredients:** Jowar (35%), ragi (20%), bajra (15%), rice flour, chana dal, flaxseed (4%), chia seeds (2%), pumpkin seeds (2%), psyllium husk.
- **Allergens:** Made without gluten-containing grains. Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Ragi Flour
- **Ingredients:** Ragi (finger millet) (100%).
- **Allergens:** Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Bajra Flour
- **Ingredients:** Bajra (pearl millet) (100%).
- **Allergens:** Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 60 days from packing

### Jowar Flour
- **Ingredients:** Jowar (sorghum) (100%).
- **Allergens:** Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Sattu (Roasted Gram Flour)
- **Ingredients:** Roasted Bengal gram (chana) (100%).
- **Allergens:** Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Instant MultiMillet Dosa Mix
- **Ingredients:** Jowar flour, ragi flour, bajra flour, rice flour, urad dal flour (15%), fenugreek, salt, raising agent (sodium bicarbonate), cumin.
- **Allergens:** Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Instant Multigrain Dosa Mix
- **Ingredients:** Rice flour, urad dal flour (18%), whole wheat flour, jowar flour, oats flour, chana dal flour, fenugreek, salt, raising agent (sodium bicarbonate).
- **Allergens:** Contains wheat and oats (gluten). Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Instant Pesarattu Dosa Mix
- **Ingredients:** Whole green gram (moong) flour (65%), rice flour, ginger powder, green chilli powder, cumin, salt, raising agent (sodium bicarbonate).
- **Allergens:** Packed in a facility that also handles wheat, peanuts, sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing

### Instant Peanut Putana Chutney
- **Ingredients:** Roasted peanuts (45%), roasted gram (putana) dal (30%), dry red chilli, garlic, tamarind, curry leaves, salt, jaggery, rice bran oil.
- **Allergens:** Contains peanuts. May contain sesame and tree nuts.
- **Diet:** Vegetarian (vegan)
- **Best before:** 120 days from packing
