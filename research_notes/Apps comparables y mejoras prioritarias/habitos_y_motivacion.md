# Habit apps and the behavioural science of engagement: what Producti-me lacks and what works or backfires

Research date: 2026-10-14. Scope: 12 reference apps (signature features, praise and complaints, pricing), evidence on habit formation, gamification, streaks and penalties, correlation engines, and why people abandon tracking. Each finding gives its source year.

Method notes for the writer:
- **Primary sources read in full or as full abstracts:** PubMed abstracts, the PMC full text of the Milkman 2021 megastudy, the Sharif & Shu PDF, the Duolingo blog posts, the Exist and Bearable help centres, Loop's source code and App Store listings.
- **Search snippets only:** Some items were seen only as snippets. Each is marked "(snippet)".
- **Reddit:** Reddit returned HTTP 403, so there are no first-hand Reddit quotes.
- **App Store review samples:** I pulled them from Apple's public customer-review RSS feed, sorted by most recent or most helpful, giving 50–100 reviews per app. I tagged themes with keyword matching. This is a rough sample, not a representative survey.
- **Search budget:** The web-search budget ran out partway through. The remaining unverified items are listed under Gaps.

---

## 1. Feature-by-feature: what leading habit and self-tracking apps do, what users praise and complain about, and how they charge

### Takeaway
The apps users love most do one of two things. Some make logging nearly free: Way of Life ("a few seconds"), Daylio ("two taps"), Streaks with Health auto-completion and Habitify with auto-tracking. Others make missing a day emotionally safe: Finch's pet, Habitify's "Pause & Reflect", Loop's decaying score with neutral skips, and rest or vacation modes. Producti-me already has a richer game layer than most (XP, leagues, medals, AI coach). What it lacks is the forgiving, low-friction layer:
- neutral skip, rest or vacation days
- a habit-strength score instead of all-or-nothing streaks
- "N times per week" targets
- mood and energy logging with correlations
- if-then cue fields
- a "why did I miss" note without punishment

The most common complaints across the category are paywalls and billing (Fabulous, Atoms, Productive), sync and bugs (Habitify) and over-complex check-ins (Bearable). A free personal PWA avoids the first. Producti-me must avoid the last.

### Cited Findings
**Streaks (iOS, Crunchy Bagel)**
- **Signature features:**
  - Up to 24 tasks.
  - "Don't break the chain, or your streak will reset to zero days."
  - Per-task schedules ("Go to the gym (3 days per week)", "Avoid junk food (Sunday to Friday)") so off-days don't break the streak.
  - Auto-completion from Apple Health (steps, heart rate, runs).
  - Negative tasks to break bad habits, timed tasks, shared tasks so others can keep you accountable, and Apple Watch support.
  - Apple Design Award winner.
  — [streaksapp.com (2026)](https://streaksapp.com/); [App Store listing](https://apps.apple.com/us/app/id963034692)
- **Pricing and rating:** One-time purchase of $5.99. Rated 4.81★ from 27,350 ratings (US App Store, Oct 2026). — [iTunes lookup, App Store](https://apps.apple.com/us/app/id963034692)

**Habitify**
- **Pricing:** The free tier allows 3 habits. Premium is listed at $2.49/mo billed annually, or $59.99 lifetime, on the web pricing page. App Store in-app prices include Pro Monthly $8.99, Pro Yearly $49.99, Pro Lifetime $119.99 and Plus Yearly $29.99, so prices vary by channel and offer. — [Habitify pricing (2025)](https://www.habitify.me/pricing); [App Store](https://apps.apple.com/us/app/id1111447047)
- **Features:**
  - "Off mode for breaks".
  - Habit-stacking and location-based reminders.
  - Calendar integrations.
  - Auto-logging from Apple Health, Google Fit, Fitbit, Strava, Screen Time and RescueTime. The pitch: "Building habits shouldn't create a new habit of opening a habit tracker."
  - API and **MCP** support to "log habits by chatting with your favorite AI assistant".
  - Friend challenges with leaderboards and adjustable difficulty ("Hard Mode").
  — [App Store listing (2026)](https://apps.apple.com/us/app/id1111447047)
- **"Pause & Reflect":** "Slipping up is part of the journey. Now, when you skip or fail a habit, we help you take a mindful pause to note down why… to help you learn, let go of guilt, and keep moving forward." — [App Store listing, release notes (2026)](https://apps.apple.com/us/app/id1111447047)
- **Rating and complaints:** Rated 4.59★ (n=7,138). In a sample of 50 reviews (2021–2023), 25 were ≤2★. Most of those cited sync and login bugs (10) or paywall and price (9). Example: "Sync doesn't work… can't even sign in on mac." — [App Store review feed](https://itunes.apple.com/us/rss/customerreviews/id=1111447047/sortby=mostrecent/json)

**Fabulous**
- **Positioning:** It describes itself as having "started as a habit tracker, but it evolved into a self-improvement, coaching, and mental health platform": routines, coaching series and "Premium Journeys", journaling, workouts, live challenges. Rated 4.42★ (n=89,252). In-app purchase prices range from $16.99 to $59.99 per period, with many variants. — [App Store (2026)](https://apps.apple.com/us/app/id1203637303)
- **Complaints:** Billing dominates. In the 50 most recent US reviews (Aug–Sep 2026), 36 were ≤2★, and 30 of those mention charges or cancellation. Examples: "I cancelled before the trial was over, yet was charged for three separate 'bundles'"; "Too much going on… a platform for getting me to download… other, affiliated apps." Among "most helpful" reviews, praise centres on easy, gentle routines (5★ = 36/50). — [App Store review feed, recent](https://itunes.apple.com/us/rss/customerreviews/id=1203637303/sortby=mostrecent/json)
- **Third-party ratings:** Trustpilot is reported at 3.2/5 (3,936 reviews) and Google Play at 3.9 (snippet). — [Kimola / review aggregators (snippet)](https://kimola.com/reports/insightful-fabulous-app-feedback-analysis-report-app-store-us-151506)

**Finch (self-care pet)**
- **Core loop:** "Take care of your pet by taking care of yourself!" It offers quick mood check-ins, goals and guided self-care journeys. The pet "goes exploring" and comes back "to share stories". Rated 4.95★ from **763,427** ratings, the largest base in this set. Finch Plus is priced $5.99–$69.99 depending on period. — [App Store (2026)](https://apps.apple.com/us/app/id1528595748)
- **Review sentiment:** In the 50 most recent reviews (Oct 2026), 43 were ≥4★. Praise clusters on cute and gentle tone (12 of 43) and doing it with a partner or friend. — [App Store review feed](https://itunes.apple.com/us/rss/customerreviews/id=1528595748/sortby=mostrecent/json)
- **Other reviewer comments (snippet):**
  - The free tier covers the core.
  - A four-year user on Trustpilot said the app "now… stresses her out".
  - A diary study found early support "slowly turned into reward-driven habits".
  — [Make Headway review (snippet)](https://makeheadway.com/blog/finch-app-review/)

**Atoms (official Atomic Habits app, launched 14 Feb 2024)**
- **Features:**
  - Identity-based habit creation ("build habits based on the kind of person you want to become").
  - Guidance on "how to start at the right size".
  - "Committing to a time and place".
  - Daily lessons from James Clear.
  - Reminders.
  - The "five good minutes a day" pitch.
  - Rated 4.83★ (n=10,733).
  - Pro costs $4.99/mo or $39.99/yr.
  — [atoms.jamesclear.com (2026)](https://atoms.jamesclear.com/); [App Store](https://apps.apple.com/us/app/id6474421906)
- **Complaints:** Price and paywall. In 100 reviews (2024–2025), 35 were ≤2★ and 25 of those cite price or subscription. Examples: "cannot justify spending $70 per year for… a glorified and fancy reminders application"; an auto-renewal complaint; a privacy-policy complaint. Android rating is reportedly ~3.0 (snippet). — [App Store review feed](https://itunes.apple.com/us/rss/customerreviews/id=6474421906/sortby=mostrecent/json); [YourStory review 2024 (snippet)](https://yourstory.com/2024/05/james-clear-atoms-app-transform-habits)

**Loop Habit Tracker (Android, free, GPLv3)**
- **Habit-strength score:** Instead of only a streak, Loop computes `score_t = score_{t-1}·m + completion_t·(1−m)`, with `m = 0.5^(√frequency / 13)`.
  - For a daily habit (frequency 1), each day's weight halves every 13 days. In effect the score has a ~13-day half-life.
  - Partial completion counts proportionally for numeric habits.
  - SKIP entries are excluded and leave the score unchanged.
  — [Loop source, Score.kt](https://github.com/iSoron/uhabits/blob/master/uhabits-core/src/jvmMain/java/org/isoron/uhabits/core/models/Score.kt); [ScoreList.kt](https://github.com/iSoron/uhabits/blob/master/uhabits-core/src/jvmMain/java/org/isoron/uhabits/core/models/ScoreList.kt)
- **Design intent:** The README says "a few missed days after a long streak will not completely destroy your progress" (snippet). — [Loop README via jsDelivr (snippet)](https://cdn.jsdelivr.net/gh/isoron/uhabits@dev/README.md); [loophabits.org](https://loophabits.org/)

**Way of Life (since 2010)**
- **Features:**
  - Mark each day green (done), red (not done) or skip.
  - Chains.
  - Trend charts over weeks, months and years.
  - A weekly and monthly scoreboard.
  - A diary "to quickly jot down what triggered a bad habit".
  - CSV, Excel and JSON export.
  - "Premium simply unlocks unlimited habits", priced $4.99–$29.99.
  - Rated 4.82★ (n=5,303).
  — [App Store (2026)](https://apps.apple.com/us/app/id393159800); [wayoflifeapp.com](https://wayoflifeapp.com/)
- **Praise:** In 100 "most helpful" reviews, 92 were ≥4★ and none ≤2★. "Simple/quick" was mentioned in 49. One user: "causes me more anxiety to deal with all the bells and whistles of the other apps than just straightforward check boxes – I did it / I didn't / I'm skipping." — [App Store review feed, most helpful](https://itunes.apple.com/us/rss/customerreviews/id=393159800/sortby=mosthelpful/json)

**Productive**
- **Features:**
  - Programs with daily tips and reflection check-ins.
  - Global challenges.
  - Chains and "perfect days".
  - Time-of-day sections.
  - Location reminders.
  - Pause habits.
  - Rated 4.6★ (n=91,067).
  - Premium is $10.99/mo, with yearly offers from $19.99 to $79.99.
  — [App Store (2026)](https://apps.apple.com/us/app/id983826477)
- **Complaints and praise:** In 100 "most helpful" reviews, 34 were ≤2★; 29 of those cite subscription or paywall, and 13 cite reminder or sync problems. One user asked for a "skip justification option… if I don't do it/skip it, it wouldn't count as a negative strike." A 5★ user praised that "if you end up not being able to complete a habit, you don't get negative feedback. Most habit forming apps… have negative feedback… which can… cause more self-criticism." — [App Store review feed](https://itunes.apple.com/us/rss/customerreviews/id=983826477/sortby=mosthelpful/json); [App Store listing reviews](https://apps.apple.com/us/app/id983826477)

**Daylio (mood micro-diary)**
- **Features:** Pick a mood (5-point scale) and tag activities. The first entry takes "two steps". Stats show the relationship between moods and activities. Newer versions add sliders for sleep, stress, energy and pain. Rated 4.77★ (n=62,023). Premium is priced $4.99–$59.99. — [App Store (2026)](https://apps.apple.com/us/app/id1194023242)
- **Review sentiment:** In 100 recent reviews (2026), 90 were ≥4★. Praise is for simplicity (22) and mood–activity insights (15): "I like that it shows the correlation between mood and activities"; one user reported 6 years of continuous use. — [App Store review feed](https://itunes.apple.com/us/rss/customerreviews/id=1194023242/sortby=mostrecent/json)

**Exist.io (personal analytics)**
- **What it does:** It combines automatic syncing (steps, sleep, calendar, weather and more) with manual custom attributes (quantity, duration, 1–9 scale, %, time of day, tags). It offers built-in mood tracking, correlations, "daily insights", trends and averages, and a weekly summary email. Users can "run experiments on your behaviour, and Exist will confirm or rule out your hunches."
- **Pricing:** One plan at $6.99/mo or $62.90/yr, with a 30-day trial.
- — [exist.io (2026)](https://exist.io/)

**Bearable (symptom, mood and habit correlations)**
- **Features:** "Factors" (habits and events) are correlated with mood, symptoms, sleep and energy. There are custom ratings (e.g., Productivity), "Experiments" (one factor against one outcome over a set period) and a Discoveries tab. Rated 4.77★ (n=6,476). Premium is priced $4.49–$49.99. — [App Store](https://apps.apple.com/us/app/id1482581097); [Bearable help: What are Factors (2022)](https://bearable.app/?p=6428)
- **Free vs premium:** Free covers unlimited tracking plus a 30-day comparison graph. Premium adds the "Impacts" tab (correlation reports), the correlations grid, 60/90/365-day reports and unlimited experiments. — [Bearable Free vs Premium (2025)](https://bearable.app/?p=18968)
- **Complaints:** Over-complex check-ins. "Asked wayyyyy too many questions during check in… I am looking for something that takes less than 30 seconds"; "super complex and takes a lot of time to setup and then to do your check in two to three times a day." — [App Store review feed (2025–26)](https://itunes.apple.com/us/rss/customerreviews/id=1482581097/sortby=mostrecent/json)

**Gyroscope**
- **Positioning:** "A new operating system for the human body". It offers a "Health Camera" (photo food logging), unified tracking (food, fasting, mood, sleep, glucose, productivity, devices) and AI coaching. In-app prices range from $9 to $299. Only 50 US ratings, so independent reviews are scarce. — [App Store (2026)](https://apps.apple.com/us/app/id1104085053)
- **Older tiers:** Track $9.99/mo, Score $29.99/mo (AI coach plus human support) and Coach $150/mo (snippet; may be outdated). — [aichief / App Store snippets](https://aichief.com/alternatives/gyroscope/)

**Duolingo (benchmark for streak mechanics, not a habit app)**
- **Scale of experimentation:** 600+ streak-related experiments. Product lead's lessons:
  - "Streaks… can't make up for a weak product."
  - Tying streaks to XP "confused users"; simplifying to one lesson a day worked better.
  - "Retention is most fragile in the first seven days."
  - Copy change from "continue" to "commit to my goal" increased retention.
  - Letting users choose their streak goal increased retention.
  — [Lenny's Podcast, Dec 15 2024](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks)

### Inferences
- **What Producti-me lacks** (each feature is present in at least two leading apps):
  1. Neutral skip, rest and vacation states that freeze rather than break: Streaks schedules, Habitify Off mode, Loop SKIP, Way of Life skip, Duolingo freezes.
  2. "N times per week" targets (Streaks, Loop).
  3. A decaying habit-strength % alongside the streak (Loop).
  4. Mood, energy and sleep micro-logging with factor correlations (Daylio, Exist, Bearable).
  5. Per-habit if-then cue and anchor fields, and sizing guidance (Atoms).
  6. A "why did I miss" note framed as learning, not judgement (Habitify Pause & Reflect, Way of Life diary).
  7. Auto-logging from health data (Streaks, Habitify). A PWA can't use HealthKit, so the realistic substitute is import via Google Fit or Health Connect exports or Apps Script.
  8. A weekly digest (Exist).
  9. Opt-in experiments (Bearable, Exist).
  10. Accountability with another person (Streaks sharing, Habitify challenges, Finch friends). This could be the user's rugby teammate or coach.
- **Strict excuse validation needs a rethink.** Producti-me validates excuses strictly and penalises unexcused misses. No top-rated app does this. Reviewers explicitly praise the absence of negative feedback (Productive, Finch, Way of Life) and ask for justified skips that do not count as strikes (Productive).
- **Copy, not features.** Habitify's "MCP / chat to log" and Duolingo's "commit to my goal" copy show that small logging and wording changes matter. Producti-me's AI coach is a natural place to add conversational logging.

### Gaps
- Reddit threads (r/getdisciplined, r/productivity, r/habits) could not be fetched (HTTP 403). Reddit sentiment here comes only from blogs quoting Reddit (Section 3) and is unverified.
- Exact Finch mechanics, such as whether the pet can be harmed by inactivity, were not confirmed from a primary source.
- Fabulous's "Journeys" structure and current list price were not confirmed; its in-app prices vary widely by offer.
- The review samples are small (50–100 per app), keyword-tagged and time-skewed (Habitify's sample is 2021–2023). They indicate themes, not prevalence.
- No reliable source on Gyroscope's current tiers or how its insights are computed.

---

## 2. Evidence on habit formation: implementation intentions, habit stacking, time to automaticity, context cues, "never miss twice", tiny habits, identity

### Takeaway
1. **If-then plans work, with medium-sized effects.** Implementation intentions show effects of d ≈ 0.27–0.66 across 642 tests (2025 meta-analysis), and d ≈ 0.65 for goal attainment in the 2006 review. Effects are larger when the plan is literally "if X then Y", the person is motivated and the plan is rehearsed.
2. **Habits take about two months, with wide variation.** The median is ~59–66 days to plateau, the range 4–335 days, and about half of people do not reach "habit" level within 12 weeks. Exercise takes ~1.5× longer than simple eating or drinking behaviours.
3. **One miss does not matter; misses that accumulate do.** That is the empirical basis for "never miss twice".
4. **Cues should be tied to existing routines.** Anchoring a behaviour to an existing routine or a fixed time works about equally well. Placing it *after* the anchor (floss after brushing) beat placing it before.
5. **Simplicity and consistency predict habit strength.**
6. **Identity-based habits have popular backing but weak direct evidence** (none verified here).

### Cited Findings
- **Sheeran, Listrom & Gollwitzer (2025), European Review of Social Psychology 36(1):162–194.** Across **642 independent tests**, implementation intentions were effective for cognitive, affective and behavioural outcomes (**.27 ≤ d ≤ .66**). "Effect sizes were larger when plans had a contingent (if-then) format, participants were highly motivated to pursue the goal, and plans were rehearsed." It also offers a taxonomy of cues (time-and-place, task juncture) and responses (including "ignore" responses). — [KOPS Konstanz record](https://kops.uni-konstanz.de/handle/123456789/69905)
- **Gollwitzer & Sheeran (2006), Advances in Experimental Social Psychology.** 94 independent tests, average **d = 0.65** on goal attainment, described as "medium-to-large" (snippet; >8,000 participants per a secondary source, not verified). — [Silicon Canals summary (snippet)](https://siliconcanals.com/?p=107751); [goodmedicine PDF excerpt (snippet)](https://goodmedicine.org.uk/files/implementation%20intentions,%20background.pdf)
- **Lally et al. (2010, Eur J Soc Psychol), as reported by BPS Research Digest (Oct 2010).**
  - 96 participants recruited, 82 completed. Each chose one daily behaviour tied to a cue (e.g., "50 sit-ups after morning coffee") and did it for 84 days.
  - Time to maximum automaticity averaged **66 days, range 18 to a predicted 254 days**. Automaticity rose fastest early, then plateaued.
  - About **half did not reach habit-level automaticity by day 84**.
  - Exercise took **~1.5×** longer than eating or drinking behaviours.
  - **"A single missed day had little impact on later automaticity gains"**, but "too many missed repeats… had a cumulative effect, reducing the maximum automaticity level."
  — [BPS Research Digest (2010)](https://www.bps.org.uk/research-digest/how-form-habit)
- **Singh et al. (2024), Healthcare 12(23):2488. Systematic review and meta-analysis of 20 studies, N=2,601.**
  - Habit-formation times were "59–66 days (median) and 106–154 days (means), with substantial individual variability (**4–335 days**)".
  - Interventions improved habit scores (SMD 0.69, 95% CI 0.49–0.88).
  - "Morning practices and self-selected habits generally exhibit[ed] greater strength."
  - Most studies had high risk of bias (11 of 20).
  — [PubMed 39685110](https://pubmed.ncbi.nlm.nih.gov/39685110/)
- **Keller et al. (2021), Br J Health Psychol. RCT, N=192, 84 days.** Habit formers took a **median of 59 days** to reach peak automaticity. Linking a nutrition behaviour to a daily routine and linking it to a specific time were "similarly effective". "Repeated plan enactment was a key predictor for automaticity." — [PubMed 33405284](https://pubmed.ncbi.nlm.nih.gov/33405284/)
- **Kaushal & Rhodes (2015), J Behav Med.** In new gym members (n=111, 12 weeks), "exercising for at least **four bouts per week for 6 weeks** was the minimum requirement to establish an exercise habit." Habit was predicted by consistency (β=.21), low behavioural complexity (β=.19), environment (β=.17) and affective judgements, i.e., enjoyment (β=.13). — [PubMed 25851609](https://pubmed.ncbi.nlm.nih.gov/25851609/)
- **Judah, Gardner & Aunger (2013), Br J Health Psychol. Evidence on habit stacking placement (N=50).** People told to floss **after** brushing formed stronger habits and flossed more at 8-month follow-up than those told to floss before. Positive attitude also predicted automaticity independently of repetition. — [PubMed 22989272](https://pubmed.ncbi.nlm.nih.gov/22989272/)
- **Stawarz, Cox & Blandford (2015, CHI). 4-week study plus a review of 115 habit apps.**
  - "Relying on reminders supported repetition but hindered habit development, while the use of **event-based cues** led to increased automaticity; positive reinforcement was ineffective."
  - Existing apps "focus on self-tracking and reminders, and do not support event-based cues."
  - The authors propose guidelines built on contextual cues and implementation intentions (snippet).
  — [Cardiff ORCA record (snippet)](https://orca.cardiff.ac.uk/id/eprint/130626/); [UCL Discovery](https://discovery.ucl.ac.uk/id/eprint/1468224/)
- **Renfree et al. (2016, CHI EA). Qualitative study of the Lift app.** Reminders and streaks "are effective at supporting repetition of new behaviors, but at the same time create a **dependency**". Users who abandon the app often drop the behaviour (snippet). — [Northumbria research portal (snippet)](https://researchportal.northumbria.ac.uk/en/publications/dont-kick-the-habit-the-role-of-dependency-in-habit-formation-app/)
- **Tiny Habits (BJ Fogg method), Hollingsworth & Redden (2022), RCT, N=154.**
  - Groups practised 3 self-chosen Tiny Habits "recipes" with a 5-day email program.
  - Gratitude scores rose more than in inactive controls: Δ +6.9 vs +2.5, d=0.85 post; +7.0 vs +2.9 at 1 month, d=0.78.
  - Caveat: completion was only 74% and 60% post, and 56% at 1 month.
  - I found no large RCT of Tiny Habits for physical health habits in this search.
  — [PubMed 35651860](https://pubmed.ncbi.nlm.nih.gov/35651860/)
- **Identity-based habits (James Clear).** "There are three layers of behavior change: a change in your outcomes, a change in your processes, or a change in your identity… start by focusing on who we wish to become." "In order to believe in a new identity, we have to prove it to ourselves." This is a practitioner framework, not a study. — [jamesclear.com/identity-based-habits](https://jamesclear.com/identity-based-habits)
- **Beshears, Lee, Milkman, Mislavsky & Wisdom (2021), Management Science 67(7). Field experiment on gym incentives.** "Routine incentives [paid only within a planned daily 2-hour window] generated **fewer** gym visits than flexible incentives, both during our intervention and after incentives were removed." — [RePEc abstract](https://ideas.repec.org/a/inm/ormnsc/v67y2021i7p4139-4171.html)

### Inferences
- **If-then cue field.** Producti-me should add an explicit field per habit ("After [existing routine], I will [minimum version] at/in [place]") and have the AI coach help write and occasionally rehearse it. This is the most evidence-backed missing feature, given the 642-test meta-analysis and Stawarz's finding that event cues beat reminders.
- **Anchors for this user.** Anchor to stable daily events in the student/rugby/work routine (after training, after leaving the marble shop, after the first class). Rigid clock times are less useful: Beshears found flexibility beat rigid time windows, and Keller found routine and time cues equivalent.
- **Habit stages and graduation.** Track a "formation" stage per habit, with expectations set at ~2–3 months (longer for training-type habits).
  - Every 2–4 weeks, a 4-item self-report automaticity check (SRBAI-style, as used in the Singh review) could decide "graduation".
  - A graduated habit moves to a low-attention maintenance list. This frees slots and addresses Renfree's dependency risk by fading reminders as automaticity rises.
- **Tolerating single misses.** "Never miss twice" is consistent with the evidence: Lally found single misses harmless but cumulative misses harmful, and Milkman's comeback bonus was the top intervention (Section 3). Producti-me's penalty logic should treat a single miss as neutral and focus all energy on the next scheduled day.
- **Minimum version is well grounded.** The existing "minimum version" feature matches tiny-habits logic and Kaushal's complexity finding. It should be the default fallback offered automatically, not a buried option.
- **Training habits.** For the rugby context, Kaushal's "≥4 sessions/week for 6 weeks" gives a concrete formation target for training-related habits.

### Gaps
- I did not fetch the primary Lally 2010 paper. The 66-day figure is reported as a mean by BPS and as a median by some other sources, so the sources disagree.
- I did not verify the primary text of Gollwitzer & Sheeran 2006 (k=94, N>8,000).
- Domain breakdowns (e.g., physical activity d≈0.59) circulate only on blogs and were not verified.
- No peer-reviewed test of "identity-based" framing for habits was verified. Bryan et al. 2011 (noun vs verb "be a voter") and its failed replication were not checked because the search budget ran out.
- No peer-reviewed RCT of "habit stacking" as such. The closest evidence is Judah 2013 and Keller 2021.

---

## 3. Gamification, streaks, loss aversion, commitment devices, self-compassion vs punishment, freezes and repair

### Takeaway
**Streaks work, mainly early on, and the cost of a broken streak is real.**
- An intact streak raises engagement, and a broken one lowers it, independent of actual past behaviour.
- The damage is **amplified when the break is attributed to oneself** and **reduced when the streak can be repaired** (JCR 2023).
- Flexibility mechanics consistently help. Duolingo's freezes, weekend amulet and decoupling the streak from a demanding goal improved retention, and emergency-reserve goals produced more goal days than strict or easy goals.

**The best-performing intervention in a 61,000-person megastudy was a tiny bonus for coming back after a miss.**
- It produced +27% gym visits vs placebo and +16% vs the base plan.

**Loss framing works for people who choose it.**
- Loss-framed incentives can beat gain-framed ones (45% vs 35% of days).
- But punitive deposit contracts are rarely accepted (13.7% vs 90%).

**Self-criticism predicts worse goal progress. Self-compassion predicts more persistence after failure.**

**Implication for Producti-me:** stacking automatic penalties, a 72-hour no-XP sanction and strict excuse validation is the pattern most likely to trigger "what-the-hell" abandonment.

### Cited Findings
**Streaks and broken streaks**
- **Silverman & Barasch (2023), Journal of Consumer Research 49(6):1095–1117. Seven studies.**
  - "Intact streaks highlighted via behavioral logs increase consumers' subsequent engagement… relative to when broken streaks are highlighted."
  - The effect "is independent of actual past behavior and depends solely on how that behavior is represented within the log."
  - "The effect… is **amplified when consumers attribute a break in the streak to themselves** rather than to external factors, and **attenuated when consumers can 'repair' a broken streak**."
  — [CU Boulder Leeds faculty research page (2023)](https://www.colorado.edu/business/faculty-research/2023/04/19/or-track-how-broken-streaks-affect-consumer-decisions)
- **Duolingo, how streak motivation changes (2022).** Early in a streak, motivation comes from growth (2→3 days is +50%). Later it comes from loss aversion. "If you lose a day and break your streak, it can have the opposite effect, and actually feel quite demotivating. And **the fear of losing a streak could prevent learners from even attempting one**." — [Duolingo Blog, Jan 31 2022](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)
- **Duolingo celebration animations (2022).** A new streak-extension animation raised the share of new learners still active at day 7 by **+1.7%**. Learners reaching a 7-day streak were **3.6×** more likely to complete their course; this is correlational. — [Duolingo Blog, 2022](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)
- **Duolingo Streak Freeze (2022).** Allowing up to two equipped Streak Freezes "increased the relative number of active learners… every day by **+0.38%**" and did not lead to more days off. Duolingo cites the Penn/UCLA "slack" research (Sharif & Shu) as rationale. — [Duolingo Blog, 2022](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)
- **Duolingo, decoupling the streak from the daily goal (2020).**
  - Before the change, learners with the "intense" goal were the least likely to be on a streak. Almost 40% of learners active two days in a row without a streak had the intense goal.
  - Letting **one lesson** extend the streak (goal tracked separately) gave **+3.3% Day-14 retention**, **+1% DAU** and **+10.5%** daily learners on a streak within 20 days (+19% among new learners).
  - The share of daily learners on a 7+ day streak rose from about a third to just over half within a year. Learners on a 7-day streak were 2.4× more likely to return the next day.
  - Trade-off: fewer learners hit their daily goal.
  - Duolingo's conclusion: "lowering the barriers to building a consistent daily habit is more important… than how much you learn each day, at least early on."
  — [Duolingo Blog, Nov 19 2020](https://blog.duolingo.com/improving-the-streak/)
- **Duolingo Streak Wager and Weekend Amulet (2017).**
  - **Streak Wager:** bet in-game currency on keeping the streak 7 more days, with double payout. It raised Day-7 retention by **+14%**.
  - **Weekend Amulet:** keep the streak over the weekend. Learners offered it were **4% more likely to come back a week later and 5% less likely to lose their streak**. Weekend DAU otherwise drops 5–10%.
  - "Learners who binge… were much more likely to abandon the app than learners who pace themselves."
  — [Duolingo Blog, May 10 2017](https://making.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals)
- **Streak repair.** Duolingo also sells streak repair. I found no published A/B result for it (snippet). — [deceptive.design note (2023, snippet)](https://www.deceptive.design/articles/when-a-user-uses-duolingo-on-a-series-of-consecutive-days-this-is-called-a-streak-if-users-miss-a-day-they-can-pay-to-repair-it)

**Slack, emergency reserves and flexibility**
- **Sharif & Shu (OBHDP, 2019 online / 2021). One field study and four lab studies.**
  - Goals "framed with **emergency reserves**, a type of slack, can motivate individuals to persist after subgoal failures." The mechanism is greater perceived progress, which raises commitment.
  - Field study: N=273 completed the baseline, 5 weeks, step goal = 120% of baseline.
  - Conditions: Reserve (7 days/week + 2 "emergency skips"), Hard (7 days/week) and Easy (5 days/week).
  - Average goal days per week: **4.00 (Reserve-Weekly) vs 3.11 (Easy) vs 2.83 (Hard)**.
  - In one lab study, giving the reserve *after* a failure beat giving it before (78.2% vs 54.7% persisted).
  — [Sharif & Shu PDF, OBHDP](https://anderson-review.ucla.edu/wp-content/uploads/2021/03/Sharif-Shu_EmergencyReserveFailure_OBHDP2019.pdf)
- **Beshears et al. (2021).** Flexible incentives beat routine (fixed-window) incentives during the intervention and after it ended. — [RePEc](https://ideas.repec.org/a/inm/ormnsc/v67y2021i7p4139-4171.html)

**Rewards, loss framing and commitment devices**
- **Milkman et al. (2021), Nature 600:478–483. StepUp megastudy, 61,293 24 Hour Fitness members, 54 four-week programs.**
  - 45% of interventions increased weekly gym visits by 9–27%. **Only 8%** had significant effects after the 4 weeks.
  - **Top performer:** a bonus of 125 points (**US$0.09**) "for returning to the gym after a missed workout". It gave +0.40 weekly visits, **+27% vs placebo** and **+16% vs the planning + reminders + micro-incentives base**.
  - Others: larger per-visit incentives (+25%); a social norm message ("the majority of Americans exercise and the fraction is growing", +24%); a $0.16 return bonus (+23%); **letting participants choose gain or loss framing (+19%)**.
  - All 24 effective treatments included planning, reminders and incentives.
  - Expert forecasts did not predict the winners.
  - The authors warn that top effects are probably inflated.
  — [PMC8822539 full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC8822539/); [PubMed 34880497](https://pubmed.ncbi.nlm.nih.gov/34880497/)
- **Patel et al. (2016), Annals of Internal Medicine. N=281, 13 weeks, 7,000-step goal** (snippet via Penn press coverage).
  - The loss-framed arm got $42/month up front and lost $1.40 per missed day.
  - It met the goal on **45%** of days, vs 36% (lottery), 35% (gain-framed $1.40/day) and 30% (control).
  - Effects disappeared after incentives stopped.
  — [Penn Today, 2016 (snippet)](https://penntoday.upenn.edu/2016-03-24/research/prospect-losing-money-pushes-people-achieve-fitness-goals)
- **Halpern et al. (2015), NEJM 372:2108–17. N=2,538 smokers.**
  - **90.0%** accepted reward-based programs vs **13.7%** for deposit-based (lose-your-own-money) programs.
  - By intention to treat, rewards produced more 6-month abstinence (15.7% vs 10.2%).
  - Among people who would accept either, deposits were 13.2 percentage points more effective.
  - Takeaway: punishment-based commitment works for the few who choose it, but repels most people.
  — [PubMed 25970009](https://pubmed.ncbi.nlm.nih.gov/25970009/)
- **stickK (company-reported, conflicting figures).** Success was ~29% with no referee or stakes, 59% with a referee, 71.5% with money at stake and "nearly 80%" with both (2012 NYT-cited). A HarvardX course reports weight-loss success of 61.3% fully engaged vs 14.5% without a referee or stakes. These are self-selected users, not RCTs. — [HarvardX BUS5.1x excerpt (snippet)](https://courses.edx.org/c4x/HarvardX/BUS5.1x/asset/8-page.html); [goodmedicine blog (snippet)](https://goodmedicine.org.uk/blog/commitment-contracts-they-really-can-help-us-achieve-personally-difficult-goals)
- **Beeminder** does not tabulate aggregate derailment rates. Staff worried such stats "might end up being really demoralizing for some users" (forum, snippet). — [Beeminder forum (snippet)](https://forum.beeminder.com/t/derailment-statistics-yay-or-nay/10932)

**Gamification overall**
- **Mazeas et al. (2022), JMIR. Meta-analysis of 16 RCTs, N=2,407.**
  - Gamified interventions increased physical activity: Hedges **g=0.42** overall, 0.58 vs inactive controls, **0.23 vs non-gamified active interventions**.
  - At follow-up (~14 weeks after the end) the effect fell to **g=0.15**.
  — [PubMed 34982715](https://pubmed.ncbi.nlm.nih.gov/34982715/)
- **Stawarz et al. (2015):** positive reinforcement "was ineffective" for automaticity (snippet). — [Cardiff ORCA (snippet)](https://orca.cardiff.ac.uk/id/eprint/130626/)

**Self-compassion vs self-criticism, and the "what-the-hell" effect**
- **Breines & Chen (2012), PSPB 38(9). Four experiments.** Inducing self-compassion after failure, compared with self-esteem or neutral controls, increased belief that a weakness can change, motivation to make amends and to avoid repeating a transgression, and **time spent studying after an initial failure**. — [PubMed 22645164](https://pubmed.ncbi.nlm.nih.gov/22645164/)
- **Powers et al. (2011), PSPB. Five studies.** There was "a consistent pattern of **negative association between self-criticism and goal progress**". Self-oriented perfectionism (high standards) was positively associated with progress once self-criticism was controlled. — [PubMed 21632968](https://pubmed.ncbi.nlm.nih.gov/21632968/)
- **Sirois et al. (2015), Health Psychology. Meta-analysis of 15 samples, N=3,252.** Self-compassion correlated with health-promoting behaviour (eating, exercise, sleep, stress management): average **r=.25**, partly via positive and negative affect. — [PubMed 25243717](https://pubmed.ncbi.nlm.nih.gov/25243717/)
- **Sirois & Hirsch (2019).** Self-compassion was associated with medical adherence across 5 samples (N=709): r=.22, partly via lower stress. — [PubMed 30662571](https://pubmed.ncbi.nlm.nih.gov/30662571/)
- **"What-the-hell" effect (Zemack-Rugar et al., Virginia Tech, 2014).** Whether people give up after an initial slip or course-correct is a consistent individual tendency across domains. The response to the first slip is "key" to long-term outcomes. — [Virginia Tech News, May 2014](https://news.vt.edu/articles/2014/05/050214-pamplin-failureresponse.html)
- **Anecdotal user experience (unverified).** Blogs quote r/getdisciplined users saying that with streak apps, "break the streak once and the whole system collapsed, and I'd come back angrier at myself than before." A Notion-tracker maker describes the typical failure as "start with 15 habits, break one streak, feel guilty, abandon the whole system by week 3" and caps habits at 4–6 with a weekly score. These are vendor blog and launch pages, so treat them as anecdote. — [habitdoom blog (snippet, 2026)](https://habitdoom.com/blog/streak-anxiety-habit-trackers); [Product Hunt, Habit Reset 2026 (snippet)](https://www.producthunt.com/p/habit-reset-2026/habit-reset-2026)

### Inferences
- **Self-attribution and missing repair amplify broken-streak harm.** Producti-me currently maximises both:
  - Strict excuse validation pushes more misses into "my fault".
  - Penalties and the 72-hour no-XP sanction add loss on top of the broken streak.
  - There is no repair path.
  This is the configuration Silverman & Barasch's results predict is most damaging. Powers 2011 (self-criticism) and the what-the-hell literature point the same way.
- **Penalty → comeback mechanic (the evidence-backed swap).** Replace the "expire → 72 h no XP" sanction with a **comeback bonus**: extra XP or "repair" credit for doing at least the minimum version on the next scheduled day after a miss. This mirrors the megastudy's top intervention. "Repair" lets the minimum version, done within 24–48 h, restore the streak, which Silverman & Barasch say attenuates the damage. Keep penalties only as an **opt-in** "hard mode" per habit: Halpern shows punitive designs work for the minority who choose them, and the megastudy's "choose your framing" condition gave +19%.
- **Emergency reserves.** Give each habit e.g. 2 "emergency skips" per week or 6 per month, explicitly labelled as emergency.
  - Auto-apply them to legitimate rugby match or travel days.
  - Make the default "7 days + reserves", not "5 days" (Sharif & Shu: Reserve 4.00 vs Easy 3.11 days/week).
  - Show the reserve as protecting progress, not as a cheat.
- **Weekend and rest-day protection.** Add a planned "rest day / match day / exam week" amulet, analogous to Duolingo's Weekend Amulet and Streaks' per-day schedules. Medals then reflect compliance with the *planned* schedule.
- **Separate the "streak unit" from the "goal".** As Duolingo found, the streak should be kept by the minimum version. XP, medals and leagues can reward fuller completion. This preserves daily continuity without making high targets a barrier.
- **Optional streak wager.** A weekly self-challenge ("bet 200 XP on 7/7 this week, win 400") is opt-in and has a +14% D7 precedent at Duolingo. It is a better use of loss aversion than automatic sanctions because the user chooses it.
- **Compassionate failure copy.** After a miss, the AI coach should use self-compassionate language and a learning prompt ("what got in the way? what's the if-then for next time?"). This follows Habitify's Pause & Reflect, Breines & Chen and Powers. It should not demand a "justified" excuse to avoid punishment.
- **Leagues and medals: keep them, but beware.** Gamification adds only a small increment over non-gamified support (g=0.23) and decays after it stops (g=0.15 at follow-up). Leagues and XP should support habit formation; they cannot carry it. Duolingo's lesson applies: streaks "can't make up for a weak product".

### Gaps
- Wohl, Pychyl & Bennett (2010) on self-forgiveness and procrastination was not verified (search budget exhausted).
- Primary text of Patel 2016 not fetched; figures come from Penn press coverage.
- No published Duolingo A/B data on paid streak repair or "earn back" mechanics.
- I found no independent, peer-reviewed effectiveness data for stickK or Beeminder, only company figures.
- The secondary report that the Breines & Chen self-compassion group "studied 25% longer" was not verified.
- No study directly compares automatic penalties with comeback bonuses in a single-user habit app; the inference is extrapolated from the megastudy plus the JCR streak research.

---

## 4. Correlation and insight engines (Exist.io, Bearable, Gyroscope, Daylio): computation, minimum data, honest presentation

### Takeaway
The leading engines use simple, transparent statistics with explicit data thresholds and causal disclaimers.
- **Exist:** waits for **≥21 days** of non-missing data per attribute and recomputes **weekly**. If nothing shows up on the same day, it tests a **next-day lag**. It reports correlations with a **strength** label and a **5-star confidence** rating.
- **Bearable:** compares the outcome on days **with vs without** a factor. It starts at **3 days with + 3 days without**, recommends 7 + 7 and ideally **30 days**, and accounts for time of day. It explicitly warns about reverse causation, confounders and outliers, and it pushes users to track **few** factors and run **one-factor experiments**.

Producti-me already collects daily habit data. Adding a 1-tap daily mood, energy and sleep log would enable the same engine.

### Cited Findings
- **Exist, minimum data.** "We need at least **three weeks' worth of data** for an attribute, excluding days with no data (shown as 'N/A'), before we can find correlations. Correlations are updated **weekly**, so each Monday you'll see new correlations." — [Exist KB: How long does it take to find correlations? (updated Sep 2023)](https://kb.exist.io/article/18-how-long-does-it-take-to-find-correlations)
- **Exist, lag.** "If a correlation between two attributes isn't found for the same day, Exist will check for correlations… across **two consecutive days**" (e.g., alcohol → next night's sleep; workout → next day's mood). Users should log things on the day they happen. — [Exist KB article 55 (Feb 2022)](https://kb.exist.io/article/55-will-exist-find-correlations-across-multiple-days)
- **Exist, presentation.**
  - "Correlations can't determine the cause… One attribute changing might cause the other… or vice versa, or a third variable might affect both, or the relationship might be a coincidence."
  - "Each correlation includes indications of **strength and confidence**… The confidence indicator shows a number of **stars out of 5**." A strong relationship can still have low confidence when data is scarce.
  - Correlations "can be read with either attribute first."
  — [Exist KB: What are correlations? (Sep 2023)](https://kb.exist.io/article/37-what-are-correlations)
- **Exist, other features.** Daily insights, long-term averages and trends, a weekly summary email and "run experiments… Exist will confirm or rule out your hunches"; finds "most users are happier on the weekend." — [exist.io (2026)](https://exist.io/)
- **Bearable, how correlations start.**
  - "You'll begin to see correlations… after you: Have at least **3 days with a factor**, **3 at least days without** the same factor, [and] Mood, Symptom, Sleep, or Energy scores on each of these days. Bearable is then able to compare your scores for days when the factor occurred vs. the days it didn't."
  - "Bearable will take timing into account" (evening caffeine vs morning symptoms).
  - "For the best results, we recommend tracking a factor over a **30-day period**."
  - "Factor Effect" reports show **1-day to 7-day** impact.
  - Advice: "Limit the factors you track… If you try to track too many things at once it can become too much."
  — [Bearable help: How to find correlations (2022)](https://bearable.app/?p=6372)
- **Bearable, when correlations look wrong.**
  - "Having at least **7 days with, and 7 days without**, a single Factor will help."
  - "Correlations are not causation": reverse relationships (painkillers on high-pain days), confounders, outliers.
  - Its suggested workflow: log "significant events" (e.g., illness) to explain outliers, use the grid view to spot confounders, save useful correlations to "Discoveries" and note the unhelpful ones.
  — [Bearable help: My correlations are wrong (Jul 2025)](https://bearable.app/support/troubleshooting/my-correlations-are-wrong-dont-make-sense/)
- **Bearable, experiments.**
  - Track one thing at a time over **7–30 days**.
  - With 6 days of outcome data plus 3 with / 3 without, correlations appear.
  - "Custom experiments" test one factor against one metric for a set duration.
  — [Bearable help: Discover what's improving/worsening your health (2023)](https://bearable.app/?p=9294)
- **Bearable, paywall split.** Free users get a 30-day comparison graph (manual pattern spotting). Premium gets automated "Impacts" reports and the correlation grid. — [Bearable Free vs Premium (2025)](https://bearable.app/?p=18968)
- **Daylio** links moods to activities in stats ("Validate your hunches. How does your new hobby influence your life?"). Users value seeing "the correlation between mood and activities". — [App Store (2026)](https://apps.apple.com/us/app/id1194023242); [review feed](https://itunes.apple.com/us/rss/customerreviews/id=1194023242/sortby=mostrecent/json)
- **General statistics caveat.** SciPy notes Pearson p-values "are probably reasonable for datasets larger than 500 or so". Personal datasets are far smaller, which is why the apps show confidence ratings rather than p-values (snippet; general statistics, not app-specific). — [SciPy pearsonr docs (snippet)](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html)

### Inferences
**Proposed Producti-me "insights" spec (derived from Exist and Bearable practice):**
1. **Inputs.** Habit completion (binary or partial), plus an optional 1-tap daily rating: mood, energy, sleep quality and maybe soreness or "rugby load". Keep it to 3–4 sliders at most, given Bearable's check-in-fatigue complaints.
2. **Method.** For each habit × outcome pair, compute the mean outcome on days *with* vs *without* the habit, at the same day and lagged +1 day (e.g., training → next-day energy; late screen use → sleep). Express it as a difference with a simple effect size (or a point-biserial r).
3. **Thresholds.** Show nothing until ≥7 with and ≥7 without, and ≥21 non-missing days in total. Label the result "early signal" below 30 days.
4. **Confidence.** Show a 1–5 confidence rating driven by n and consistency (e.g., a bootstrap CI or split-half agreement). Recompute weekly and surface results in the existing weekly review.
5. **Language.** Say "on days you X, your energy averaged +1.2/10" and "may be related". Never say "X causes Y".
6. **Multiple comparisons.** Many pairs will be tested, so cap shown insights to the top 3 by confidence and hide weak ones.
7. **Experiments.** Let the AI coach turn an insight into a 2-week experiment ("try no screens after 23:00 for 14 days and compare sleep"), Bearable-style.
8. **Context.** Allow tagging "significant events" (exams, injury, match day) to explain outliers.

**Engagement value.** Correlations reward logging with personal meaning ("validate your hunches"). That addresses the "perceived ineffectiveness" abandonment reason in Section 5.

### Gaps
- Exist does not publish its exact statistic (Pearson or Spearman), the significance threshold behind its star rating, or whether it corrects for multiple comparisons.
- Bearable's exact coefficient and test are also not documented.
- How Gyroscope computes its "insights" and AI recommendations was not found.
- No peer-reviewed validation that these consumer correlation engines change behaviour.

---

## 5. Why people abandon habit and self-tracking apps, and what mitigates it

### Takeaway
**Retention in this category is very low by default:**
- median 30-day retention is 3.3% across mental-health and wellness apps
- tracker apps do relatively better, at 6.1%
- the first 7 days are the most fragile

**The top reason people stop is the cost and effort of collecting data:** 45.6% of lapsed activity trackers. Other reasons:
- life changes (13.2%)
- "learned enough" (11.8%)
- data-quality doubts
- forgetting
- perceived ineffectiveness
- guilt and negative nudges

**What helps:**
- near-zero logging friction, including automation
- few habits at a time
- forgiving lapse handling with "welcome back" framing
- visible personal payoff (insights)
- designing for lapses and graceful exits rather than pretending they won't happen

### Cited Findings
- **Baumel et al. (2019), JMIR. 93 mental-health apps with ≥10k installs, panel usage data.**
  - The median **daily open rate** was 4.0%; tracker apps were higher at 6.3%.
  - Median **15-day retention was 3.9%** and **30-day retention 3.3%**.
  - **Tracker apps had a median 6.1% day-30 retention**, vs 0% for breathing apps.
  - Use peaks in the evening for tracker apps.
  — [PubMed 31573916](https://pubmed.ncbi.nlm.nih.gov/31573916/)
- **Epstein et al. (2016, CHI). "Beyond Abandonment to Next Steps", 193 surveyed, 12 interviewed (activity, finance and location tracking).**
  - Six reasons for stopping. Among former activity trackers: **cost of collecting and integrating data 45.6%**, life circumstances changed 13.2%, learned enough 11.8%, data-quality concerns 5.9%, discomfort with what the data revealed 5.9%, cost of having or sharing data 2.9%.
  - Quotes: "I felt guilty every time I tracked an expense"; "it was frustrating to know that I needed to make time to do the tracking, but the needs of my family outweighed my own personal goals"; a participant who got sick feels "ashamed that I haven't restarted, because I was doing so well."
  — [PMC5428074](https://pmc.ncbi.nlm.nih.gov/articles/PMC5428074/)
- **Epstein et al. (2016, UbiComp). "Lapses as a Design Opportunity", 141 lapsed Fitbit users.** Design guidance:
  - "Aggregate more when someone has less data."
  - Ensure framing "aligns with how the person feels about tracking".
  - "Portray the person positively compared to peers."
  — [PubMed 28516173](https://pubmed.ncbi.nlm.nih.gov/28516173/)
- **Cordeiro et al. (2015, CHI). Food journaling, 141 current and lapsed users plus 5,526 forum posts.** Identified "barriers to reliable food entry", "**negative nudges** caused by current techniques" and social-feature problems. — [PubMed 26894233](https://pubmed.ncbi.nlm.nih.gov/26894233/)
- **Attig & Franke (activity-tracker abandonment, 159 former users).** Permanent abandonment "was particularly related to **loss of tracking motivation**". Abandonment due to perceived data inaccuracy or uselessness was linked to negative attitudes toward quantification (snippet). — [Univ. Lübeck record (snippet)](https://www.imis.uni-luebeck.de/de/node/10562)
- **Undergraduate survey (Technium, 2025, n=105).** Wellness and lifestyle apps were abandoned for "perceived ineffectiveness, **forgetting to use them**, and paywalls or excessive ads" (snippet). This is relevant because Producti-me's user is a university student. — [Technium (snippet)](https://techniumscience.com/index.php/technium/article/view/13020/5010)
- **Renfree et al. (2016).** Streaks and reminders create dependency, so when users drop the app they often drop the behaviour (snippet). — [Northumbria (snippet)](https://researchportal.northumbria.ac.uk/en/publications/dont-kick-the-habit-the-role-of-dependency-in-habit-formation-app/)
- **Duolingo product lessons (2017–2024).**
  - Retention is "most fragile in the first seven days".
  - Bingers abandon more than paced learners.
  - Lowering the daily bar (one lesson) increased retention more than demanding goals.
  — [Lenny's Podcast 2024](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks); [Duolingo Blog 2017](https://making.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals); [Duolingo Blog 2020](https://blog.duolingo.com/improving-the-streak/)
- **Megastudy durability.** Only 8% of 54 interventions had significant effects after they ended. Each extra visit induced during the program produced ~0.30 extra visits over the next 10 weeks (95% CI 0.13–0.54). — [PMC8822539](https://pmc.ncbi.nlm.nih.gov/articles/PMC8822539/)
- **Logging speed is the most praised trait among long-term users.**
  - Way of Life users: "unless it is super quick to enter, you'll forget or not have the time. In Way of Life, I can enter status of 7-8 areas in a few seconds"; "Edit 4 years later: Still loving this app."
  - Daylio users report 5–6+ years of use.
  - Habitify markets "Tracking that happens automatically… Building habits shouldn't create a new habit of opening a habit tracker."
  — [wayoflifeapp.com testimonials](https://wayoflifeapp.com/); [Daylio review feed](https://itunes.apple.com/us/rss/customerreviews/id=1194023242/sortby=mostrecent/json); [Habitify App Store](https://apps.apple.com/us/app/id1111447047)
- **Too many factors or questions drives fatigue.** Bearable advises "try tracking only the factors that you suspect are most impacting your health… If you try to track too many things at once it can become too much." Its 1–3★ reviews complain about long check-ins. — [Bearable help (2022)](https://bearable.app/?p=6372); [Bearable review feed](https://itunes.apple.com/us/rss/customerreviews/id=1482581097/sortby=mostrecent/json)
- **Kaushal & Rhodes (2015).** Low behavioural complexity (β=.19) and enjoyment (β=.13) predicted habit formation. — [PubMed 25851609](https://pubmed.ncbi.nlm.nih.gov/25851609/)

### Inferences
**Logging friction budget.** Daily logging of all habits plus the optional mood, energy and sleep sliders should take ≤10–15 seconds from the icon grid, ideally one tap per habit, with long-press for the minimum version or skip. Any check-in flow longer than ~30 s (Bearable complaint) risks the top abandonment cause (45.6%).

**Cap active habits and graduate automatic ones.**
- Limit "building" habits to ~3–5 at once. Others stay in maintenance, are paused, or wait in a queue.
- Graduated habits need less logging, e.g., weekly confirmation. This reduces cost and the reminder dependency Renfree describes.

**Design for lapses explicitly.**
- On return after ≥2–3 days away, show a non-judgemental "welcome back" screen.
- Aggregate the view: weekly %, not a wall of red days.
- Offer a one-tap "fresh start" that re-plans the week with minimum versions.
- Do *not* show accumulated penalties.
- Epstein's lapse findings and the "ashamed that I haven't restarted" quotes suggest punishment-on-return is a strong exit trigger.

**First 7–14 days.**
- Start with 1–3 habits, all at minimum version.
- Celebrate early streak milestones with animation (Duolingo +1.7% D7).
- Introduce leagues and medals only after the first week, so a rough first week does not produce an early failure signal.

**Planned disruption.** Match days, exam periods and heavy weeks at the marble business are foreseeable. A "plan a light week" mode (auto-minimum versions plus reserves) addresses "life circumstances change" (13.2%) before it causes a lapse.

**Make the payoff visible.** Weekly insights (Section 4), habit-strength %, and the AI coach summarising "what's working" counter "perceived ineffectiveness" and "learned enough". The value of tracking should not depend on the streak number alone.

**PWA reminders (contextual inference).** Reminders should be few, tied to the planned cue time, and faded as the habit graduates. Stawarz and Renfree found reminders aid repetition but can hinder automaticity and create dependency.

### Gaps
- I found no peer-reviewed study specifically on habit-tracker app retention curves. Baumel 2019 covers mental-health and wellness apps, including trackers. Duolingo data is from a language app.
- The "tracking fatigue" literature beyond Epstein, Cordeiro, and Attig & Franke was not reviewed (search budget exhausted).
- No quantitative data on the optimal number of simultaneous habits. The "4–6 max" figure comes from a product page, not research.
- The "fresh start effect" (Dai, Milkman & Riis 2014), relevant to Monday weekly reviews and new-month resets, was not verified in this session.
