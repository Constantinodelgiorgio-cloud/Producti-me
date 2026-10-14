# Comparable nutrition-tracking and personal-finance apps (Argentine context), for Producti-me

Research date: 2026-10-14. Product context: single-user PWA in Argentina. Nutrition side: a rugby player (~102 kg, cutting to ~17% BF, 3000 kcal / 200 g protein) using a 308-item Argentine food DB. It has no barcode, photo AI, adaptive TDEE or weight-trend smoothing. Finance side: an ARS daily wallet with 5 accounts, category budgets, AI receipts, Gmail parsing, a USD portfolio and a 5,000 USD savings goal.
Method note: macrofactor.com, infobae.com, newswise.com, piggy.com.ar, cronista.com, iprofesional.com and openfoodfacts.org pages were downloaded and read in full. Everything else comes from search-result summaries and is flagged where it could not be checked against the primary source. The web-search budget ran out near the end of the session (see Gaps).

---

## Q1. MacroFactor's adaptive expenditure (TDEE) algorithm, trend weight, coaching check-ins and "adherence-neutral" design, and how Carbon and Fitia compare

### Takeaway
MacroFactor works energy balance backwards. It takes logged intake and the change in energy stored in the smoothed weight trend, and from those it solves for expenditure. Calorie targets are set again each week, and a missed target never triggers a "make up for it" cut. V3 of the algorithm (Oct 2024) tolerates up to 3 of 7 unlogged days. Its daily updates are about 35% smaller than V2's. The trend uses a recency-weighted average with interpolation of gaps, conceptually an EWMA (exponentially weighted moving average). The design deliberately avoids red numbers and shaming, partly because shaming makes people under-log, which corrupts the TDEE estimate.

### Cited Findings
**Core algorithm (MacroFactor, Greg Nuckols, "Algorithms and Core Philosophy", updated Oct 10, 2024)**
- The algorithms are "purely deterministic". Weight change reflects stored chemical energy, so expenditure = intake − Δstored energy. Initial TDEE comes from custom BMR equations plus custom activity multipliers that separate daily-life activity from purposeful exercise. — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)
- The initial estimate "sticks around for a few days". It starts moving after about 1 week and stabilizes after 14–30 days, depending on logging consistency. Users can back-fill 14–30 days of prior weight and intake data to skip that warm-up. — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)
- Trend weight uses "an averaging approach that accounts for the influence of weight values over a pretty long time scale, while placing more weight on more recent values". It ignores 1–4 day deviations that move back toward baseline and starts reacting by about day 4–5 if a deviation persists or accelerates. — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)
- The help docs say raw scale weights have their gaps filled by linear interpolation before smoothing (search summary of the help page; the page itself could not be fetched). — [MacroFactor help: weight trend](https://help.macrofactorapp.com/dashboard/weight_trend/)
- On macros: in "coached" mode, protein is set by exercise type (none / endurance / resistance / both) plus a low, mid or high preference. Carbs and fat follow preference. At very low calories the priority order is (1) a safe fat floor, (2) protein, (3) carbs. "Collaborative" mode adjusts only the weekly calorie budget. — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)
- Weekly check-ins treat "each week [as] its own self-contained unit". If you ate 2,600 instead of 2,500 kcal and still lost at the desired rate, the target goes up. "Recommendations are informative, not punitive." — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)
- Known failure modes are persistent non-fat weight shifts (starting creatine, switching between low-carb and high-carb, big fiber changes) and multi-day anomalous expenditure such as a week-long cycling trip. The advice is to skip the weekly check-in for 1–2 weeks. For diet breaks, either switch the goal to "maintain" or eat at the estimated expenditure. — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)
- Starting a cut produces quick glycogen and gut-content loss. The algorithm initially reads this as a faster-than-desired loss and raises calories slightly. This acts as an unintentional 1–2 week "ease-in". — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)

**V3 expenditure algorithm (MacroFactor, "In-Depth Look at V3", updated Oct 8, 2024)**
- V3 picks up real, durable trend changes 1–5 days sooner than V2 (about 3 days at reversals). Its day-to-day expenditure updates are about 35% smaller. It is less disturbed by salty or high-carb meals, starting creatine, menstrual fluid shifts and post-plateau "whooshes". — [MacroFactor V3](https://macrofactor.com/expenditure-v3/)
- On missing data: V2 needed about 80–85% complete nutrition data and paused if 2 or more of 7 days were missing. V3 handles about 3× more missing data and pauses only if more than 3 of 7 days are unlogged. With 50% of days randomly deleted, it stayed close to the full-data estimate. — [MacroFactor V3](https://macrofactor.com/expenditure-v3/)
- V3 imputes intake on unlogged days. The average error is about 13% (stated as "within about 15–20%"), and more than 90% of errors are under 30%. MacroFactor warns that *partial* logging, unlike skipped days, still corrupts the estimate. — [MacroFactor V3](https://macrofactor.com/expenditure-v3/)
- Energy densities used: fat about 39.5 MJ/kg (~4,282 kcal/lb), lean tissue about 7.6 MJ/kg (~824 kcal/lb). The "3,500 kcal/lb" rule implicitly assumes 78% fat / 22% lean. V1 and V2 used a smaller energy value for gains than for losses, which created an upward expenditure bias (about 80 kcal in a simulation with ±1 lb noise). V3 makes gains and losses symmetric, which lowers estimates by about 0–130 kcal/day for most users. — [MacroFactor V3](https://macrofactor.com/expenditure-v3/)
- Accuracy claims (company data): V3 is about 10% more accurate than V2, with absolute errors in predicted weight change about 15% smaller weekly and about 5% smaller monthly. Example given: June 2021 intake 2,960 kcal/day, estimated TDEE about 3,380, predicted loss 3.6 lb, actual loss 3.4 lb. — [MacroFactor V3](https://macrofactor.com/expenditure-v3/)
- A third-party review claims the estimate gets within 50–100 kcal of true TDEE after 2–3 weeks. No official source supports that figure, so treat it as unverified. — [amyfoodjournal review](https://amyfoodjournal.com/blog/macrofactor-review)
- **Weight Trend V2 (beta, July 2026)** offers "more robust smoothing that can revise past weigh-ins as new data comes in and reduce lag". Users can choose a trend based on weight data only, goal rate only, or a blend. It is labeled "Experimental". — [MacroFactor Monthly, July 2026](https://macrofactor.com/mm-july-2026/)
- The classic EWMA reference is The Hacker's Diet (John Walker), which uses an exponentially smoothed moving average with smoothing factor 0.1. That is trend_t = trend_{t-1} + 0.1·(weight_t − trend_{t-1}), equivalently a 0.9 constant for the previous value. — [Fourmilab Hacker's Diet](https://fourmilab.ch/hackdiet/www/subsubsection1_2_4_0_4_4.html); [Wikiversity](https://en.wikiversity.org/wiki/One_man%27s_look_at_The_Hacker%27s_Diet)

**Adherence-neutral, no-shame design (MacroFactor philosophy article, Oct 2024)**
- The app does not turn numbers red, shows no warnings or pop-ups when you go over, and does not push a weight-loss goal at onboarding. The weight trend line is presented as the stress-reducing view instead of the raw daily scale reading. One user called it "depressingly revolutionary". — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)
- The rationale is that the most common systematic logging error is under-counting, and negative feedback encourages "logging less". Removing penalties makes logging more accurate, and that in turn improves the TDEE estimate. This is a company opinion, not a study. — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)

**Carbon Diet Coach (Layne Norton / Keith Kraker)**
- Carbon recalculates adaptive macros at a weekly check-in. The check-in asks whether you "tracked everything you ate". On "yes", the coach compares logged intake against targets, judging compliance, and adjusts. The app shows "check-in explanations" and a check-in history. All of this comes from vendor pages, and no independent validation was found. Unlike MacroFactor, the adjustment is framed around compliance. — [Carbon help: weekly check-in](https://help.joincarbon.com/en/articles/6004812-weekly-check-in); [Carbon advanced check-ins](https://help.joincarbon.com/en/articles/10535965-advanced-check-ins); [App Store listing via AppFollow](https://apps.appfollow.io/ios/carbon-macro-coach-tracker/1437820611?country=ca)

**Fitia (Peru-founded, LatAm leader)**
- Fitia operates in about 14–15 Spanish-speaking countries plus Spain and claims 10M+ users. It says it out-downloads MyFitnessPal in key LatAm and Spanish markets (Sensor Tower is cited, but this is a company claim). It began expanding to the US in June 2026. — [Descubre.vc, Jun 2026](https://www.descubre.vc/noticia/fitia-la-startup-peruana-de-nutrici-n-por-ia-se-expande-a-ee-uu-2026-06-09); [Andina](https://andina.pe/agencia/noticia-desarrollan-aplicacion-nutricion-basada-machine-learning-901189.aspx)
- Logging by photo, voice, text or barcode. It auto-generates meal plans and "adjusts the next day's plan" after logging. Its photo model is claimed to be trained on Latin dishes. There is a free tier plus Premium, reported at about USD 79.99/yr but unverified. — [YC profile via yespress](https://yespress.io/fitia-yc-s21); [Fitia blog, Aug 2025](https://fitia.app/learn/article/ai-meal-planners-latin-cuisine-healthy-eating)

### Inferences
- Producti-me already has daily kcal logs, so an adaptive TDEE is cheap to build: expenditure_week ≈ mean_intake − (Δtrend_kg × ρ)/7. A defensible ρ is about 7,700 kcal/kg (3,500 kcal/lb, i.e. 78/22 fat/lean) used symmetrically for gains and losses, as V3 does. Smooth the result with a long, recency-weighted window. Pause updates if more than 3 of the last 7 days are missing, and refuse to treat half-logged days as complete.
- An EWMA trend (α ≈ 0.1, with linear interpolation over missing days) is the minimum viable "trend weight". Displaying it, rather than the raw scale weight, is the main anti-anxiety UX element.
- Weekly targets should behave like MacroFactor's: no compensation for past over- or under-eating, neutral colors, and a "skip this check-in" option for creatine starts, tours or match weeks. That last option matters for a rugby player whose expenditure varies with match load.

### Gaps
- MacroFactor does not publish the exact trend or expenditure formulas or smoothing constants; it calls them its "secret sauce".
- No independent peer-reviewed validation of MacroFactor, Carbon or Fitia's adaptive algorithms was found.
- MacroFactor help-center pages (help.macrofactorapp.com) could not be fetched directly (DNS failure from the fetch tool), so the interpolation detail comes from a search summary.

---

## Q2. Logging-speed tricks and evidence on AI photo/voice logging accuracy

### Takeaway
Logging speed depends on a handful of workflows: search with non-default grams, multi-add of recent foods, barcode, quick-add and copy/paste of meals. MacroFactor leads its own step-count benchmark at 24 total actions. Photo AI is fast but systematically low. An NIH study presented in July 2026 found four popular apps under-counted meals by about 250–345 kcal and about 30 g of fat. The better design treats AI as a decomposer that produces editable, database-grounded ingredients, not as an opaque single estimate.

### Cited Findings
- **The FLSI (Food Logging Speed Index)** counts discrete actions for 4 tasks: (1) search 2 foods with a non-default serving and a 3-digit gram amount, (2) multi-add 2 previously logged foods, (3) barcode scan with a non-default 3-digit quantity, (4) quick-add calories. It covered 21 apps in 2025 and always used the premium tier of each. — [MacroFactor FLSI 2025, Oct 1, 2025](https://macrofactor.com/fastest-food-logger-2025/)
- FLSI 2025 scores (lower is better), all self-reported by MacroFactor:
  - Search: MacroFactor 10, MyNetDiary 11, Lose It 13, MyFitnessPal 15. Cronometer, Carbon, Cal AI and FatSecret landed in the "weak" tier.
  - Multi-add: MacroFactor 6, Lose It 7, Carbon 8, Cal AI 8. Cronometer and MyFitnessPal were "weak".
  - Barcode: MacroFactor 5, MyFitnessPal 7, Cronometer 7, Lose It 7, Carbon 9.
  - Quick-add: MacroFactor 3, Lose It, Carbon and MyFitnessPal 5, Cronometer 7.
  - MacroFactor's total is 24, down from 26 in 2022. The strongest competitor needs about 25% more actions and the average app about 70% more.
  - Source: [MacroFactor FLSI 2025](https://macrofactor.com/fastest-food-logger-2025/)
- MacroFactor offers "speed mode" (return to search after each add) and "context mode" (a plate view where you adjust portions of the whole meal before logging). Its logger groups foods by time eaten rather than fixed breakfast/lunch/dinner buckets. Favorites, "smart history" and copy-and-paste of foods or meals are its stated friction reducers. — [MacroFactor FLSI 2025](https://macrofactor.com/fastest-food-logger-2025/); [MacroFactor new food logger](https://macrofactor.com/new-food-logger/); [MacroFactor vs Cal AI, Apr 6, 2026](https://macrofactor.com/macrofactor-vs-cal-ai/)
- MacroFactor counts 5 to 7 logging workflows (sources differ): AI photo / "Photo & Text" / AI Describe, barcode, label scan, search, quick-add, and custom foods or recipes. — [MacroFactor help](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor); [MacroFactor AI logging, Apr 8, 2025](https://macrofactor.com/ai-food-logging/)
- **MacroFactor's AI approach (beta, Apr 2025):** "several LLM prompts" break a meal into ingredients and recipes and then query the real database. The model generates nutrition values only when necessary. Results "stream into your plate" as editable entries with an in-context editor, and the company says it uses "no performative chat interface". A stated goal is to bridge gaps "in regions where food and/or branded product data is not as readily available". — [MacroFactor AI food logging](https://macrofactor.com/ai-food-logging/)
- July 2026 update: the label scanner reads nutrition labels "across different formats and languages". A custom food can be created from 2 photos, the front of pack plus the nutrition label. — [MacroFactor Monthly, Jul 2026](https://macrofactor.com/mm-july-2026/)
- MacroFactor reports about 1.36M verified foods in search, about 4M barcodes and about 26,500 NCC (Nutrition Coordinating Center) research-grade foods, and tracks 54 nutrients. It says Cal AI tracks 14 nutrients and has used MyFitnessPal's database since December 2025. In MacroFactor's own weighed-food test, its AI estimates were closer than Cal AI's (vendor comparison). — [MacroFactor vs Cal AI](https://macrofactor.com/macrofactor-vs-cal-ai/)
- **NIH/NIDDK study, presented at NUTRITION 2026, July 25, 2026:**
  - Design: 102 meals from a metabolic kitchen, weighed to 0.1 g, were photographed and run through MyFitnessPal, Lose It!, Cal AI and Appediet.
  - Results: all four apps underestimated by about 250–345 kcal per meal on average (about one third of the meal) and by about 30 g of fat. Carbohydrate estimates were the most consistent. MyFitnessPal and Lose It! were more accurate on higher-calorie meals.
  - A follow-up with more than 200 additional meals suggests keto and high-fat meals are underestimated even more.
  - The findings are preliminary and not yet peer-reviewed.
  - Source: [Newswise/ASN press release, Jul 25, 2026](https://www.newswise.com/articles/photo-based-calorie-tracking-apps-may-underestimate-energy-in-meals)
- Vendor accuracy claims, none independently validated:
  - SnapCalorie: about ±80 kcal on a 500-kcal dish with the iPhone Pro depth sensor, about ±130 on a standard iPhone; tested on Nutrition5k (5,000 weighed dishes). — [SnapCalorie App Store](https://apps.apple.com/us/app/-/id1574239307)
  - Cal AI: "about 90% accurate" on visible foods. — [RaftLabs teardown](https://www.raftlabs.com/blog/cal-ai-product-teardown)
- General-purpose LLMs: a Nov 2025 *Nutrients* paper evaluated ChatGPT-5 on 195 dishes (DOI 10.3390/nu17223613); its headline numbers were not retrieved. A secondary blog says LLMs underestimate more as portions get larger (unverified). — [search summary; amyfoodjournal](https://www.amyfoodjournal.com/blog/is-ai-calorie-counting-accurate)
- Common failure points are hidden fats (oil, butter, cheese, cream, sauces) and portion size. — [HealthDay on NIH study](https://www.healthday.com/healthday-tv/nutrition/how-accurate-are-photo-based-calorie-apps-nih-puts-4-to-the-test)

### Inferences
- For Producti-me the cheapest speed gains are probably the ones it lacks or can sharpen:
  - one-tap "repeat yesterday's meal / meal slot";
  - multi-select of recents with remembered last grams;
  - quick-add kcal plus protein only;
  - copy a meal to another day;
  - a time-ordered timeline instead of rigid slots.
- If AI logging is added (the app already uses AI for receipts), it should follow MacroFactor's model: the LLM decomposes a photo or text into items that map onto the existing 308-item Argentine database, with gram estimates the user can edit. Given the NIH result, the app should treat photo estimates as likely low, especially in fat. Practical measures: an "added oil/fat?" prompt, or a default +X g of oil for fried and grilled dishes (milanesa, asado, empanadas), which are exactly the fat-heavy items AI under-counts.
- Voice or text logging in Rioplatense Spanish ("2 empanadas de carne y una coca zero") onto the local database may give the best ratio of accuracy to effort for one user.

### Gaps
- No independent timed comparison of logging speed exists; FLSI is MacroFactor's own benchmark.
- No peer-reviewed accuracy data was found for voice logging, Fitia's Latin-food photo model, or the MacroFactor AI beta.
- The headline numbers of the ChatGPT-5 *Nutrients* (2025) paper were not retrieved.

---

## Q3. Sports-nutrition evidence for a rugby player's cut: protein per meal, rate of loss, refeeds and diet breaks

### Takeaway
Evidence supports 0.4–0.55 g/kg of protein per meal over at least 4 meals. Total intake should sit high in a deficit (ISSN: 2.3–3.1 g/kg for resistance-trained people in hypocaloric conditions). A slower loss of about 0.5–1% of body weight per week, with about 0.7% favored in athletes, preserves lean mass and strength better than faster loss. Diet breaks and refeeds improve hunger and satisfaction but have not clearly improved fat-free mass retention in trained people.

### Cited Findings
- **Protein per meal:** Schoenfeld & Aragon (JISSN, Feb 2018) recommend about 0.4 g/kg per meal across at least 4 meals to reach 1.6 g/kg/day, and up to 0.55 g/kg per meal for 2.2 g/kg/day. They argue the old 20–25 g ceiling came from studies of fast-digesting protein eaten without other macronutrients. — [PubMed 29497353](https://pubmed.ncbi.nlm.nih.gov/29497353/); [PMC5828430](https://pmc.ncbi.nlm.nih.gov/articles/PMC5828430/)
- **No hard per-meal ceiling:** Trommelen et al. (*Cell Reports Medicine*, Dec 19, 2023; n=36, young resistance-exercising adults) found 100 g of milk protein after exercise produced a greater and longer (>12 h) anabolic response than 25 g, with negligible extra amino-acid oxidation. — [PMC10772463](https://pmc.ncbi.nlm.nih.gov/articles/PMC10772463/)
- **ISSN Position Stand on protein (Jäger et al., Jun 20, 2017):** 1.4–2.0 g/kg/day for most exercisers. "2.3–3.1 g/kg/d may be needed to maximize the retention of lean body mass in resistance-trained subjects during hypocaloric periods." Intakes above 3.0 g/kg/day may improve body composition in resistance-trained people. — [PMC5477153](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5477153/)
- **Helms, Aragon & Fitschen (JISSN 2014; pre-2019 but still the standard reference):**
  - Rate of loss: about 0.5–1% of body weight per week "to maximize muscle retention".
  - Protein: 2.3–3.1 g/kg of *lean body mass* per day. Note that ISSN expresses the same range per kg of body weight.
  - Fat 15–30% of kcal, with carbs filling the rest.
  - Meals: 3–6 per day, with 0.4–0.5 g/kg protein before and after training. Timing and frequency have "little effect on fat loss or lean mass retention".
  - Source: [PMC4033492](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4033492/)
- **Rate of loss in elite athletes (Garthe et al., IJSNEM 2011):** athletes losing about 0.7% of body weight per week gained lean body mass and 1RM strength. A faster group losing about 1.4% per week did not (about 6% of body mass lost in both groups). BMR fell similarly in both. At a 12-month follow-up (n=23) there were no significant differences between groups. Samples were small, about 13–16 per group. — [LIDA record](https://lida.sport-iat.de/ta/Record/4017680?lng=en); [LIDA long-term](https://lida.sport-iat.de/ta/Record/4023821)
- **Diet breaks (ICECAP, Peos et al., MSSE 2021):**
  - Design: 61 resistance-trained adults over 12 weeks. The intermittent arm did 3 weeks of restriction followed by a 1-week energy-balance break, three times; the comparison arm restricted continuously.
  - Results: intermittent dieting did not give superior fat loss, fat-free mass or resting energy expenditure retention, but it gave lower hunger and greater satisfaction.
  - A secondary analysis (PLoS ONE 2021, n=26) found a 1-week break improved muscle endurance, with +0.6 kg body weight and +0.7 kg fat-free mass and no change in fat.
  - Sources: [PMC7906362](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7906362/); [PubMed 33587549](https://pubmed.ncbi.nlm.nih.gov/33587549/)
- **Refeeds (Campbell et al. 2020):** 27 resistance-trained men and women, 7 weeks, 2-day weekend refeeds versus continuous dieting at the same 25% weekly deficit. A reanalysis by Peos et al. found only *dry* fat-free mass differed between groups, contrary to the paper's stated conclusion. — [Peos comment, PMC7739336](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7739336/)
- **MATADOR (Byrne et al. 2018; obese men, not athletes):** 2 weeks of restriction alternated with 2 weeks at maintenance gave better fat-loss efficiency and less regain than continuous dieting, but took about 30 weeks to complete 16 weeks of deficit. — [secondary coverage, BarBend](https://barbend.com/news/how-diet-breaks-impact-metabolism/)

### Inferences
- For a 102 kg athlete:
  - 0.4 g/kg per meal ≈ 41 g, and 0.55 g/kg ≈ 56 g. The 200 g target (about 1.96 g/kg of body weight) fits 4 meals of about 50 g or 5 meals of about 40 g.
  - A per-meal protein indicator, for example "≥40 g ✓" on each meal, plus a count of protein-adequate meals per day, would put the evidence straight into the UI.
- Target rate of loss for 102 kg is about 0.5–1.0 kg/week, with about 0.7 kg/week (0.7%) as the athlete-friendly default. At about 7,700 kcal/kg, 0.7 kg/week needs a deficit of about 770 kcal/day. The adaptive TDEE (Q1) is what turns a target rate into a daily kcal number. Once the trend's weekly rate is visible, the app could flag rates above 1%/week as a risk to lean mass.
- A "diet break" or "maintenance week" mode (target = estimated TDEE, protein kept) is supported mainly for adherence and hunger, not for muscle retention. It would also suit rugby's in-season match weeks.

### Gaps
- No rugby-specific body-composition or cutting trials were retrieved.
- The Morton et al. 2018 meta-analysis (protein plateau about 1.6 g/kg) was not retrieved.
- Full ICECAP effect sizes were not retrieved (DOI 10.1249/MSS.0000000000002636).

---

## Q4. Argentine food composition data and barcode options (ARGENFOODS, Open Food Facts)

### Takeaway
ARGENFOODS (Universidad Nacional de Luján, part of the FAO/INFOODS network) is the reference Argentine composition table, last updated on its site on Sep 12, 2024. Open Food Facts lists about 16,400 products sold in Argentina, but much of the data is incomplete. Anonymous requests were throttled during this research, so barcode support would need caching, a fallback to the photo label scanner, and a way to save products the user enters as custom foods.

### Cited Findings
- ARGENFOODS is a food composition table developed at the Universidad Nacional de Luján within the INFOODS project of the UN University and FAO. The public site states a last update of Sep 12, 2024. — [argenfood.unlu.edu.ar](https://www.argenfood.unlu.edu.ar/)
- The first and only national table built from country-specific data was published in 1942–1946 (per an Argentine public-health review). An FAO regional project (TCP/RLA/3107) worked on composition databases for Argentina, Chile and Paraguay. — [RASP/MSAL review](https://rasp.msal.gov.ar/index.php/rasp/article/download/190/143/296); [FAO workshop, Tucumán 2008](https://alimentosargentinos.magyp.gob.ar/contenido/marco/Fao/especiales/Informe_Taller_Tucuman_25_29_feb_2008_MT080308.pdf)
- **Open Food Facts (OFF) Argentina:**
  - Size: the Argentine country portal showed "16,447 products" when accessed on Oct 14, 2026. — [ar-en.openfoodfacts.org](https://ar-en.openfoodfacts.org/)
  - Data quality: the Argentina "misc" facet lists 12,534 products with incomplete packaging data and 11,258 without a computed Nutri-Score. — [OFF Argentina misc](https://ar-en.openfoodfacts.org/misc)
  - 2,029 products have Argentina as the ingredient origin. — [OFF Argentina origins](https://ar-en.openfoodfacts.org/origins)
  - Local EAN-13 barcodes start with 779, for example 7798158705429 (La Anónima empanada wrappers). — [OFF product](https://world.openfoodfacts.org/product/7798158705429/tapas-de-empanadas-criollas-la-anonima)
- **Access limits:** anonymous API and search requests (world.openfoodfacts.org/api/v2/search, /country/argentina.json) returned "Page temporarily unavailable… or the page you requested is not available to anonymous users". The page says registered users are not rate-limited and that "all our data can be freely downloaded". Observed directly on Oct 14, 2026. — [OFF](https://ar-en.openfoodfacts.org/misc)
- Commercial databases:
  - MyFitnessPal: 14–20M+ entries (figures conflict), a mix of professional and user-submitted entries with many errors.
  - Cronometer: smaller and verified (lab, USDA, NCCDB).
  - Lose It: large but mixed.
  - Cal AI: uses MyFitnessPal's database (since Dec 2025, per MacroFactor).
  - Sources (comparison blogs, several of them from competitors): [nutrola comparison](https://nutrola.app/en/blog/myfitnesspal-vs-cronometer-vs-lose-it-2026); [MacroFactor vs Cal AI](https://macrofactor.com/macrofactor-vs-cal-ai/)

### Inferences
- About 16k Argentine products with patchy nutrition data means OFF barcode lookups will often miss or come back incomplete for a given product. A robust flow:
  1. scan the EAN;
  2. look it up in a local cache, then OFF (with a registered user agent, or from a periodic bulk export filtered to Argentina);
  3. on a miss or incomplete data, photograph the nutrition label and let AI fill in a custom food (the MacroFactor July 2026 pattern);
  4. optionally contribute the product back to OFF.
- Producti-me's curated 308-item database probably beats OFF for fresh and generic foods (meats, empanadas, facturas). ARGENFOODS could serve to validate or extend raw-ingredient values.

### Gaps
- ARGENFOODS coverage (number of foods and nutrients) and licensing were not verified.
- No figure was found for the share of Argentine supermarket SKUs covered by OFF.
- No information was found on Fitia's or MyFitnessPal's Argentine-specific coverage.

---

## Q5. How the reference budgeting apps work: YNAB, Copilot Money, Monarch, Wallet/Spendee/Fintonic

### Takeaway
YNAB's value is a method: zero-based "give every dollar a job", spreading irregular "true expenses" across months, and "age of money" as a buffer metric. Copilot's distinctive features are automatic recurring-charge detection that reserves the money at the start of the month, and a per-user categorization model that learns from corrections. Monarch's strength is goals with target dates and amounts (reworked Goals out of beta in June 2026). European and LatAm aggregators such as Fintonic, Wallet and Spendee depend on bank sync that does not exist natively for Argentina.

### Cited Findings
- **YNAB's four rules:**
  - Give Every Dollar a Job (zero-based: $0 left unassigned, and savings count as assigned).
  - Embrace Your True Expenses (divide irregular costs by 12 and set that aside monthly).
  - Roll With the Punches (move money between categories to cover overspending).
  - Age Your Money (aim to spend money at least 30 days old, i.e. "living on last month's income"; age rises as you save and falls when you spend saved money).
  - Sources: [YNAB blog](https://www.ynab.com/blog/the-new-rules); [Experian review](https://experian.com/blogs/ask-experian/you-need-a-budget-app-review/)
- YNAB pricing is reported as USD 14.99/month or USD 109/year, with a 34-day trial and no free tier. Sources conflict and some say USD 99. Blogs report waves of 1-star reviews after each price increase (84 → 99 → 109), plus bank-sync drops and duplicate transactions. — [pocketclear](https://pocketclear.app/blog/ynab-complaints-problems.html); [unstar](https://unstar.app/blog/ynab-vs-rocket-money-vs-monarch-budgeting-apps-ranked-2026)
- **Copilot Money:**
  - Recurring: "Recurring Transactions" works out which charges recur and when, then "builds them into your spending at the beginning of the month". — [Money with Katie review](https://moneywithkatie.com/copilot-review-a-budgeting-app-that-finally-gets-it-right/)
  - Recurring limits: recurring items cannot be marked as excluded, and recurring income cannot be linked to income. — [Copilot help](https://help.copilot.money/en/articles/10761907-transactions-faq)
  - Categorization: "Copilot Intelligence" is a personalized, private model trained only on your own transactions. If its guess is wrong, it promotes the second-best guess. Income and internal transfers cannot be categorized. — [Copilot Intelligence](https://intelligence.copilot.money); [Copilot help](https://help.copilot.money/en/articles/10761907-transactions-faq)
  - Accuracy: about 93% first-pass accuracy is claimed by a third-party page (unverified). — [tooldirectory](https://tooldirectory.ai/tools/copilot-money)
  - Price and platform: about USD 13/month or USD 95/year; mobile is Apple-only, and sources conflict on whether a web app exists. — [Penny Hoarder 2026](https://www.thepennyhoarder.com/budgeting/budgeting-copilot-money-review/)
- **Monarch Money:** the reworked Goals feature left beta on Jun 18, 2026. Goals can be shared (emergency fund, house, trip) with target dates and amounts, and also cover debt payoff. Price about USD 99.99/yr. Monarch is positioned as Mint's successor after Intuit shut Mint down in early 2024; a blog cites about 3.6M displaced users, unverified. — [Monarch blog](https://www.monarch.com/blog/goals); [NerdWallet](https://www.nerdwallet.com/finance/learn/monarch-money-app-review); [unstar](https://unstar.app/blog/ynab-vs-rocket-money-vs-monarch-budgeting-apps-ranked-2026)
- **Wallet by BudgetBakers:** manual entry or bank sync, multi-currency, budgets; Android is the most complete version. — [androidayuda](https://androidayuda.com/en/applications/lists/fintonic-alternatives-finance/); [Finder UK](https://www.finder.com/uk/wp-json/wp/v2/posts/159879)
  - An Argentine competitor (Piggy, a vendor source) says Wallet uses "fixed manual conversion" and is "not native for Argentina". — [Piggy guide, Sep 2026](https://piggy.com.ar/guias/mejor-app-finanzas-personales-argentina/)
- **Spendee:** multiple wallets and budgets, shared wallets for couples or families; bank linking is premium. — [androidayuda](https://androidayuda.com/en/applications/lists/best-apps-control-expenses-budgets/)
- **Fintonic:** aggregates connected bank accounts, auto-categorizes, notifies on every movement, gives savings tips based on spending trends, and flags duplicate receipts. — [androidayuda](https://androidayuda.com/en/applications/lists/fintonic-alternatives-finance/)

### Inferences
- The concepts that carry over to an Argentine single-user PWA without bank sync:
  - "True expenses": monthly set-asides for annual costs such as patente, ABL, seguro and the rugby club fee.
  - Copilot-style recurring detection over the Gmail-parsed and receipt data the app already has, reserving recurring amounts at the start of the month.
  - A per-user "learn from my corrections" category model: store merchant → category overrides and promote the runner-up on correction.
- "Age of money" maps poorly onto ARS. Holding pesos for 30 days loses about 2% to inflation (Q6), so a buffer measured in days of expenses covered by USD and money-market holdings is a better local equivalent (inference).

### Gaps
- r/ynab, r/MacroFactor and r/merval threads were not read directly (no fetch of Reddit). Complaints come from blogs.
- Monarch's new Goals mechanics (for example, whether goals are funded from specific accounts) were not detailed.
- Fintonic's availability and bank connectivity in Argentina were not confirmed.

---

## Q6. The Argentine context, 2024–2026: inflation, exchange rates, how people save, Mercado Pago tools, cuotas, card dollar, real-terms reporting and local apps

### Takeaway
As of Oct 2026, monthly inflation is about 1.7–1.9% (33.4% year on year; 23.6% for Jan–Sep 2026). The official, MEP and blue dollar rates are within about 1–3% of each other, after FX controls on individuals were lifted in April 2025. Peso yields are close to or below inflation: about 19% TNA (nominal annual rate) in Mercado Pago, 16–23% on plazo fijo. Savers use money-market FCI (mutual funds), USD and, increasingly, CEDEARs. Card installments ("cuotas sin interés") usually carry a hidden 10–30% markup. Local apps compete on two currencies, card-installment projection, Mercado Pago links and WhatsApp/voice/receipt capture.

### Cited Findings
**Inflation (INDEC)**
- September 2026 CPI:
  - Headline: +1.9% month on month, 33.4% year on year, 23.6% accumulated Jan–Sep 2026. August was 1.7%, the lowest in 14 months.
  - Components: core 1.7%, seasonal 2.9%, regulated 2.3%. Housing and utilities led at +3.1%, then education at +3.0%.
  - Regions: GBA and the Pampean region +2.0%, Patagonia +1.4%. In 2026, monthly inflation was below 2% only in June and August.
  - Outlook: the market expects about 1.8% per month going forward (Cohen).
  - Sources: [Infobae, Oct 13, 2026](https://www.infobae.com/economia/2026/10/13/la-inflacion-en-septiembre-fue-de-19-y-acumulo-334-en-los-ultimos-doce-meses/); [INDEC IPC Sep 2026 PDF](https://www.indec.gob.ar/uploads/informesdeprensa/ipc_10_268C45A9444C.pdf)
- 2025 closed at 31.5% (December +2.8%), the lowest annual rate since 2017. 2024 was 117.8%. INDEC moved the CPI basket to the 2017/18 household spending survey (ENGHo). — [Forbes Argentina, Jan 2026](https://www.forbesargentina.com/money/la-inflacion-2025-cerro-315-marco-nivel-mas-ocho-anos-n84710)

**Exchange rates**
- Oct 13, 2026 (sources compare against different references):
  - Blue: ARS 1,530 buy / 1,550 sell.
  - Banco Nación official: 1,535 sell. Wholesale: 1,512.5.
  - MEP: about 1,537.7, a 1.7% gap to official.
  - CCL: about 1,609.5, a 6.4% gap.
  - Blue gap vs wholesale: about 2.5%.
  - Sources: [Ámbito](https://www.ambito.com/finanzas/el-dolar-blue-reboto-el-fin-semana-largo-y-se-despego-la-cotizacion-oficial-n6333310); [El Cronista](https://www.cronista.com/finanzas-mercados/dolar-blue-hoy-a-cuanto-cotiza-el-sabado-10-de-octubre-con-el-mep-y-el-ccl/)
- FX restrictions on individuals were lifted in mid-April 2025, ending the tax perceptions on buying USD for savings.
- The "dólar tarjeta" remains: official rate plus a 30% perception on account of income or wealth tax (Ganancias / Bienes Personales; ARCA RG 5617/2024). It applies to foreign purchases (streaming, travel, foreign e-commerce) settled in pesos, and is avoided by paying the card balance in USD.
- ARCA collected ARS 919,866M in Ganancias perceptions in Jan–Jul 2026. The amount is creditable or refundable from January 1 of the following year, but "recovery tends to be delayed" and loses real value to inflation.
- Sources: [El Cronista](https://www.cronista.com/economia-politica/por-que-no-se-elimino-el-dolar-tarjeta-cuanto-recaudo-arca-en-lo-que-va-de-2026/); [El Destape, Oct 2026](https://www.eldestapeweb.com/economia/pagar-dolares-tarjeta-octubre-2026-ahorrar-evitar-recargos-202610611469)
- Conflict: one Jan 2026 report said ARCA stopped the 30% on direct USD card spending from Jan 2, 2026. Later reporting (Oct 2026) still describes the 30% as applying when paid in pesos. — [Elonce](https://www.elonce.com/economia/pese-al-fin-del-dolar-tarjeta-el-recargo-del-30-sigue-vigente-para-servicios-turisticos-en-pesos.htm)

**Where Argentines put savings**
- Mercado Pago, Oct 2026:
  - Remunerated account and "Reservas" pay about 19% TNA through an FCI that changes daily (19.1% in a TN ranking, 19.71% the week before Oct 5).
  - About ARS 15,735 per month on ARS 1M.
  - About 23% on bonds and plazo-fijo-type investments inside the app; USD balances earn 1.8%/yr.
  - Bank plazos fijos at 30 days pay 16–23% TNA.
  - Sources: [Calcular Sueldo / iProfesional](https://calcularsueldo.com.ar/inversiones/16199/mercado-pago-cuanto-rinde-con-las-nuevas-tasas-en-octubre-2026.html); [Diario Huarpe](https://www.diariohuarpe.com/nota/las-5-billeteras-virtuales-que-mas-rinden-en-octubre-2026-cuanto-pagan-por-1-000-000-2026101311530)
- FCI industry: about 56.8% of assets are in money-market funds, 36% in fixed income and about 2% in equities. BCRA data show 92.1% of peso plazos fijos at 30–44 days. Both figures appeared in search summaries of Argentine press with unclear attribution, so verify before relying on them. USD FCI are consolidating as a conservative vehicle in 2026. — [El Cronista](https://www.cronista.com/finanzas-mercados/ni-dolar-ni-plazo-fijo-donde-ponen-sus-pesos-los-argentinos-y-cuanto-rinde-cada-opcion/); [iProUP, May 2026](https://www.iproup.com/finanzas/68293-argentinos-invierten-eligieron-fondos-cedears-ganan-hasta-42-por-ciento-dolares-mayo-2026)
- Capital markets (BYMA / Caja de Valores report, data to May 31, 2026):
  - 24.6M brokerage ("comitente") accounts held by about 12.3M people, i.e. one in two economically active Argentines.
  - New accounts: 7.2M in 2024 (a record), 6.7M in 2025, 3.1M in Jan–May 2026.
  - CEDEARs: more than 878k accounts traded them in the last year and more than 1M hold positions. Tech accounts for 40.45% of trades, financials 19.76%.
  - Source: [iProfesional, Jul 2026](https://www.iprofesional.com/finanzas/460259-la-mitad-de-los-argentinos-que-trabajan-ya-tiene-una-cuenta-para-invertir); [Perfil](https://www.perfil.com/noticias/cordoba/el-mercado-de-capitales-argentino-en-numeros-record-uno-de-cada-dos-activos-ya-invierte.phtml)

**Mercado Pago's own tools ("Reservas")**
- Named pots with icon, target amount and an estimated time to reach the goal. Money stays instantly withdrawable and earns the daily yield.
- Modes: "Reservas programadas" (scheduled automatic transfers) and "Reservas al gastar" (sets aside a fixed amount each time you pay by QR or receive a transfer).
- Usage: more than 15M Reserva categories had been created by June 2025, and 60% of Reserva users use them to organize spending. Top uses are travel (Córdoba, Mar del Plata, Brasil), tech purchases, and paying the card, rent or utilities on their due date.
- Sources: [iProfesional, Jun 2025](https://www.iprofesional.com/finanzas/430882-mercado-pago-sabe-que-haces-con-tu-plata-su-revelador-informe); [Ámbito](https://www.ambito.com/informacion-general/reservas-asi-es-el-truco-secreto-ahorrar-dinero-mercado-pago-n5887502)
- Another report says more than 4.8M Reservas were created in 2025. The difference from the 15M figure is unexplained (different metric or date). — [algoritmodigital](https://algoritmodigital.com.ar/?p=1678)

**Cuotas sin interés and credit stress**
- "Interest-free" installments usually embed the financing cost in the price, typically 10–30% above the cash price depending on term and issuer.
- Rule of thumb: if the total financial cost (CFT) is below inflation, fixed installments get eroded and cuotas win. Example: at 2% monthly inflation and 12 cuotas, cash wins once the markup is above about 30%. These are illustrative calculator outputs.
- BCRA requires the CFT to be shown in financing ads, but "sin interés" promotions often get around this.
- Sources: [HacéCuentas calculator](https://hacecuentas.com/calculadora-cuotas-sin-interes-vs-contado-inflacion-argentina); [La Gaceta](https://www.lagaceta.com.ar/nota/1140957/economia/uso-inteligente-tarjeta-credito-cuando-conviene-pagar-cuotas-cuando-no.html)
- Household credit stress in 2026:
  - Card delinquency was about 12.8% in July 2026 (Fundación Pensar), with personal loans at 16.7%, up from about 9.3% in early 2026.
  - Card volumes in August were +20.1% nominal but −10.1% in real terms year on year.
  - Nearly 6 in 10 Argentines took on debt for essential spending.
  - Sources: [La Nación, Oct 7, 2026](https://www.lanacion.com.ar/economia/casi-seis-de-cada-10-argentinos-tomaron-deudas-en-los-ultimos-meses-para-consumos-esenciales-segun-nid07102026/); [La Posta Diario](https://lapostadiario.com/caen-fuerte-los-consumos-con-tarjeta-morosidad-record-y-bancos-que-solo-mejoran-el-limite-a-sus-mejores-clientes/); [Infobae, Sep 11, 2026](https://www.infobae.com/economia/2026/09/11/de-comprar-en-cuotas-a-pagar-el-supermercado-como-los-argentinos-llegaron-a-estos-niveles-de-endeudamiento/)

**What Argentine apps do (all from vendor or roundup sources)**
- An Argentine personal-finance app needs, per a Sep 2026 local guide written by a vendor:
  1. Native support for two currencies (most people earn and spend ARS but save or budget in USD), with automatic blue and MEP rates rather than only the official rate.
  2. Card installment plans entered once and projected onto future statements by card closing date, instead of booking ARS 300k today or re-entering ARS 50k monthly.
  3. Accounts for banks plus wallets, with internal transfers that do not count as income or expense.
  4. Budgets and goals adjusted for inflation, compared month on month.
  5. Fast capture by WhatsApp, voice, receipt photo or statement import. The guide names manual typing as "the number one cause" of abandonment, a vendor claim.
  6. Shared expenses.
  - Source: [Piggy guide, Sep 2026](https://piggy.com.ar/guias/mejor-app-finanzas-personales-argentina/)
- The local apps:
  - Piggy: blue/MEP/official rates, cuotas with closing dates, Mercado Pago and Ripio connections, WhatsApp AI bot. — [Piggy](https://piggy.com.ar/guias/mejor-app-finanzas-personales-argentina/)
  - Gasti: WhatsApp plus rules. — [Piggy](https://piggy.com.ar/guias/mejor-app-finanzas-personales-argentina/)
  - Finy: voice, ticket photo, PDF import. — [Finy](https://www.finyapp.io/guias/mejor-app-de-gastos-argentina)
  - Ábaco: free, ARS/USD.
  - Focus·Folio: built for the blue dollar, inflation and local cards. — [Focus·Folio](https://focusfolio.com.ar/mejores-apps-finanzas-personales-argentina)
  - CumbreBot: WhatsApp bot, ARS 4,990/month Plus tier.
  - Compara Ar (iOS): live dollar quotes plus a comparison of wallet, account and plazo fijo yields. — [App Store](https://apps.apple.com/ba/app/compara-ar/id6745492512)
  - Salame (Jul 2026): splitting informal debts. — [Fortuna](https://fortunaweb.com.ar/blog/lanzaron-la-app-salame-la-solucion-original-para-un-problema-cada-vez)
  - Ualá: a spending-analysis tool tied to its card. — [Baker Tilly](https://techma.bakertilly.es/en/uala-finanzas-personales-en-argentina)

**Data sources for real-terms reporting**
- The official datos.gob.ar Time Series API needs no key. Example: `apis.datos.gob.ar/series/api/series/?ids=101.1_I2NG_2016_M_22:percent_change_a_year_ago&format=csv`. That series ID is IPC-GBA, base Dec 2016, per a third-party client. — [Series API docs](https://series-tiempo-ar-api-english.readthedocs.io/); [GitHub datosgobar](https://github.com/datosgobar/series-tiempo-ar-api)
- DolarAPI (dolarapi.com) is used by third-party sites for 7 quotes (official, blue, MEP, CCL, tarjeta, crypto, wholesale). Its terms and limits were not verified. — [servidos.ar](https://servidos.ar/cotizacion-dolar)

### Inferences
- **Real-terms view.** Deflate ARS spending by monthly CPI, for example "groceries +12% nominal, −8% real vs. Oct 2025". Also show each month's spending in USD-MEP. Both are cheap given the free API, and they match how Argentines think about money.
- **Peso yields roughly break even.** About 19% TNA ≈ 1.58% per month, against 1.9% CPI in September. ARS savings in Mercado Pago lost about 0.3% in real terms that month. The app could show "real yield" per account and nudge idle ARS above the monthly buffer toward the USD goal (inference; not financial advice).
- **The rate choice matters less now.** With official, MEP and blue within about 1–3% today, the choice of rate for the 5,000 USD goal is less critical than in 2023–2024. A configurable "reference dollar" (MEP default) is still prudent because the gap can reopen (inference).
- **Cuotas.** Producti-me should model them as a plan (amount, n, first statement date, card) generating future liabilities on the Visa credit account, with a "committed future statements" projection. A cuotas-vs-cash calculator (markup vs. expected inflation) at purchase time fits naturally.
- **Card USD purchases.** Flag USD purchases on the Visa credit card, mostly subscriptions, as subject to the 30% perception. Suggest paying in USD (from the USD portfolio) and track perceptions as a recoverable tax credit.
- **Mirror Reservas.** Mercado Pago "Reservas" are a ready-made mental model (named pots, automatic set-asides "al gastar"). Producti-me could mirror them as sub-goals of the 5,000 USD goal.

### Gaps
- **"Cuanto (Argentina)" could not be found.** Several searches returned no app by that name, so it may be named differently or be very small.
- No official BCRA or CNV primary documents were fetched; the FCI shares and plazo fijo tenors come from secondary sources.
- No figure was found for the share of card spending done in cuotas in 2026.
- Whether Mercado Pago offers a native spending-analytics or budgeting feature beyond Reservas was not confirmed.
- DolarAPI terms and limits were not verified.

---

## Q7. Spending insights and features that change behavior, including subscription detection: the evidence

### Takeaway
The best causal evidence favors easy access to information (fewer fees) and explicit goals (more saving) over generic insights. Subscription under-estimation is large, which justifies recurring detection. Cashless payment modestly raises spending, which justifies quick, salient feedback after each card or QR payment.

### Cited Findings
- **Information access:** Carlin, Olafsson & Pagel, "Mobile Apps and Financial Decision Making" (*Review of Finance*, May 2023). After the Meniga aggregator launched its mobile app in Iceland (Nov 2014), NSF (insufficient-funds) fees fell 38.4% within 24 months. The authors attribute this to "mistake avoidance due to easier access to information", not to education or nudges. Gains were largest for women, high earners and boomers. — [Review of Finance](https://revfin.org/?p=3045); [Rice Business](https://business.rice.edu/wisdom/can-mobile-banking-app-really-save-you-money)
- **Goals:** Gargano & Rossi, "Goal Setting and Saving in the FinTech Era" (*Journal of Finance* 79(3), 2024). In a fintech savings app, users given the goal-setting feature raised their savings rate, measured by difference-in-differences against users without it. The extra saving did not come from saving less outside the app. It helped the least-saving users most. The mechanism is increased attention and monitoring. — [SSRN/academic newsletter](https://academicnewsletter.sufe.edu.cn/info/358929); [working paper PDF](https://www.bwl.uni-mannheim.de/media/Lehrstuehle/bwl/Area_Finance/Finance_Area_Seminar/FSS_2022/Rossi_Paper.pdf)
- **Cashless effect:** Schomburgk, Belli & Hoffmann, "Less cash, more splash?" (*Journal of Retailing*, 2024 meta-analysis; 392 effect sizes, 71 papers). It finds a small but significant tendency to spend more with credit, debit or BNPL than with cash. The effect is stronger in conspicuous consumption and periods of economic growth, and has weakened over time. — [Univ. Melbourne summary](https://findanexpert.unimelb.edu.au/news/82606-trying-to-save-money%3F-our-research-suggests-paying-in-cash-%E2%80%93-while-you-still-can); [Minerva Access](https://minerva-access.unimelb.edu.au/server/api/core/bitstreams/298e4591-1ddc-49ee-b95e-d9e1dd8c4dd2/content)
- **Subscriptions:** a C+R Research survey (2022, n=1,000 US adults) found a quick guess of USD 86/month against an itemized USD 219/month, an underestimate of USD 133. 54% underestimated by USD 100 or more, and 42% had forgotten a subscription they no longer used. — [NBC](https://www.nbcwashington.com/news/business/money-report/consumers-spend-an-average-133-more-each-month-on-subscriptions-than-they-realize-study-shows/3067565/); [FOX 9](https://www.fox9.com/news/many-underestimate-monthly-subscription-costs-133-survey-2022)

### Inferences
- **Highest-evidence features for Producti-me:**
  1. A glanceable "available to spend today/this month" figure across all 5 accounts (information access).
  2. An explicit 5,000 USD goal with dated milestones and progress visible daily (the goal-setting effect).
  3. Recurring and subscription detection from Gmail-parsed charges, including USD charges with the 30% perception.
  4. Immediate post-payment feedback for card and QR payments to restore some "pain of paying".
- Generic monthly "insights" have weaker evidence than these.

### Gaps
- No causal study was found that specifically tests inflation-adjusted (real-terms) reporting on behavior.
- No Argentine-specific study of budgeting-app effects was found.
- The Medina "Side effects of nudging" reminder study was not retrieved (search budget exhausted).

---

## Q8. What users love and hate, and why people abandon calorie and budget tracking

### Takeaway
Diet tracking decays fast. Under half of trial participants are still tracking by about week 10, and median disengagement falls between about 4 weeks (weight) and 10 weeks (diet). Abandonment is driven by effort, guilt or shame, and lack of actionable output. Budget apps show the same pattern: upkeep, categorization chores, sync failures and price hikes. Users praise apps that cut logging effort, tolerate missed days, and turn data into a clear next action.

### Cited Findings
**Nutrition tracking adherence (peer-reviewed)**
- Patel et al. 2019 (JMIR mHealth, 12-week RCT, n=105, MyFitnessPal): median diet-tracking days per week were 2.9 (app only), 5.3 (simultaneous diet plus weight tracking) and 1.9 (sequential). The authors call dietary self-monitoring a behavior that "declines quickly". — [PMC6416539](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6416539/)
- Secondary analysis of two 6-month trials (as summarized by search): fewer than half the sample was still tracking after week 10. The number of days with 2 or more logged eating occasions explained the most variance in 6-month weight loss (R²=0.27). — [PMC6856872](https://pmc.ncbi.nlm.nih.gov/articles/PMC6856872)
- 6-month pilot (JMIR Formative Research 2022, n=54): consistent self-monitoring lasted 17.4 weeks for physical activity, 11.1 for weight and 10.8 for diet. Median time to disengagement was 19.5, 4 and 10 weeks respectively. Commercial-app users typically disengage after about a month, once novelty fades. — [JMIR Formative 2022](https://formative.jmir.org/2022/2/e33603/PDF)
- Daily self-weighing (older evidence, pre-2019, WEIGH trial):
  - 6.1 versus 1.1 weighing days per week, with weight loss of about 6.6% versus 0.4% at 6 months.
  - Daily weighing was not associated with more disordered eating in an 18-month program.
  - Sources: [PMC4380831](https://pmc.ncbi.nlm.nih.gov/articles/PMC4380831/); [PMC4046275](https://pmc.ncbi.nlm.nih.gov/articles/PMC4046275). These came from a search summary, and which PMC record holds which finding was not verified.

**Accuracy and why people under-log**
- Photo AI under-counts by about one third (NIH 2026, Q2). — [Newswise](https://www.newswise.com/articles/photo-based-calorie-tracking-apps-may-underestimate-energy-in-meals)
- MacroFactor argues that shame UI makes people log less and less accurately (company opinion, Q1). — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)

**What users like and dislike about nutrition apps (mostly secondary sources)**
- MyFitnessPal: the barcode scanner is premium-only (one source dates this to 2024; unverified), Premium costs about USD 79.99/yr, and user-submitted entries are often wrong.
- Lose It: free barcode scanning and Premium at about USD 39.99/yr.
- Cronometer: praised for verified data and micronutrients. One blog says barcode is behind the Gold tier at about USD 54.99/yr (unverified).
- Sources: [nutrola comparison](https://nutrola.app/en/blog/myfitnesspal-vs-cronometer-vs-lose-it-2026); [setforset](https://www.setforset.com/blogs/news/myfitnesspal-alternatives-8-calorie-trackers-worth-switching-to)
- Cal AI is praised for simplicity and has gamification and groups. It lacks copy/paste, timelines and quick actions. In MacroFactor's test its voice logging and PDF export failed (vendor-competitor source). — [MacroFactor vs Cal AI](https://macrofactor.com/macrofactor-vs-cal-ai/)
- MacroFactor users report an algorithm that "felt" counterintuitive: calories went up after they over-ate. MacroFactor explains this as intended behavior. — [MacroFactor](https://macrofactor.com/macrofactors-algorithms-and-core-philosophy/)

**Budget tracking abandonment (weak evidence base)**
- FinGoal's qualitative research: users fell back on time-consuming spreadsheets; apps "rarely provided actionable advice"; financially comfortable users found budgeting "such a chore… they stopped budgeting altogether". — [FinGoal](https://fingoal.com/blog/five-insights-into-personal-finance-attitudes)
- Maker and user anecdotes on Product Hunt: "Categories to maintain, transactions to reconcile, guilt when I fell behind", and the app "turned into a second job". — [Product Hunt](https://www.producthunt.com/p/spendalyst/budgeting-categories-are-the-reason-people-quit-money-apps)
- YNAB: price-hike backlash and bank-sync failures (blogs, see Q5). Mint's 2024 shutdown displaced users, and migrated history reportedly did not transfer cleanly (unverified). — [pocketclear](https://pocketclear.app/blog/ynab-price-increases-history.html); [unstar](https://unstar.app/blog/ynab-vs-rocket-money-vs-monarch-budgeting-apps-ranked-2026)
- About 30% of Americans don't budget because they think they don't need to (Credit.com survey of about 1,000, non-representative). — [Credit.com](https://www.credit.com/blog/budgeting-survey/?amp)

### Inferences
- **Make the main adherence metric forgiving.** Use "days with ≥2 meals logged", which is evidence-linked to outcomes, rather than "perfect days". Combine it with V3-style tolerance of skipped days, so missing a day never breaks the TDEE engine or a streak in a punishing way.
- **Weight and food together.** The simultaneous diet-plus-weight arm tracked far more (5.3 versus 2.9 days per week). A combined morning prompt ("weight + yesterday complete?") is likely better than separate flows.
- **Finance: automation over manual effort.** Producti-me's AI receipts and Gmail parsing already remove the main reported abandonment driver (manual entry). The remaining risk is the category-maintenance chore. Learned merchant rules and a weekly 2-minute "review uncategorized" queue address it better than more categories.
- **Single-user advantage.** As a single-user PWA, Producti-me avoids two major sources of dislike: subscription-price backlash and bank-sync breakage.

### Gaps
- No primary Reddit threads (r/MacroFactor, r/ynab, r/merval, r/argentina) were read. User sentiment comes from blogs and vendor pages.
- No rigorous churn statistics were found for budgeting apps.
- No 2019–2026 trial specifically on daily-weighing frequency was found.
- The web-search budget for this session ran out before checking Medina (credit-card reminders), Lose It's current feature set, and Fitia's adaptive algorithm.
