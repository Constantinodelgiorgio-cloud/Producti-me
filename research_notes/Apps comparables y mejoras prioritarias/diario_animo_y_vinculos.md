# Journaling, mood-tracking and wellbeing apps: features and the evidence behind them (for Producti-me)

Scope: Day One, Stoic, Rosebud, How We Feel, Reflectly, Daylio, Jour, Mindsera, Finch, Bearable, Headspace/Calm, Apple Journal, Clearful, Gratitude, and personal CRMs (Dex, Monica, Clay). Research covered: expressive writing, gratitude, affect labeling and emotion granularity, best-possible-self, CBT thought records, anger, loneliness and social connection, AI journaling safety, and retention.
Evidence-strength tags used below: **[META]** meta-analysis or systematic review · **[RCT/EXP]** randomized or experimental study · **[OBS]** observational or usage data · **[HCI]** small design or user study · **[VENDOR]** app store, marketing or company blog · **[ANEC]** anecdote, blog or opinion · **[2ND]** secondary press summary only (primary paper not read).
Research date: Oct 2026. Most direct page fetches failed with DNS errors (howwefeel.org, rosebud.app, argentina.gob.ar, medicine.yale.edu, macaron.im), so several app details come from search-engine extracts of those pages and from third-party reviews.

---

## 1. Signature features of comparable apps (How We Feel, Stoic, Rosebud, Day One, Apple Journal, Daylio and others)

### Takeaway
The leading apps share a few patterns. They make check-ins fast and structured: How We Feel's 2-axis Mood Meter (energy x pleasantness) plus granular words, and Daylio's tap-only mood and activity log. They anchor practice to times of day (Stoic's morning/evening). They bring the past back automatically (Day One "On This Day", Apple Journal suggestions, Clearful "Rediscover"). They turn data into patterns (Daylio Year in Pixels and correlations, Bearable correlation reports, Rosebud weekly insights). And they add AI that asks follow-up questions rather than giving answers (Rosebud "Go deeper", Headspace Ebb). Privacy-first designs, with data on the device and no account (Daylio, How We Feel), are a recurring selling point.

### Cited Findings

**How We Feel (Yale Center for Emotional Intelligence / Marc Brackett; free, donation-funded)**
- The check-in starts by choosing one of four Mood Meter quadrants (high/low energy x pleasant/unpleasant). The app then suggests more specific emotion words, and the updated Mood Meter has "144 words". [VENDOR] — [marcbrackett.com](https://marcbrackett.com/how-we-feel-app-3/); [App Store](https://apps.apple.com/us/app/-/id1562706384)
- Users can tag context (what they were doing, who they were with, where they were) and add a short note. The app then offers strategy videos and activities grouped into themes such as "Change Your Thinking" and "Move Your Body". [VENDOR] — [marcbrackett.com](https://marcbrackett.com/?p=721); [Yale Medicine news](https://medicine.yale.edu/news-article/the-how-we-feel-app-helping-emotions-work-for-us-not-against-us/) (page content via search extract only)
- On iPhone it pulls sleep and exercise from HealthKit and shows correlations between feelings and variables, reportedly including weather. [VENDOR/ANEC] — [App Store](https://apps.apple.com/app/how-we-feel/id1562706384); [screensdesign showcase](https://screensdesign.com/showcase/how-we-feel)
- **Friends feature:** users can share current feelings in real time with trusted people. One independent review says there is "no feed, no likes, no way to look at a history of your friends' check-ins". [VENDOR + ANEC] — [App Store](https://apps.apple.com/app/how-we-feel/id1562706384); [Reysu newsletter review](https://reysu.beehiiv.com/p/howwefeel)
- **Privacy:** "All of your data is kept on your device unless you opt-in to send an anonymized version of your check-ins to be used in research." [VENDOR] — [marcbrackett.com](https://marcbrackett.com/how-we-feel-app-3/)
- Reported as a 2022 App Store "Cultural Impact" award selection. The Mood Meter app's first version dates to 2013, and How We Feel was later built with Pinterest co-founder Ben Silbermann. [VENDOR/2ND] — [marcbrackett.com](https://marcbrackett.com/?p=721)

**Stoic (stoic. journal & mental health)**
- Morning: "personalized daily planner… Prepare your notes and to-do list so nothing can surprise you during the day." During the day: mood tracking and "bite-sized mental health exercises". Evening: "Reflect on your actions with our habit tracker." [VENDOR] — [App Store listing](https://apple.co/stoic); [App Store (PL)](https://apps.apple.com/pl/app/journal-mood-tracker-stoic/id1312926037)
- A user reports that the evening reflection follows the morning intention ("If in the morning I say I'm going to focus on reading, in the evening the app will then guide me to reflect on… what I read"). [ANEC, via App Store] — [App Store listing](https://apple.co/stoic)
- Templates include therapy-session prep, a CBT-based "thought dump" and a dream journal. It supports voice, photo and video entries, and newer versions list "AI Features, Journaling Suggestions". [VENDOR] — [App Store listing](https://apple.co/stoic)
- A 2019 review (possibly an older or different app also named Stoic) describes Morning/Evening with daily quotes and selectable question sets, with some sets ("Be happier", "Productivity") behind a paywall. [ANEC, 2019] — [MobileSyrup](https://mobilesyrup.com/2019/06/09/stoic-self-reflection-journaling-app-review/)

**Rosebud (AI journal)**
- After entries, the AI asks tailored follow-up questions. A "Go Deeper" button prompts questions about what lies beneath a surface-level entry, and evenings use a 3-question flow. [ANEC review, 2026] — [macaron.im review](https://macaron.im/blog/rosebud-ai-journaling-app-review-2026)
- Weekly reports summarize themes, and the AI "reflects back patterns in thoughts, emotions, and behaviors". Memory can bring up conversations from weeks or months earlier. One review says long-term memory is paid-only. [VENDOR + ANEC] — [rosebud.app (old home)](https://www.rosebud.app/old-home); [Rosebud blog, $6M seed](https://www.rosebud.app/blog/rosebud-raises-6m-to-expand-the-worlds-leading-ai-journal); [macaron.im](https://macaron.im/blog/rosebud-ai-journaling-app-review-2026)
- Positions itself as a companion to therapy and coaching, not a replacement. [VENDOR] — [rosebud.app/therapy-and-coaching](https://www.rosebud.app/therapy-and-coaching)
- Privacy and safety claims are covered in Section 3 (conflicting evidence).

**Day One — "On This Day"**
- "Quickly reminisce about where you've been, review photos you've taken, and read the entries you've written on a day over the years." A banner at the top of the timeline shows past entries from that date, plus adjustable daily notifications per journal. [VENDOR] — [Day One guide](https://dayoneapp.com/guides/tips-and-tutorials/on-this-day-view/)
- Expanded to the web app in Sept 2025 (reverse-chronological). [VENDOR, 2025] — [Day One release note](https://dayoneapp.com/releases/on-this-day-now-available-on-web/)
- Day One adopted Apple's iOS 18 Journaling Suggestions, including "Reflections" prompts, State of Mind, motion activity and media from Spotify and Pocket Casts. [VENDOR, 2024] — [Day One](https://dayoneapp.com/?p=69521)

**Apple Journal (iOS 17.2, Dec 11 2023)**
- "On-device machine learning provides private, personalised suggestions to inspire journal entries", drawn from Activity, Media, Contacts, Photos and Significant Locations. Only suggestions the user permits are shared with third-party apps through the Journaling Suggestions API. [VENDOR + press, 2023] — [Apple Newsroom](https://apple.com/au/newsroom/2023/12/apple-launches-journal-app-a-new-app-for-reflecting-on-everyday-moments); [TechCrunch](https://techcrunch.com/2023/12/11/apples-new-journal-app-is-now-available-with-the-release-of-ios-17-2); [Snopes](https://www.snopes.com/fact-check/iphone-journaling-suggestions-discoverable/)
- iOS 18 (2024) added "State of Mind" on a very unpleasant to very pleasant scale, shared with the watchOS Mindfulness app. It also added optional logging of writing time as Mindful Minutes, insights on writing streaks and totals, and reflection prompts on "gratitude, kindness, purpose, and more". [press, 2024] — [9to5Mac](https://9to5mac.com/heres-everything-new-in-the-journal-app-for-ios-18/); [Cult of Mac](https://www.cultofmac.com/how-to/how-to-start-journaling-with-apple-iphone-journal-app); [Apple WWDC24 session](https://developer.apple.com/videos/play/wwdc2024/10209/)
- Entries are end-to-end encrypted in iCloud, with optional Face ID or passcode lock. [VENDOR] — [Apple Newsroom](https://apple.com/au/newsroom/2023/12/apple-launches-journal-app-a-new-app-for-reflecting-on-everyday-moments)

**Daylio (tap-based micro-diary)**
- Each day is color-coded by mood into a "Year in Pixels" mosaic, an idea borrowed from Bullet Journal practice. There are also monthly mood line graphs and an average-mood-by-weekday chart. [2ND] — [Wikipedia](https://en.wikipedia.org/wiki/Daylio); [daylio.net](https://daylio.net/)
- "Stats, charts, and correlations": premium analysis shows which activities co-occur with which moods. [VENDOR/ANEC] — [daylio.net](https://daylio.net/); [Headway review](https://makeheadway.com/blog/daylio-review/); [IntuitionLabs](https://intuitionlabs.ai/software/telepsychiatry-digital-mental-health/mood-tracking-and-journaling/daylio)
- No account; data stays on the device, with optional backup to the user's own iCloud or Google Drive. The APA app evaluation confirms offline use but notes that exported files are not encrypted. [VENDOR + independent evaluation] — [Daylio privacy policy](https://daylio.net/privacy-policy); [APA app evaluation](https://psychiatry.org/psychiatrists/practice/mental-health-apps/evaluations/daylio-evaluation)
- About 1M+ users and a 4.7/5 rating from about 423k reviews, per a third-party listing (not official). [2ND] — [IntuitionLabs](https://intuitionlabs.ai/software/telepsychiatry-digital-mental-health/mood-tracking-and-journaling/daylio)

**Bearable (symptom and mood correlation tracker)**
- "30+ Reports", including correlations and weekly trends. A free Comparison Graph compares factors against mood, symptoms, sleep and energy. The developer advises logging at least one core metric daily so correlations are accurate. [VENDOR] — [bearable.app](https://bearable.app/); [App Store](https://apps.apple.com/app/bearable/id1482581097)
- No independent validation of its correlation statistics was found. [gap noted by search] — [bearable.app](https://bearable.app/)

**Reflectly**: AI-flavoured diary with personalized questions, daily challenges and quotes, mood graphs and correlations. The vendor says it is based on positive psychology, mindfulness and CBT. [VENDOR/ANEC] — [TechRadar review](https://www.techradar.com/reviews/reflectly); [App Store](https://apps.apple.com/app/id1241229134)

**Mindsera**: "mental fitness" journal with 50+ thinking frameworks as templates (First Principles, Anti-Goals). AI comments while you type through lenses such as "Thinking Traps", "Alternative Perspectives" and "Stoic Principles". Emotion analysis uses Plutchik's wheel, and there are AI "mentors" (Socrates and others). One directory flags possible review manipulation. [VENDOR/ANEC] — [Mindsera help: frameworks](https://help.mindsera.com/frameworks); [Stork.ai](https://www.stork.ai/en/mindsera); [MyLifeNote review (competitor)](https://blog.mylifenote.ai/mindsera-review/)

**Finch (self-care pet)**: a virtual bird grows as the user completes self-care goals. Rewards ("rainbow stones") buy clothes and furniture, alongside mood tracking, bullet journaling, breathing and quizzes. No peer-reviewed outcome studies were found. [VENDOR/ANEC] — [Internet Matters](https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/); [App Store](https://apps.apple.com/app/id1528595748); [Headway review](https://makeheadway.com/blog/finch-app-review/)

**Jour**: daily prompts plus themed "guided journeys" (self-affirmations, dreams, future goals, positivity). [2ND] — [Common Sense Media](https://www.commonsensemedia.org/app-reviews/jour-guided-journaling)

**Clearful**: prompt and template library, a "Rediscover" feature for past entries, and end-to-end encryption with Face ID. [VENDOR] — [App Store](https://apps.apple.com/us/app/-/id1513257639)

**Gratitude: Self-Care Journal**: gratitude journal with reminders and streaks, affirmations (read, listen or record your own), a vision board, photo and voice entries; claims to be "completely private". [VENDOR] — [App Store](https://apps.apple.com/us/app/gratitude-self-care-journal/id1372575227)

**Headspace "Ebb" (Oct 2024)**: AI companion that uses motivational interviewing. It has two paths, reflecting on events (with content suggestions) and reflecting on gratitude. It "does not provide mental health advice, guidance or diagnoses", shares a crisis hotline if a user seems at risk, and launched US consumer-only. [VENDOR + press, 2024] — [Headspace help](https://help.headspace.com/hc/en-us/articles/29918704767131-What-is-Ebb); [BusinessWire](https://www.businesswire.com/news/home/20241010397470/en/Mental-Health-Company-Headspace-Launches-Empathetic-AI-Companion); [MedCity News](https://medcitynews.com/2024/10/headspace-ai-mental-health/); [Figma blog on Ebb design](https://www.figma.com/blog/headspace-ebb-ai-companion/)

### Inferences
- **Mood input:** Producti-me's single mood slider plus emotion chips is a weaker version of the Mood Meter. A 2-axis picker (pleasantness x energy) that then narrows to 8–12 rioplatense words per quadrant would cost the same 5 seconds and give far richer data. Anger should be split into a family of words (irritado, frustrado, resentido, humillado, celoso, impotente). The existing "stress" and "anger" sliders could become derived values or optional detail.
- **Morning and evening check-ins:** the Stoic pattern (evening reflection reads back the morning intention) maps directly onto Producti-me's check-ins. The evening could ask "¿Cumpliste lo que te propusiste a la mañana?" and suggest the "victoria del día" from it.
- **Memories (7/30/90/365):** Producti-me already has the Day One / Clearful pattern. The gap is curation: let the user dismiss or "hide" painful memories, and prefer surfacing entries where they handled something well (see the rumination risk in Section 2).
- **Patterns:** a Daylio-style year/month pixel grid plus simple co-occurrence stats (mood on days with "vi amigos" vs not, days with training vs not) is cheap to build, local-first, and directly serves the social goal. Present correlations as hypotheses, not facts (see Section 4).
- **Friends:** How We Feel's no-feed "share how I feel with a trusted friend" is a low-pressure model if Producti-me ever adds sharing (for example, a "mandale cómo estás a X" shortcut).

### Gaps
- Calm's journaling and check-in feature: no results found; not documented here.
- How We Feel's full word list, tag taxonomy and "Patterns" screens could not be verified (site fetch failed).
- Rosebud's current pricing, model provider and exact feature tiers: sources conflict (one says GPT-3, another GPT-4o) and are likely outdated.
- No usage or retention data published by any of these apps was found.

---

## 2. What the research says: expressive writing, gratitude, affect labeling and granularity, best possible self, CBT thought records, anger, loneliness and social connection

### Takeaway
Most journaling techniques have **small but real** average effects. The strongest-supported, cheapest wins for this user are:
- naming emotions precisely (affect labeling and granularity)
- calming arousal (breathing, timeout) before or instead of writing when angry, rather than venting
- self-distanced reflection (writing about yourself from the outside)
- best-possible-self writing for optimism
- small, frequent quality contact with friends, plus correcting the belief that reaching out is unwelcome

Classic expressive writing helps on average (r ≈ .075, small) but **can backfire for high ruminators**, which matters for an "anti-bucle" feature. Gratitude journaling improves well-being slightly but is **not** an effective treatment for depression or anxiety, and doing it too often may blunt it.

### Cited Findings

**Expressive writing (Pennebaker paradigm)**
- Frattaroli (2006), 146 randomized studies: average random-effects **r = .075**, positive and significant but small. [META, classic] — [Frattaroli 2006 PDF](https://Www.Gwern.net/doc/psychology/2006-frattaroli.pdf)
- Adolescents (Travagin et al., 2015), 21 studies: **g = 0.127** (small). [META] — [OJP abstract](https://www.ojp.gov/library/publications/how-effective-are-expressive-writing-interventions-adolescents-meta-analytic)
- Asian populations (2023): **g = 0.05**, no significant difference at first follow-up. [META, 2023] — [Cognitive Therapy and Research, 2023](https://link.springer.com/article/10.1007/s10608-023-10417-1)
- PTSD (Pavlacic et al., 2019): small effect on posttraumatic stress overall; medium-to-large in studies requiring a PTSD diagnosis; negligible-to-small for growth and quality of life. [META] — [Missouri State repository](https://bearworks.missouristate.edu/articles-chhs/427)
- Reinhold et al. (2018), on depression, is cited by later reviews as finding no improvement in psychological outcomes (primary not read). [2ND] — [Frontiers/PMC review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9611203)
- A 2023 meta-analysis (Guo, Br J Clin Psychol) on depression, anxiety and stress reportedly concludes that efficacy "has not been firmly established". [2ND] — [Simply Psychology summary](https://www.simplypsychology.org/news/expressive-writing-for-anxiety)
- **Backfire risk.** Sbarra et al. (2013, Clinical Psychological Science, about 90 recently separated adults): high ruminators did *worse* after standard expressive writing. At 8 months, high ruminators reported the *least* distress in the control condition. The mechanism proposed: asking ruminators to revisit their darkest thoughts intensifies distress. A follow-up (Bourassa et al., 2017, N = 109) found "iatrogenic effects" of expressive writing among high ruminators. [RCT] — [U. Arizona news](https://news.arizona.edu/news/post-divorce-journaling-may-hinder-healing-some-ua-study-finds); [Arizona experts page](https://experts.arizona.edu/en/publications/expressive-writing-can-impede-emotional-recovery-following-marita/)
- **What seems to help within writing:** in Pennebaker's LIWC analyses, rising use of causal words ("because", "reason") and insight words ("realize", "understand") across sessions went with better health. However, the word-count link failed to replicate in a sexual-assault survivor sample (N = 71), where global narrative organization predicted reduced traumatic stress instead. [EXP, mixed] — [Penn State open textbook ch.14](https://psu.pb.unizin.org/psych425/chapter/expressive-writing-one-type-of-confrontation/); [Kearns 2009 dissertation, UGA](https://openscholar.uga.edu/record/9168/files/kearns_megan_c_200905_phd.pdf)

**Gratitude journaling**
- Cregg & Cheavens (2021, J Happiness Studies; 27 studies, N = 3,675): effect on depression and anxiety at post-test **g ≈ −0.29**. Against active comparison activities the difference was "small", and Cheavens said it "would not be something you would recommend as a treatment". Gratitude interventions *have* been shown to improve relationships. [META] — [Ohio State news](https://news.osu.edu/gratitude-interventions-dont-help-with-depression-anxiety/); [RePEc record](https://ideas.repec.org/a/spr/jhappi/v22y2021i1d10.1007_s10902-020-00236-6.html)
- A 2023 meta-analysis of 25 RCTs found psychological well-being improved versus neutral comparisons with **g = 0.22**. Intervention length and duration did not moderate the effect. [META, 2023] — [Int J Applied Positive Psychology](https://link.springer.com/10.1007/s41042-023-00086-6)
- **Frequency:** Lyubomirsky et al. (2005) found that counting blessings **once a week** improved well-being, while **three times a week** showed no benefit or slight decreases, plausibly because the practice became a chore. This is a single study and is often over-generalized. [EXP, classic; 2ND] — [Time (2007) summary](https://content.time.com/time/specials/2007/article/0,28804,1631176_1630611_1630512,00.html); [youngju.dev summary](https://www.youngju.dev/blog/psych-papers/gratitude-journal-science.en)
- Expressing gratitude to others: people underestimate the positive impact of their letters of appreciation (Kumar & Epley, 2018). [EXP] — [UChicago News](https://news.uchicago.edu/story/people-underestimate-value-sending-letters-appreciation)

**Affect labeling and emotion granularity (differentiation)**
- Lieberman et al. (2007, Psych Science, fMRI): labeling the emotion in negative images reduced amygdala response compared with other encoding. Right ventrolateral prefrontal cortex (RVLPFC) activity was inversely correlated with the amygdala, mediated by medial prefrontal cortex (MPFC). [EXP, classic] — [Lieberman 2007 PDF](https://sites.lifesci.ucla.edu/psych-sanlab/wp-content/uploads/sites/31/2016/03/Lieberman_2007_PsychScience.pdf)
- Torre & Lieberman (2018, Emotion Review): affect labeling works as *implicit* emotion regulation. Its effects on experience, autonomic, neural and behavioral measures resemble reappraisal, though it does not *feel* like regulating. [REVIEW] — [SAGE](https://journals.sagepub.com/doi/10.1177/1754073917742706)
- A 2026 systematic review calls affect labeling a *conditional* strategy whose effects vary by individual and context. [REVIEW, 2026] — [Korean J Health Psychology](https://www.accesson.kr/healthpsy/v.31/4/1147/59715)
- Kircanski, Lieberman & Craske (2012), spider-fearful participants (4 groups × 22): labeling during exposure produced lower skin-conductance response at 1 week than reappraisal, distraction or exposure alone, but no difference in self-reported fear. More use of fear words during exposure predicted larger fear reductions. [RCT, modest] — [PubMed](https://pubmed.ncbi.nlm.nih.gov/22902568/)
- Kashdan, Barrett & McKnight (2015): people who differentiate negative emotions finely regulate better. Low differentiation is linked to depression, anxiety, borderline personality disorder and others, and "labeled emotions… become easier to regulate". [REVIEW] — [Kashdan et al. 2015 PDF](https://www.affective-science.org/pubs/2015/kashdan-et-all-unpacking-emotion-differentiation-2015.pdf); [youth review, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8377228/)
- **Granularity is trainable through repeated labeling.** Widdershoven et al. (2019), 55 depressed patients using experience sampling for 6 weeks (3 days/week, 10×/day), improved negative-emotion differentiation. Hoemann, Barrett & Quigley (2021) replicated this in healthy adults: gains scaled with the number of prompts answered per day. Persistence and links to symptom change remain open questions. [EXP] — [Maastricht CRIS](https://cris.maastrichtuniversity.nl/en/publications/effect-of-self-monitoring-through-experience-sampling-on-emotion-/); [Frontiers 2021](https://www.frontiersin.org/articles/10.3389/fpsyg.2021.704125/full)

**Best Possible Self (BPS)**
- Carrillo et al. (2019, PLoS ONE; 29 studies, N = 2,909): versus controls, optimism d+ = .334, well-being d+ = .325 and positive affect d+ = .511, with small effects on negative affect and depression. Compared with gratitude interventions, BPS gave larger gains in positive affect (d+ = .326) and negative affect (d+ = .485). There was a trend toward better effects with *shorter* total practice time. [META] — [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6756746/)

**CBT thought records**
- No meta-analysis of *self-help* daily thought records as a standalone was found. One review collected **110 non-identical thought record forms (55 unique combinations)** and warned that they are treated as interchangeable when they may have different effects. [REVIEW] — [Bentham Science](https://benthamscience.com/article/96037)
- A therapist-delivered variant, the trial-based thought record, reduced belief in negative core beliefs in clinical samples. These are clinical, not self-help, settings. [EXP] — [Revista USP](https://revistas.usp.br/acp/en/article/view/116255); [CNS Spectrums](https://cambridge.org/core/journals/cns-spectrums/article/abs/trialbased-psychotherapy-and-the-efficacy-of-trialbased-thought-record-in-changing-unhelpful-core-beliefs-and-reducing-selfcriticism/BCF8C1602F3CEA8AF05BDF4C1D179C9F)

**Anger**
- Kjærvik & Bushman (2024, Clinical Psychology Review; 154 studies, N = 10,189): **arousal-decreasing** activities reduce anger in lab and field. These include slow breathing (diaphragmatic), progressive muscle relaxation, mindfulness, slow yoga and taking a timeout. **Arousal-increasing** activities overall had no effect, and some (notably jogging) made anger worse. Venting "feels good" but does not help and may reinforce aggression. [META, 2024] — [Ohio State news](https://news.osu.edu/breathe-dont-vent-turning-down-the-heat-is-key-to-managing-anger/); [PsyPost](https://www.psypost.org/effective-anger-reduction-techniques-revealed-in-comprehensive-review-of-154-studies)
- **Self-distancing** (Mischkowski, Kross & Bushman, 2012, J Exp Soc Psych): reflecting on a provocation from a "fly on the wall" perspective lowered aggressive thoughts and anger. In study 2 (N = 95), distanced participants gave shorter, less intense noise blasts after provocation. Distraction helps only temporarily, because "the anger will return". [EXP; 2ND for details] — [Ohio State news](https://news.osu.edu/self-distancing-can-help-people-calm-aggressive-reactions-study-finds---ohio-state-research-and-innovation-communications/); [ScienceDaily](https://www.sciencedaily.com/releases/2012/07/120702153216.htm)
- Psychological treatment of anger (2009 meta-analysis): overall weighted SMD **0.76** (95% CI 0.67–0.85); CBT subgroup **0.60**, multicomponent **0.93**. More sessions, manuals and fidelity checks explained part of the variability. [META] — [PubMed 20018996](https://pubmed.ncbi.nlm.nih.gov/20018996/); [JAAPL table](https://jaapl.org/content/37/4/473/tab-figures-data)
- DiGiuseppe & Tafrate (57 adult studies): overall effect ≈ .71. [META; 2ND] — [CCSU document](https://www.ccsu.edu/sites/default/files/document/Comprehensive_model.pdf)

**Loneliness and social connection**
- Holt-Lunstad et al. (2015, Perspectives on Psychological Science; about 70 studies, >3M participants): odds of mortality were higher for social isolation (OR 1.29), loneliness (OR 1.26) and living alone (OR 1.32), with no difference between objective and subjective isolation. **Effects were stronger in samples averaging under 65.** [META] — [BYU ScholarsArchive](https://scholarsarchive.byu.edu/facpub/7516)
- The earlier Holt-Lunstad meta-analysis (148 studies, >300k participants) found greater social connection associated with about 50% lower risk of early death. [META; 2ND] — [Neuroscience News (APA 2017 release)](https://neurosciencenews.com/social-isolation-epidemiology-7252/amp/)
- Masi et al. (2011): of four strategies (social skills, social support, opportunities for contact, **maladaptive social cognition**), the most successful in randomized studies were those targeting maladaptive social cognition. Randomized studies overall showed small effects, smaller than pre-post designs. [META] — [Masi et al. 2011 PDF](https://louisville.edu/envirome/healthyairwaterandsoil/ubn2/selected-literature/Masi%20et%20al.%202011%20A%20Meta-Analysis%20of%20Interventions%20to%20Reduce%20Loneliness.pdf)
- Eccles & Qualter (2020/2021; 39 studies, ages ≤25): youth loneliness can be reduced by intervention. Interventions rarely targeted youth who actually reported loneliness, and the trial evidence does not settle which approach works best. [META] — [UCLan repository](https://knowledge.lancashire.ac.uk/id/eprint/32607/); [Brunel paper](https://bura.brunel.ac.uk/bitstream/2438/33558/4/FullText.pdf)
- **Hours build friendship** (Hall, 2018, J Social & Personal Relationships): about 40–60 hours to reach casual friend, 80–100 hours to friend, and >200 hours to close friend. Time spent at work or school did not predict closeness the same way. Study 1 involved adults who had moved recently, Study 2 college freshmen. [OBS] — [Greater Good](https://greatergood.berkeley.edu/article/item/how_long_does_it_take_to_make_a_friend); [AAU summary](https://www.aau.edu/node/17476)
- **One quality conversation a day** (Hall et al., 2023, Communication Research; >900 students, 5 campuses): participants assigned to *any one* of seven behaviors with a friend had better end-of-day well-being, connection, stress and loneliness. The seven were catching up, meaningful talk, joking around, showing care, listening, valuing their opinions and sincere compliments. "Once is enough, but more is better." [EXP; 2ND] — [KU News](https://news.ku.edu/news/article/2023/02/01/just-one-quality-conversation-friend-boosts-daily-well-being-0)
- **Reaching out is appreciated more than we think** (Liu, Rim, Min & Min, 2023, JPSP; 13 preregistered experiments, about 6,000 participants): initiators underestimated recipients' appreciation for brief messages or small gifts. This held for weak and strong ties, and the gap was larger when the contact was more surprising or the ties were more distant. [EXP] — [PubMed 35816566](https://pubmed.ncbi.nlm.nih.gov/35816566/); [PsyPost](https://www.psypost.org/study-identifies-a-robust-tendency-to-underestimate-how-much-others-appreciate-being-reached-out-to)

### Inferences
- **Anger module (highest value for this user):**
  1. "Primero bajá la temperatura": a 60–120 s guided slow-breathing or timeout step *before* any anger journaling.
  2. Granular labeling ("¿enojo de qué tipo?").
  3. A self-distanced prompt in third person ("¿Qué le pasa a [nombre]? ¿Qué vería un amigo mirando desde afuera?").
  4. Then a forward step ("¿Qué querés hacer con esto?").
  Avoid "descargá todo" venting prompts. For a rugby player, note that hard exercise is *not* a reliable anger reducer per Kjærvik & Bushman: sport has other benefits, but anger relief should come from calming activities.
- **Anti-bucle:** deep and expressive modes should (a) time-box sessions to about 15–20 min; (b) detect repetition, i.e. the same topic or tags across N entries or a high-anger plus same-person pattern, and switch the user to self-distancing, a cognitive reframe, BPS or a concrete action plan instead of "write more about it"; (c) end with a meaning or causal prompt ("¿Qué entendés ahora que antes no?", "¿Por qué creés que…?"). This is directly motivated by Sbarra 2013 and Bourassa 2017.
- **Gratitude:** keep it light and weekly rather than a daily obligation (Lyubomirsky). Bias it toward *people* ("¿A quién le agradecés esta semana?"), because the relational benefits are better supported than the mood benefits. Add a one-tap "mandale un mensaje" to turn private gratitude into outreach (Kumar & Epley; Liu et al.).
- **Future question bank:** add the classic BPS exercise ("Imaginá tu vida en 1–5 años si todo sale bien…"), about 10–15 min, used occasionally rather than daily. It has better evidence than gratitude for positive affect and optimism.
- **Friendship section:** frame the weekly goal around *quality conversations*, with Hall's seven behaviors as quick chips when logging a contact, and optionally *hours* with the group. Add reframes for maladaptive social beliefs ("no me quieren ahí", "se olvidaron de mí"), which Masi found to be the most effective lever, paired with the Liu finding ("lo van a valorar más de lo que pensás").
- **Thought records:** use a short 3–4 column version (situation → automatic thought → evidence/alternative → new feeling rating) rather than long clinical forms. Evidence for self-help use specifically is thin, so present it as a tool, not therapy.

### Gaps
- Exact effect sizes for Reinhold 2018, Guo 2023 and Dickens 2017 gratitude were not retrieved, so only secondary descriptions are given.
- No meta-analysis of self-guided daily thought records was found.
- Lee & DiGiuseppe (2018) anger meta-analysis was not found.
- No RCT evidence was found for "scheduled social contact reminders" specifically, as opposed to quality conversations or reaching out.
- Hall (2018) hour thresholds differ across press reports (some cite 94/164/219 hours for the first study alone).

---

## 3. AI in journaling: what users value, privacy concerns, keeping it non-clinical and safe (with Argentina crisis resources)

### Takeaway
Users and HCI studies value AI that **asks adaptive follow-up questions while letting the user steer**, and that **summarizes patterns over time**. The main risks are privacy and data use (the mental-health app category has a poor record, and Rosebud's own claims conflict with a 2026 audit), plus crisis handling. Current norms are the APA's Nov 2025 advisory and Illinois' Aug 2025 law: AI wellness tools must not act as therapy, diagnose or claim to detect mental states, and must route people in crisis to human help. For Argentina the core crisis numbers are 135 (CABA and Gran Buenos Aires), 0800-345-1435 and (011) 5275-1135 nationally (CAS), 0800-999-0091 (national 24/7 mental health urgency line) and 911.

### Cited Findings

**What users value**
- ExploreSelf (CHI 2025, N = 19): an LLM-driven reflection tool that generates questions dynamically. Users valued *controlling their own reflective path*, and flexible adaptive guidance led to deeper engagement and insight. [HCI] — [arXiv 2409.09662](https://arxiv.org/abs/2409.09662)
- MindfulDiary (CHI 2024; 28 patients with MDD plus 5 psychiatrists, 4 weeks): conversational LLM journaling with a state-based design that follows clinical guidelines. Patients kept richer daily records, and psychiatrists understood their patients' daily lives better. [HCI] — [arXiv 2310.05231](https://arxiv.org/html/2310.05231v2)
- MindScape (CHI EA 2024): LLM prompts informed by behavioral sensing, delivered as brief check-ins 4×/day rather than long-form journaling. [HCI] — [arXiv 2404.00487](https://export.arxiv.org/pdf/2404.00487)
- MoodScape thesis (10 participants, 2-week crossover) used a **locally hosted** LLM so mood data never reached cloud providers. It supported data exploration and some self-reflection, but no deeper behavior change within 2 weeks. [HCI, small] — [TU Dortmund](https://eldorado.tu-dortmund.de/items/d9b34550-99d5-4a4a-8135-fb6a08f7fe78)
- Rosebud's pitch is follow-ups ("Go Deeper"), weekly pattern reports and long-term memory (see Section 1). [VENDOR/ANEC] — [macaron.im](https://macaron.im/blog/rosebud-ai-journaling-app-review-2026)

**Privacy concerns**
- Mozilla *Privacy Not Included* (2022) called mental health apps worse than any category it had reviewed in six years. The 2023 follow-up found 19 of 32 apps still carried warnings, and about one-third had improved. [OBS audit] — [Mozilla Foundation 2023](https://www.mozillafoundation.org/en/blog/shady-mental-health-apps-inch-toward-privacy-and-security-improvements-but-many-still-siphon-personal-data/); [TechRepublic 2022](https://www.techrepublic.com/article/mozilla-privacy-survey-finds-mental-health-and-prayer-apps-fail-privacy-test-pretty-spectacularly/)
- Rosebud says entries are encrypted, never sold and **never used to train AI**, with zero-data-retention agreements with OpenAI and Anthropic. [VENDOR + press] — [AIM Media House](https://aimmediahouse.com/ai-startups/with-6m-seed-rosebud-helps-users-self-reflect)
- **Contradiction:** a 2026 arXiv privacy analysis states that Rosebud's policy mentions using user content for training, and that resulting datasets or models "may be commercialised, or sold". The authors could not verify actual sharing. [audit, 2026] — [arXiv 2605.02016](https://arxiv.org/pdf/2605.02016)
- Even with zero retention and PII removal, people remain hesitant to share LLM chat data because of perceived privacy and judgment risks. [HCI, 2026] — [arXiv 2602.18415](https://www.arxiv.org/pdf/2602.18415)
- Local-first designs are positioned as a privacy feature by Daylio (no account), How We Feel (on-device unless opt-in) and Apple Journal (on-device suggestions, E2E iCloud). [VENDOR] — [Daylio privacy](https://daylio.net/privacy-policy); [marcbrackett.com](https://marcbrackett.com/how-we-feel-app-3/); [Apple Newsroom](https://apple.com/au/newsroom/2023/12/apple-launches-journal-app-a-new-app-for-reflecting-on-everyday-moments)

**Non-clinical framing and safety norms**
- APA Health Advisory (Nov 2025): do not use chatbots or wellness apps as a substitute for a qualified professional. Their ability to guide someone in crisis is "limited and unpredictable". Most are not designed for clinical feedback, lack validation, "often do not include adequate safety protocols", and the burden should not fall solely on users. [GUIDELINE, 2025] — [APA press release](https://www.apa.org/news/press/releases/2025/11/ai-wellness-apps-mental-health); [APA Monitor 2026](https://www.apa.org/monitor/2026/03/ai-advisory-training-funding)
- Illinois HB 1806 (Aug 2025) bars AI from independent therapeutic decisions, direct therapeutic interaction or treatment plans without clinician review. It also bars AI from "detecting emotions or mental states" in therapy. Fines reach up to $10k, with exceptions for peer support and publicly available self-help. Nevada passed a related law in June 2025. [LAW] — [Data Privacy + Security Insider](https://www.dataprivacyandsecurityinsider.com/2025/08/illinois-enacts-act-prohibiting-ai-therapy/); [Healthcare Finance News](https://www.healthcarefinancenews.com/news/illinois-bans-therapeutic-use-ai-without-clinician-input)
- Headspace Ebb is the industry pattern: motivational interviewing, "does not provide mental health advice, guidance or diagnoses", and shares a crisis line when a user seems at risk. [VENDOR] — [Headspace help](https://help.headspace.com/hc/en-us/articles/29918704767131-What-is-Ebb)
- Rosebud describes itself as "a self-help journaling tool… not replace therapy", lists crisis lines, and says it is working to improve how it handles suicidal ideation. [VENDOR + press] — [AIM Media House](https://aimmediahouse.com/ai-startups/with-6m-seed-rosebud-helps-users-self-reflect)

**Argentina crisis resources (verify before shipping; official sites could not be fetched)**
- **0800-999-0091:** Línea Nacional de Orientación y Apoyo en la Urgencia de Salud Mental. Confidential, "funciona las 24 horas, los 365 días del año". Psychologists can give phone guidance, make an assisted referral, activate emergency services or coordinate with local services. It does not replace a guardia or emergency service. [OFFICIAL, via search extract] — [argentina.gob.ar (Dispositivo 0800)](https://www.argentina.gob.ar/node/356435); [La Voz de San Justo](https://www.lavozdesanjusto.com.ar/salud-mental-una-linea-nacional-puede-activar-emergencias-ante-casos-de-riesgo-suicida)
- **135:** free suicide prevention line from CABA and Gran Buenos Aires (Centro de Asistencia al Suicida, CAS, volunteer-run). From the rest of the country: **(011) 5275-1135** or **0800-345-1435**. Reported hours vary (one directory says 18 h/day). [DIRECTORY] — [Find A Helpline](https://findahelpline.com/organizations/linea-de-prevencion-del-suicidio-buenos-aires); [Idealist (CAS)](https://www.idealist.org/en/nonprofit/22630c0b679841889b8903581799d4db-centro-de-asistencia-al-suicida-de-buenos-aires-buenos-aires); [Derecho en Zapatillas](https://www.derechoenzapatillas.com/?p=31374)
- **0800-222-5462 (Provincia de Buenos Aires):** a recent article ties it to a new provincial suicide-prevention plan, but an older PDF lists it as the PBA alcohol and substance line. Its function is **unclear; verify**. [conflicting] — [MinutoUno](https://www.minutouno.com/politica/axel-kicillof-lanzo-un-plan-provincial-la-prevencion-suicidios-n6320139); [OIST Argentina PDF](https://groups.oist.jp/system/files/Argentina.pdf)
- **911** for immediate danger. [DIRECTORY] — [Unidiversidad (CAS Mendoza)](https://www.unidiversidad.com.ar/cas-mendoza-brinda-contencion-a-personas-con-o-sin-ideacion-suicida)
- Context: reports describe rising suicide deaths in Argentina (more than 5,200 in 2025). This is press coverage, not verified against official statistics. [2ND] — [Escudo Digital](https://www.escudodigital.com/internacional/latinoamerica/aumentan-los-suicidios-en-argentina-mas-de-5200-muertes-en-2025.html)

### Inferences
- **Coach behaviour:** the AI coach should mostly *ask*, not tell. One or two adaptive follow-ups per entry ("Go deeper"), always skippable, with the user choosing the direction (ExploreSelf). Weekly digests should describe patterns in the user's own words ("esta semana mencionaste a X 4 veces; los días con entrenamiento tu energía fue más alta") and never use diagnostic labels.
- **Permission model:** the existing "read the last 3 entries if permitted" is good practice. Add per-entry "no compartir con el coach", a visible log of what was sent, and use of an API provider with zero-retention or no-training terms. Keep everything else local (the PWA's localStorage/IndexedDB), in line with Daylio and How We Feel.
- **Safety layer (non-AI, deterministic):** keyword and phrase detection in Spanish (e.g., "matarme", "no quiero vivir", "terminar con todo", "hacerme daño") in journal text *and* coach chat. It should show a calm, non-alarmist card with 135 / 0800-345-1435 / 0800-999-0091 / 911, and the coach should switch to a supportive "please contact a person now" script instead of continuing coaching. A permanent "¿Necesitás ayuda ahora?" link should sit in settings and the coach screen.
- **Copy:** use "coach", "acompañante" or "espejo", not "terapeuta". Include a disclaimer that it is not a mental health service, plus a suggestion to see a professional if anger or low mood persists. Avoid claiming the AI "detects" emotions; it "reflects back what you wrote" (Illinois-style norms, APA advisory).

### Gaps
- Official confirmation of current hours for 135 and CAS, and the current role of 0800-222-5462 (argentina.gob.ar and other official pages could not be fetched).
- No Argentina-specific youth or student line was verified (e.g., university counseling services, the "Hablemos de todo" program).
- No large-sample survey quantifying which AI journaling features users value most (only small HCI studies and vendor claims).
- DiaryMate (CHI 2024, on AI and the writer's "own voice") could not be found.

---

## 4. What drives retention vs abandonment in journaling and mood apps (streaks, blank page, prompts)

### Takeaway
Abandonment is the norm: median 30-day retention of mental-health apps is about 3%. Lapsing is a normal phase of self-tracking, not a failure. Streaks help while intact, but **a broken streak lowers later engagement**, especially when users blame themselves, and "recover your streak" messages tend to backfire. Repairable streaks or new goals work better. Blank-page paralysis and friction are the most cited reasons people quit journaling, and specific prompts plus tap-only micro-entries are the common fix (evidence for this is mostly anecdotal).

### Cited Findings
- Baumel et al. (2019, JMIR; panel usage data on Google Play mental-health apps): **median 15-day retention 3.9%, 30-day 3.3%**. Tracker apps reached 6.1% at day 30, mindfulness 4.7% and breathing apps 0%. Retention is routinely lower than in trials. [OBS] — [JMIR 2019](https://www.jmir.org/2019/9/E14567/); [Mental Elf](https://www.nationalelfservice.net/mental-health/digital-mental-health-tool-ignore-trial-read-analytics/)
- Silverman & Barasch (2023, J Consumer Research; 7 studies): highlighting an *intact* streak increases later engagement more than highlighting a *broken* one, regardless of actual past behavior. The effect is stronger when people blame themselves for the break and weaker when the streak can be "repaired". Barasch says recovery messages "typically backfire", and suggests offering a new goal or changing the goal period instead. [EXP] — [CU Boulder Leeds news](https://www.colorado.edu/business/news/2023/04/20/research-streaks-marketing-tech-barasch); [UDSpace record](https://udspace.udel.edu/handle/19716/34160)
- Epstein et al. (2015, UbiComp; 10-year impact award): the "lived informatics" model treats **lapsing and resuming** as normal stages of tracking. The follow-up paper (CHI 2016; 193 surveyed, 12 interviewed) identified six reasons people stop tracking and five perspectives on life after tracking. [OBS/HCI] — [Self Research library (2015)](https://library.selfresearch.org/research/a-lived-informatics-model-of-personal-informatics/); [Self Research library (2016)](https://library.selfresearch.org/research/beyond-abandonment-to-next-steps-understanding-and-designing-for-life-after-personal-informatics-tool-use/)
- Streak guilt: streaks "can quickly become a weight around your neck" and set up "an implicit system of reward and punishment". Breaking one "can make us feel like a failure". [ANEC] — [MacSparky 2023](https://www.macsparky.com/blog/2023/03/__trashed-15/); [Substack "Streaks yay or nay"](https://caitlinmccoll.substack.com/p/streaks-yay-or-nay)
- Blank page: a developer who "quit journaling 11 times" describes typing "Today was…", staring, feeling guilty and quitting. Answering a specific question was easier than generating from scratch. [ANEC] — [Indie Hackers](https://www.indiehackers.com/post/i-quit-journaling-11-times-before-building-an-app-to-fix-the-real-problem-heres-what-i-learned-Wr7UKnVgksuD5jthkwWX)
- Market response: apps advertise "no streaks" and low-effort entries ("one sentence counts"), and a tap-only journal maker argues people quit because it is "too much work", not because they lack motivation. [VENDOR/ANEC] — [Folio on Product Hunt](https://www.producthunt.com/p/folio-de11efc5-4f36-436e-90ea-133f06679bd0/folio-15); [Zero Log](https://hunted.space/product/zero-log)
- Gratitude done 3×/week may feel like a chore and lose benefit (Lyubomirsky 2005), which is relevant to over-prompting. [EXP; 2ND] — [Time summary](https://content.time.com/time/specials/2007/article/0,28804,1631176_1630611_1630512,00.html)
- Finch's gamification (pet plus rewards) is popular. One small, unverified diary study reportedly described early support turning into reward-driven habits. [ANEC/unverified] — [Headway Finch review](https://makeheadway.com/blog/finch-app-review/)
- Correlation features need daily data to work; Bearable explicitly asks users to log daily for accurate correlations. Individual tracker correlations are noisy, and studies of the link between tracked behavior and depression have been contradictory. [VENDOR + research note] — [bearable.app](https://bearable.app/); [JMIR mHealth 2018 (DOAJ)](https://doaj.org/article/e433140ff21d4202b7ba48d3d17aacdb)

### Inferences
- Replace daily streaks with **weekly targets** (e.g., "4 de 7 check-ins") and **repairable or forgiving streaks** (one free miss per week, or "nunca dos días seguidos"). Return after a gap with a neutral "¿Arrancamos de nuevo?", with no loss framing and no count of days missed.
- **Minimum viable entry:** a 10–20 s check-in (Mood Meter tap plus optional chip) must always count as "showing up". The full-screen serif journal is the optional deep layer.
- **Prompt first, blank page second:** open the journal with one rotating question from the relevant bank, chosen by context. Examples: high-anger check-in → the anger bank; no friend contact this week → the friendship bank; Sunday → a weekly review or BPS.
- Keep notification count low and tie notifications to the user's own rhythm (morning and evening). Avoid stacking gratitude, check-in and friend reminders on the same day.

### Gaps
- The six abandonment reasons from Epstein 2016 were not retrieved verbatim.
- No Reddit r/Journaling or r/selfimprovement threads surfaced in search, so user sentiment comes from blogs and makers.
- No published retention numbers for Day One, Daylio, Stoic or Rosebud.

---

## 5. Social-relationship features in personal apps (Dex, Monica, Clay): reminders, last-contact tracking, birthdays — evidence and design

### Takeaway
Personal CRMs converge on three primitives: **per-person contact cadence with "keep in touch" reminders**, **last-contact tracking with notes**, and **birthday and milestone alerts**. They differ mainly in automation (Dex syncs email, messages, LinkedIn and calendar) versus manual and private logging (Monica, open source). No research evaluates personal CRMs directly. The supporting evidence comes from social psychology: people underestimate how much outreach is appreciated, one quality conversation a day improves well-being, friendships need cumulative hours, and correcting maladaptive social cognition is the most effective loneliness lever.

### Cited Findings
- **Dex:** automated capture through LinkedIn, Gmail/Outlook, WhatsApp/iMessage and Google/Apple calendar sync, plus pre-meeting briefs and job-change alerts. About $12/month billed annually. [VENDOR, 2026] — [Dex blog: Dex vs Monica](https://getdex.com/blog/dex-vs-monica/); [Dex guide](https://getdex.com/guides/finding-the-right-personal-crm/)
- **Monica:** open-source, manual, privacy-focused. Per-contact reminder intervals (weekly, monthly, quarterly, yearly), with default notifications 30 days before, 7 days before and on the day. It has birthdays, contact notes, relationship mapping and a journal linked to contacts, but no calendar or LinkedIn import and no AI. Self-hosting is free; hosted is about $9/month. [VENDOR/ANEC; Dex-authored, so possibly biased] — [Dex: Monica review](https://next.getdex.com/blog/monica-review); [Dex vs Monica](https://getdex.com/blog/dex-vs-monica/)
- **Clay:** "Daily Highlights" for birthdays, milestones and follow-ups, from about $10/month. [2ND] — [folk.app personal CRM guide](https://folk.app/articles/personal-crm-guide)
- **Evidence for nudging outreach:** people robustly underestimate recipients' appreciation of brief, unexpected outreach, for weak and strong ties alike (13 preregistered experiments, about 6,000 participants). [EXP] — [PubMed 35816566](https://pubmed.ncbi.nlm.nih.gov/35816566/)
- **Evidence for daily micro-contact:** one quality conversation with a friend (any of 7 behaviors) improved same-day well-being and reduced loneliness and stress; more conversations helped more (>900 participants). [EXP; 2ND] — [KU News 2023](https://news.ku.edu/news/article/2023/02/01/just-one-quality-conversation-friend-boosts-daily-well-being-0)
- **Evidence for cumulative time:** about 50 h to casual friend, about 90 h to friend, >200 h to close friend; time in obligatory settings (work or school) counts less. [OBS] — [Greater Good](https://greatergood.berkeley.edu/article/item/how_long_does_it_take_to_make_a_friend)
- **Evidence for addressing beliefs:** interventions targeting maladaptive social cognition outperformed social skills, support or contact-opportunity interventions in randomized studies. [META] — [Masi et al. 2011](https://louisville.edu/envirome/healthyairwaterandsoil/ubn2/selected-literature/Masi%20et%20al.%202011%20A%20Meta-Analysis%20of%20Interventions%20to%20Reduce%20Loneliness.pdf)
- **Health stakes:** loneliness and isolation carry about 26–32% higher odds of mortality, and the effects are stronger in samples under 65. [META] — [Holt-Lunstad 2015](https://scholarsarchive.byu.edu/facpub/7516)
- **Gratitude helps relationships** even where it does not help symptoms. [META; 2ND] — [Ohio State news](https://news.osu.edu/gratitude-interventions-dont-help-with-depression-anxiety/)
- **Low-pressure sharing model:** How We Feel lets users share current feelings with trusted friends, with no feed, no likes and no history. [VENDOR/ANEC] — [Reysu review](https://reysu.beehiiv.com/p/howwefeel)

### Inferences
- **Per-friend cadence:** Producti-me's friends section should add a per-person cadence (e.g., "cada 1/2/4 semanas"), computed **days since last contact** and a gentle "hace 23 días que no hablás con Juan" list sorted by how overdue each person is, in the Monica model (manual and private, fitting a single-user PWA). Add birthdays with a 7-day plus same-day alert.
- **Nudge copy:** use evidence-based framing such as "Un mensaje corto se valora más de lo que creés" and "Una charla de calidad por día ya suma". Offer one-tap message starters (a WhatsApp deep link) matched to Hall's 7 behaviors: ponerse al día, charla profunda, joda o chiste, mostrar que te importa, escuchar, pedir opinión, cumplido sincero.
- **Logging meetups:** capture *type* (one of the 7 behaviors, or group activity such as training, tercer tiempo or asado), *approximate duration* (to accumulate Hall-style hours per person or group) and a post-contact mood. This enables a Daylio-style insight: "tu ánimo promedio es X en días con contacto social vs Y sin".
- **Weekly goal:** reframe the goal from "N meetups" to a mix of "N mensajes de iniciativa propia + N charlas de calidad + 1 plan grupal". Initiative is the behavior that best matches "volver a ser parte del grupo".
- **Link journal and friends:** when an entry contains belief patterns like "no me invitan", "sobro" or "no les importo", offer a short reframe card (a maladaptive social cognition target) and suggest one concrete outreach.
- **Avoid making friendship feel like a sales pipeline:** no scores per friend and no "relationship health" grades. Keep reminders opt-in per person.

### Gaps
- No empirical study evaluating personal-CRM apps or automated keep-in-touch reminders on loneliness or relationship quality was found.
- Comparative details of Dex, Monica and Clay come largely from Dex's own (competitor-authored) blog.
- No research found on optimal reminder cadence for friendships (only Dunbar-style folk heuristics, not verified here).
