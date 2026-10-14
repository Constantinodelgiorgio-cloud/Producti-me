# UX/UI excellence, retention mechanics and PWA capabilities (2025–2026) for Producti-me

Research date: 2026-10-14. Scope: design patterns from award-winning and reference apps, evidence on retention, iOS PWA notifications and capabilities, accessibility and performance basics, and why people abandon personal dashboards. Each finding gives its source date. Where I could only see a search snippet and not the primary page, I say so.

---

## 1. Design references: which concrete patterns make top productivity and health apps excellent?

### Takeaway
Award-winning apps from 2024–2026 have a few things in common. They show one main score or story per screen with the detail one layer deeper. They use few tabs (Oura went from 5 to 3, Gentler Streak from 4 to 3). Their tone is warm rather than punishing. Their colour systems are generated from a handful of variables (Linear uses LCH). They are deliberately minimal ("no login, no cloud syncing, nothing extraneous"). Several 2026 winners also tie the colour palette to time or state, which is close to Producti-me's per-section tones.

### Cited Findings
**Apple Design Awards (ADA) 2024 (announced June 2024)**
- **Bears Gratitude** won Delight and Fun. Apple's citation: "a simple way to encourage and embrace honest self-reflection… a welcoming way to establish daily gratitude practices. Thoughtfully crafted characters… help create a sense of warmth and routine." — [Apple Newsroom, ADA 2024](https://www.apple.com/newsroom/2024/06/apple-announces-winners-of-the-2024-apple-design-awards/)
- **Crouton** won Interaction. Apple's citation: "a clean interface for stashing away recipes, creating grocery lists, and presenting step-by-step instructions… With its effortless series of interactions, Crouton lets users keep their focus on the counter rather than the screen." — [Apple Newsroom, ADA 2024](https://www.apple.com/newsroom/2024/06/apple-announces-winners-of-the-2024-apple-design-awards/)
- **Gentler Streak** won Social Impact. Apple's citation: "optimistic and encouraging reminders that factor in both physical fitness and mental wellbeing… health data is smartly organized… In a Monthly Summary view, users are shown how they are doing in relation to their history, emphasizing the focus on individual progression rather than comparison against others." — [Apple Newsroom, ADA 2024](https://www.apple.com/newsroom/2024/06/apple-announces-winners-of-the-2024-apple-design-awards/)
- In ADA 2024 there were 14 winners across 7 categories, chosen from 42 finalists. — [Apple Newsroom, ADA 2024](https://www.apple.com/newsroom/2024/06/apple-announces-winners-of-the-2024-apple-design-awards/)

**ADA 2025 (announced June 2025)**
- There were 12 winners across six categories (Delight and Fun, Innovation, Interaction, Inclusivity, Social Impact, Visuals and Graphics), chosen from 36 finalists. — [Apple Newsroom, ADA 2025](https://www.apple.com/newsroom/2025/06/apple-unveils-winners-and-finalists-of-the-2025-apple-design-awards/)
- Apple defines Interaction as "intuitive interfaces and effortless controls that are perfectly tailored to their platform." The app winner was Taobao. The app finalists were **iA Writer** and **Mela – Recipe Manager**. — [Apple Newsroom, ADA 2025](https://www.apple.com/newsroom/2025/06/apple-unveils-winners-and-finalists-of-the-2025-apple-design-awards/)
- Other productivity and wellbeing finalists in 2025: **Opal** (screen-time) in Social Impact and **Train Fitness** in Inclusivity. The Delight and Fun app winner was **CapWords**, a language tool that turns photos into interactive stickers. — [Apple Newsroom, ADA 2025](https://www.apple.com/newsroom/2025/06/apple-unveils-winners-and-finalists-of-the-2025-apple-design-awards/)

**ADA 2026 (current page on developer.apple.com, June 2026)**
- **grug** won Delight and Fun (apps). It delivers one daily piece of wisdom, and its "scribbled design… is a little masterpiece of clever simplicity… there's no login, no cloud syncing, nothing extraneous." — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- **Structured**, a daily planner, was an Inclusivity finalist. Apple calls it "visually sharp and easy to scan" and says it "prioritizes downtime as much as productivity… helping you find time to take breaks." Neurodivergent users praise its "simple layout". It uses on-device Foundation Models to suggest and pre-fill tasks. — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- **The Outsiders: Athlete Tracker**, from the makers of Gentler Streak, was an Interaction finalist. It "strikes a smart balance between intensity and recovery" through a **Training Readiness Score**, described as "a beautiful data visualization that shows training load alongside metrics such as sleep quality and resting heart rate." — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- **Tide Guide** won Visuals and Graphics and was an Interaction finalist. Its "rich full-screen charts present a boatload of weather data… in a crisp, clear manner". It has "powerful widgets", and "the app's palette is even designed to match the color of the sky throughout the day." It also integrates Liquid Glass. — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- **Moonlitt** won Interaction (apps), cited for "simple elegance", "best-in-class Liquid Glass integration, and easy onboarding." — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- **Harvee** was a Social Impact finalist. It turns Apple Watch HRV, sleep and activity data into recovery guidance: "There's a lot of data involved, but it's all guided by a friendly little guy who sits at the center of the experience and serves as an avatar for a person's state." It runs on-device models for privacy. — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- **(Not Boring) Camera** was a Visuals finalist. It uses "giant buttons and haptic scroll wheels". Apple notes the same team's earlier Weather, Calculator and **Habits** apps, which "blew up a common idea and rebuilt it with big loud capital-V Vibes" while "ensur[ing] the products excel in all other areas too." **PowerWash Simulator** was a Delight finalist, praised for "specific haptic feedback for each hose nozzle." — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- **Primary: News in Depth** won Social Impact with "a properly minimal UI" that "gets out of the way." — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)

**Oura app redesign (Oct 2024, with further coverage Oct 2025)**
- Oura merged five tabs (Home, Readiness, Sleep, Activity, Resilience) into three: **Today**, **Vitals** and **My Health**. Today holds "need-to-know health insights throughout the day". Vitals is "a quick, holistic view… informed without being overwhelmed… explore deeper into each metric as you please". My Health covers long-term trends. — [Oura blog, 2024-10-03](https://ouraring.com/blog/new-oura-app-experience/)
- From the same post: "We wanted to make the Today tab like the 'Top Stories' page of a news app." Scores sit at the top. A "Daily highlight" changes "depending on the time of day (or night)", and Today's insights change "dynamically throughout the day, based on your unique health goals and metrics." — [Oura blog, 2024-10-03](https://ouraring.com/blog/new-oura-app-experience/)
- Oct 2025 coverage of the global rollout reports that the app gives users "One Big Thing" to focus on each day, and that "parts of the app will change color depending on biometrics… a new visual cue for users to quickly see how they're doing at a glance." — [9to5Google, 2025-10-20](https://9to5google.com/2025/10/20/oura-app-redesign/). *Date conflict:* Oura's own blog announced the 3-tab structure in Oct 2024. The 9to5Google piece describes the same structure as rolling out in Oct 2025. It may be a second iteration or a staged rollout; I could not resolve which.

**Gentler Streak (design philosophy)**
- In a 2022 interview, founder Katarina Lotrič said the world is "hungry for someone to tell you that it's OK to rest" and that rest is as important as activity. The **Activity Path** is a personal band that moves with recent effort, replacing a fixed daily target. — [9to5Mac, 2022-06-25](https://9to5mac.com/2022/06/25/gentler-streak-interview-watchos-9/) (search-snippet level)
- The App Store listing says users can keep their streak alive by following their body's needs, "even when it calls for rest days." — [App Store listing](https://apps.apple.com/il/app/id1576857102) (snippet)
- A later redesign cut the app from 4 tabs to 3, with the Streak page directly below the Activity Path. — [BGR](https://bgr.com/tech/gentler-streak-gets-a-major-redesign-focused-on-your-wellbeing/) (snippet; date not confirmed)

**Linear UI redesign (Mar 28, 2024)**
- Goals: "reduce visual noise, maintain visual alignment, and increase the hierarchy and density of navigation elements." The team says alignment work is "something that you'll feel after a few minutes of using the app." — [Linear, 2024-03-28](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Theme generation moved from HSL to **LCH**, which is perceptually uniform, so "a red and a yellow color with lightness 50 will appear roughly equally light". Instead of 98 hand-set variables per theme, each theme is now built from **three**: base colour, accent colour and contrast. The contrast variable "allows us to automatically include super high-contrast themes for users who need it." LCH also drives the elevation steps (background, foreground, panels, dialogs, modals). — [Linear, 2024-03-28](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Linear got a "more neutral and timeless appearance" by "limiting how much chrome (blue in our case) was used" in the colour calculations. They made text and neutral icons lighter in dark mode, and use Inter Display for headings with Inter for body text. — [Linear, 2024-03-28](https://linear.app/now/how-we-redesigned-the-linear-ui)

**Apple HIG: dark mode craft**
- Dark palettes use "dimmer background colors and brighter foreground colors", which are "not necessarily inversions". **Base** backgrounds are dimmer and **elevated** backgrounds are brighter, so that foreground layers such as sheets and popovers "appear to advance." — [Apple HIG, Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- Contrast should be "no lower than 4.5:1… For custom foreground and background colors, strive for a contrast ratio of 7:1, especially in small text." Test with Increase Contrast and Reduce Transparency on. — [Apple HIG, Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- HIG says to avoid app-specific appearance settings, but "in rare cases, consider using only a dark appearance", for example Stocks. — [Apple HIG, Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)

### Inferences
- **Hoy should work like Oura's "Top Stories" page.** That means one hero element at the top: the day's "One Big Thing", such as a readiness-style composite or the single next action. Below it, a short feed that changes with the time of day (morning plan, midday check, evening review). The per-area detail stays in Áreas, which plays the role of Oura's Vitals. Revisión semanal plays the role of My Health (long-term trends).
- Producti-me's per-section colour tones fit 2026 award patterns: Tide Guide matches the sky through the day, and Oura colours parts of the app by biometrics. A step further would be to **tint the hero by state** (on track, at risk, resting), not only by section.
- **Generate the colour tokens in OKLCH/LCH from a few inputs** (base, accent per section, contrast), following Linear. This gives each section's tone equal perceived lightness, makes a high-contrast variant almost free, and gives a systematic base/elevated ladder for cards and sheets on deep black. Limit how much accent colour bleeds into the chrome so the UI stays "neutral and timeless".
- The **Coach** and the empty states could borrow the Bears Gratitude and Harvee pattern: a character or avatar that reflects the user's state adds warmth to dense data. Its tone should stay encouraging (Gentler Streak, Structured's "downtime as much as productivity").
- Comida, Físico and Estudio timers and step-by-step flows should follow Crouton ("focus on the counter rather than the screen"): large targets, screen kept awake (see §4), minimal chrome.

### Gaps
- I did not verify primary sources for Things 3, Superhuman, Arc, Raycast, Copilot Money or Flighty in this pass. This includes Flighty's ADA, which I believe was the 2023 Interaction award but did not confirm. Their patterns (keyboard-first command palettes, "Inbox Zero" rituals, live-activity-style status) are not documented here.
- I found no source quantifying how much a single hero metric or reduced tab count improved retention for Oura or Gentler Streak. The evidence is design intent plus awards, not A/B results.

---

## 2. Retention mechanics with evidence: first value, rituals, streaks vs intrinsic motivation, recaps, 30-day benchmarks

### Takeaway
Day 30 retention for health and productivity apps is low (single digits in most vendor data), and the first week largely decides long-term retention. The strongest evidence on streaks says unbroken streaks raise engagement, but a broken streak makes people drop off, especially when they blame themselves. So streaks need to be forgiving and repairable. Design based on Self-Determination Theory (autonomy, competence, relatedness) and periodic recaps ("Wrapped") are well supported. Gamification helps physical activity modestly.

### Cited Findings
**Benchmarks and first value**
- Amplitude's 2025 Product Benchmark Report covers more than 2,600 companies. It says getting just **7% of a cohort to return on day 7** puts a product "into the top 25% for activation performance". It also says "products with strong week-one activation were also strong performers in terms of three-month retention… users decide whether your product is worth keeping in their first seven days." — [Amplitude blog, Sept 2025](https://www.amplitude.com/blog/7-percent-retention-rule)
- Amplitude's media and entertainment benchmarks post says 69% of products with strong early activation were also strong 3-month retention performers. This is a correlation, not causation. — [Amplitude blog](https://amplitude.com/blog/media-entertainment-product-benchmarks) (search-snippet level)
- Vendor roundups of Day 30 retention by category **conflict widely**. Health and Fitness ranges from about 3% to about 12% depending on source. Productivity ranges from about 3% to about 18%. The all-app Day 30 median is often given as about 4–6%. Methodologies are unclear and mostly undated. — [Userpilot](https://userpilot.com/blog/mobile-app-retention/), [GetStream](https://getstream.io/blog/app-retention-guide/), [Plotline](https://www.plotline.so/blog/retention-rates-mobile-apps-by-industry), [Enable3](https://enable3.io/blog/app-retention-benchmarks-2025) (seen only in a search summary; I did not verify which figure comes from which source)
- RevenueCat's State of Subscription Apps 2025 reports that nearly 30% of annual subscriptions are cancelled in the first month, across all categories. — [RevenueCat, 2025](https://revenuecat.com/blog/company/the-state-of-subscription-apps-2025-launch) (snippet). This matters less here because Producti-me has no paywall.

**Onboarding (Apple HIG)**
- Onboarding should be "fast, fun, and optional". Make it interactive, because "people tend to grasp and retain information better when they can actually perform the task". Prefer "a collection of context-specific tips instead of a single onboarding flow". "Postpone nonessential setup flows… Provide reasonable default settings so most people can immediately start." Ask for a permission "when people first access the specific function" unless it is essential up front. — [Apple HIG, Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)

**Streaks: the strongest evidence**
- Silverman & Barasch, "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", *Journal of Consumer Research* 49(6), April 2023. Across 7 studies, showing an **unbroken** streak in a behaviour log increased later engagement compared with a **broken** one, even when actual past behaviour was the same. The effect was stronger when people attributed the break to themselves, and weaker when the streak could be **repaired**. — [UDSpace accepted manuscript](https://udspace.udel.edu/handle/19716/34160) (abstract via snippet)
- Barasch: "The log comes to represent something more important to you—it becomes a goal in and of itself." Messages that highlight a recent failure "typically [don't] work… people will just drop off once their streaks are broken." She suggests offering a **new goal**, or "adjusting the time periods for goals… without breaking existing streaks." — [CU Boulder Leeds School, 2023-04-20](https://www.colorado.edu/business/news/2023/04/20/research-streaks-marketing-tech-barasch)
- Gentler Streak lets **rest days keep the streak alive**. — [App Store listing](https://apps.apple.com/il/app/id1576857102) (snippet)

**Self-Determination Theory (SDT) and gamification**
- The METUX model (Peters, Calvo & Ryan, *Frontiers in Psychology*, 2018; older than the 2021 window but foundational) applies SDT's three needs to digital experience: **Autonomy** ("acting in accordance with one's goals and values"), **Competence** ("feeling able and effective") and **Relatedness**. It argues that motivation and wellbeing depend on these needs being met. — [Peters et al., 2018](https://www.frontiersin.org/articles/10.3389/fpsyg.2018.00797/full)
- Mazeas et al., *JMIR* 2022, meta-analysis of RCTs from 2010–2020: gamified interventions are "promising" for physical activity, and the effect persisted after follow-up, which argues against a pure novelty effect. The authors call for more rigorous trials. — [JMIR 2022;24(1):e26779](https://www.jmir.org/2022/1/e26779/). I could not open the full text to confirm the pooled effect size. A vendor's figure of g≈0.42 is unverified.
- A 2025 meta-analysis in people with cardiovascular disease found a small short-term effect of gamification on physical activity (Hedges g=0.32, 95% CI 0.19–0.45) and a smaller maintenance effect (g=0.20). — [PubMed 39854099](https://pubmed.ncbi.nlm.nih.gov/39854099/) (abstract via snippet)

**Recaps ("Wrapped")**
- Spotify Wrapped 2025 reached more than 200M engaged users in the first 24 hours, 19% ahead of 2024's pace (2024 took 62 hours to reach 200M). It was shared more than 500M times, up 41% from 2024. — [TechCrunch, 2025-12-04](https://techcrunch.com/2025/12/04/spotify-says-wrapped-2025-is-its-biggest-yet-with-200m-users-in-its-first-day/)
- Gentler Streak's **Monthly Summary** compares the user with their own history, not with others. Apple singled this out in the ADA 2024 citation. — [Apple Newsroom, ADA 2024](https://www.apple.com/newsroom/2024/06/apple-announces-winners-of-the-2024-apple-design-awards/)

**Daily rituals and personalisation**
- Oura's Today has a time-of-day "Daily highlight" and, from Oct 2024, insights personalised to goals. The Oct 2025 version frames this as "One Big Thing" per day. — [Oura blog, 2024-10-03](https://ouraring.com/blog/new-oura-app-experience/); [9to5Google, 2025-10-20](https://9to5google.com/2025/10/20/oura-app-redesign/)
- Bears Gratitude's characters create "a sense of warmth and routine" around a daily practice. grug delivers one piece of daily content with no login. — [Apple Newsroom, ADA 2024](https://www.apple.com/newsroom/2024/06/apple-announces-winners-of-the-2024-apple-design-awards/); [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)

### Inferences
- **First value in under 60 seconds.** On first open, have the user do one real thing: check off the first habit, or set today's One Big Thing. Postpone Apps Script sync setup, notification permission, and filling in all the Áreas. Use contextual tips the first time each area is opened, not an upfront tour.
- **Week one is what matters.** Plan a day 1–7 arc. Each day of the first week, open one new area with a single starter action. On day 7, run a "first weekly review" that shows progress. The goal is to beat Amplitude's 7% D7 bar, which in a personal app means the owner opening it on day 7.
- **Forgiving streaks.** Use weekly targets (for example 5 of 7) instead of strictly daily ones. Let planned rest days count. Offer a "repair" (a catch-up action within 24–48 hours). After a break, never send a failure message; reframe it as a new goal or a new period ("new week, new streak"). This follows Silverman & Barasch and the Gentler Streak model.
- **SDT mapping:** Autonomy means the user picks which habits and areas matter and can hide areas. Competence means visible progress against their own past (personal bests, trend lines). Relatedness in a single-user app can come from the Coach's warmth or optional sharing of recap cards.
- **Recaps as rituals:** run a weekly Revisión on a fixed day, a monthly summary against one's own history, and a yearly "Producti-me Wrapped" made of shareable story cards (see Web Share in §4).

### Gaps
- There is no rigorous, dated 2024–2026 Day 30 benchmark specifically for health and productivity apps from a primary report (Adjust, AppsFlyer or Sensor Tower). Only vendor roundups were found.
- I found no peer-reviewed RCT isolating "streak freeze/repair" features in habit apps, beyond Silverman & Barasch's repairability moderator.
- There is no evidence specific to single-user, no-account personal apps (most benchmarks concern acquired-user cohorts).

---

## 3. Notifications and re-engagement for PWAs on iOS (push server options, badges, widgets, local alternatives)

### Takeaway
On iOS and iPadOS 16.4+, Web Push and app badges work only for web apps opened from the Home Screen. Since iOS 18.4, **Declarative Web Push** removes the need for a service worker and can set the badge from the push payload. A sender is still required: something must sign VAPID requests and encrypt payloads. A free serverless option such as a Cloudflare Worker with a webcrypto push library is documented. There are no silent pushes, no scheduled local notifications without a push, and no Home Screen widgets for PWAs.

### Cited Findings
- Web Push for Home Screen web apps has worked since **iOS 16.4 (March 2023)**. — [Synthetixis, 2026-08-31](https://synthetixis.com/writing/pwa-ios-2026); [firt.dev iOS PWA Compatibility](https://firt.dev/notes/pwa-ios/) ("16.4 only for installed PWAs")
- The permission prompt appears "only after a visitor opens that icon and taps a subscribe button. A tab in Safari, Chrome, Edge, or Firefox cannot request permission." A Home Screen bookmark (not a web app) cannot request permission either. — [OneSignal docs, Web push for iOS](https://documentation.onesignal.com/docs/en/web-push-for-ios)
- **Declarative Web Push** (WebKit, Mar 27, 2025) became testable on iOS 18.4 and iPadOS 18.4, and on macOS 15.5. It "allows web developers to request a Web Push subscription and display user visible notifications **without requiring an installed service worker**". You subscribe with `window.pushManager.subscribe({userVisibleOnly: true, applicationServerKey})`. The JSON payload needs `"web_push": 8030` and a `notification` object with a required `title` and `navigate` URL. It can include **`"app_badge"`** to update the Home Screen badge. — [WebKit blog, 2025-03-27](https://webkit.org/blog/16535/meet-declarative-web-push/)
- Why WebKit introduced it: if a service worker fails to call `showNotification`, the push subscription is revoked ("no silent push"). ITP can also delete service worker registrations, which used to break subscriptions. With the declarative flow, the message itself is the fallback, and "removal of that service worker registration will not affect the associated push subscription." Delivery uses Apple Push Notification service, and you do not need an Apple Developer Program membership. — [WebKit blog, 2025-03-27](https://webkit.org/blog/16535/meet-declarative-web-push/)
- Push subscriptions must set `userVisibleOnly: true`, so every push must show a notification. Background data delivery disguised as push is not possible. — [Synthetixis, 2026-08-31](https://synthetixis.com/writing/pwa-ios-2026); [WebKit blog, 2025-03-27](https://webkit.org/blog/16535/meet-declarative-web-push/)
- The **Badging API** works on iOS from 16.4, **only for installed PWAs**. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- Background Sync, Periodic Background Sync and Background Fetch are **not supported** on iOS. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- **Serverless sender pattern:** Node's `web-push` package does not run on Cloudflare Workers, so use a webcrypto-based library (`@block65/webcrypto-web-push`). The payload is aes128gcm-encrypted with each subscription's keys, and VAPID keys are stored as environment secrets. Gotcha: rewrite the Authorization header to the draft-02 form `vapid t=<jwt>, k=<publicKey>`, which FCM requires and Apple and Mozilla autopush accept. On iOS, check for standalone mode before calling `subscribe()` and otherwise show an add-to-home-screen guide. — [DEV Community (aulvem), 2026](https://dev.to/aulvem/web-push-without-login-anonymous-device-tokens-on-cloudflare-workers-3g48)
- OneSignal supports iOS Home Screen web push through its Web SDK. Requirements: iOS or iPadOS 16.4+, and the visitor must add the site to the Home Screen and open it from there. — [OneSignal docs](https://documentation.onesignal.com/docs/en/web-push-for-ios)

### Inferences
- **The user's Google Apps Script already has time-driven triggers (cron).** It could in principle be the push sender, but it would have to produce ES256 (P-256 ECDSA) VAPID JWTs and RFC 8291 aes128gcm encryption. As far as I know, Apps Script's built-in `Utilities` has RSA and HMAC but not ECDSA or ECDH. That would need a pure-JS crypto library running in Apps Script V8. *Needs verification.* The lower-risk path is a free Cloudflare Worker with a Cron Trigger and `@block65/webcrypto-web-push` that sends one Declarative Web Push per day. The Apps Script backend could store the subscription JSON alongside the existing sync data.
- **Recommended notification budget:** one daily nudge at a user-chosen time (for example morning "Your One Big Thing" or evening "close your day"), plus a weekly Revisión reminder. Each should carry `app_badge` equal to the number of pending items today and `navigate` deep-linking into Hoy or the Revisión. Ask for permission only after the user has completed a few days of check-ins, from a clear button, never on first launch (see HIG in §2).
- **Badge without a server:** call `navigator.setAppBadge(n)` whenever the app is open or closed. The badge will then show the pending count from the last session, but it cannot roll over at midnight without a push.
- **Local alternatives with no server** (inferences, not tested): (a) export or subscribe to an `.ics` calendar feed with VALARM reminders for the Revisión and habits. Apps Script can serve text, so a `webcal://` feed is plausible. (b) Suggest an iOS Shortcuts "Time of Day" personal automation that opens the PWA URL.
- **Widgets:** no web API exists for iOS Home Screen widgets. The badge plus one well-timed notification is the PWA's substitute for a widget.

### Gaps
- I did not verify current free-tier limits for Cloudflare Workers (requests and cron triggers), OneSignal or FCM in 2026.
- I did not test whether Apps Script can generate ES256 JWTs or perform ECDH and AES-GCM. This is inference only.
- No authoritative source explicitly states "PWAs cannot create iOS widgets". This is inferred from the absence of any such capability in WebKit and firt.dev listings.

---

## 4. iOS/iPadOS PWA capability status, 2025–2026 (version-precise)

### Takeaway
Supported on installed iOS web apps: Web Push (16.4), Declarative Web Push (18.4), Badging (16.4, installed only), Screen Wake Lock (16.4 in Safari, 18.4 for installed PWAs), Web Share including files (12.1/15.0), OPFS (15.2, writable streams 26.0), persistent storage and the quota API (15.2/17.0), and View Transitions. Not supported: manifest shortcuts on iOS, share_target, Background Sync, Vibration, the public File System Access API, manifest `orientation`, and install prompts. Since iOS 26 any site added to the Home Screen opens as a web app. The 7-day ITP eviction rule does not apply to Home Screen web apps. Storage is **not shared** between Safari and the installed app.

### Cited Findings
**Install and display**
- **iOS/iPadOS 26:** "every website your users add to the Home Screen opens as a web app by default, even if it doesn't have a manifest". Users can switch off "Open as Web App" to get a bookmark instead. SVG manifest icons are supported since 26.0. Maskable and monochrome icons are ignored. — [firt.dev](https://firt.dev/notes/pwa-ios/); [OneSignal docs](https://documentation.onesignal.com/docs/en/web-push-for-ios)
- There is no install prompt or banner and no `beforeinstallprompt`. Installation is manual through the Share sheet. — [firt.dev](https://firt.dev/notes/pwa-ios/); [Synthetixis, 2026-08-31](https://synthetixis.com/writing/pwa-ios-2026)
- `apple-mobile-web-app-status-bar-style: black-translucent` is "still the only way to get a fullscreen app". `apple-touch-startup-image` is still the only way to define splash screens, and only works with the `apple-mobile-web-app-capable` meta present. Manifest `display: fullscreen` falls back to standalone, and `minimal-ui` falls back to browser. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- EU: Apple briefly removed Home Screen web apps in the iOS 17.4 betas, then reversed on 1 March 2024. 17.4 shipped with them intact. — [Synthetixis, 2026-08-31](https://synthetixis.com/writing/pwa-ios-2026)

**Manifest fields (iOS)**
- `shortcuts` ❌ on iOS ("Only on macOS since 17.4"). `share_target` ❌. `orientation` ❌. `background_color` ❌. `protocol_handlers` ❌. `display_override` ❌. `id` ✅ 16.4. `theme_color` ✅ 15.0. `icons` ✅ 15.4. — [firt.dev](https://firt.dev/notes/pwa-ios/)

**APIs**
- Screen Wake Lock: ✅ 16.4 (**18.4 for installed PWAs**). — [firt.dev](https://firt.dev/notes/pwa-ios/)
- Screen Orientation: ✅ 16.4, *partial*. Manifest `orientation` ❌. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- Web Share: ✅ 12.1. Web Share Level 2 (files): ✅ 15.0. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- File System Access (public file system) ❌. Origin Private File System ✅ 15.2, writable streams since 26.0. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- Vibration ❌. Web Notifications ✅ 16.4. Cookie Store ✅ 18.4. WebGPU ✅ 26.0. Web Speech Recognition ✅ 14.5. Media Session ✅ 15.0. Service worker Static Routing ✅ 27.0. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- Background Sync, Periodic Background Sync and Background Fetch ❌. — [firt.dev](https://firt.dev/notes/pwa-ios/)
- "Storage shared with Browser" ❌. "Login cookies copied to the installed app" ✅ since 17.2. "Link Capturing" ❌ (only a push message can open an installed PWA). — [firt.dev](https://firt.dev/notes/pwa-ios/)
- **Safari 27.0 (Sep 17, 2026):** headline items are Scroll Anchoring (on by default, opt out with `overflow-anchor: none`), Customizable Select (`appearance: base-select`), `maxAge` in the Cookie Store API, several IndexedDB reliability fixes, and View Transition fixes (snapshots now preserve non-sRGB colour). The `<input type="checkbox" switch>` now respects native-appearance CSS like other controls. I saw no new Home Screen web-app or push API in the release's contents. — [WebKit blog, Safari 27.0](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/)

**Haptics (relevant to premium feel)**
- There is no public web haptics API on iOS, and `navigator.vibrate` is ignored. A community workaround toggles a hidden `<input type="checkbox" switch>` (introduced in Safari 17.4) to fire the Taptic Engine. One source says programmatic triggering works on **iOS 17.4–26.4** and was **patched in iOS 26.5**, while "direct user interaction with a real `<input type="checkbox" switch>` still works." — [RapidToolset iOS Haptics Tester](https://rapidtoolset.com/en/tool/ios-haptics-tester); [ios-haptics npm](https://npmjs.com/package/ios-haptics). This is a single non-authoritative source for the 26.5 patch claim, so verify on a device.

**Storage, eviction and persistence**
- **Safari 17 / iOS 17 (WebKit, Aug 10, 2023):** for browser apps such as Safari, the per-origin quota is up to **60% of total disk** and the overall quota up to **80%**. Other WebKit apps get 15% and 20%. A Home Screen web app gets the same quotas as in the browser. Safari no longer prompts users for more space. — [WebKit blog, 2023-08-10](https://webkit.org/blog/14403/updates-to-storage-policy/)
- Eviction removes whole origins, least recently used first, when the overall quota is exceeded or under storage pressure. Origins in **persistent mode** are excluded. `navigator.storage.persist()` is granted "based on heuristics like whether the website is opened as a Home Screen Web App." The Storage API (`estimate`, `persisted`, `persist`) is fully supported from Safari 17. You still need to handle `QuotaExceededError`. — [WebKit blog, 2023-08-10](https://webkit.org/blog/14403/updates-to-storage-policy/)
- ITP's 7-day deletion of script-writable storage is gated on "seven days of Safari use without user interaction". **"Web applications added to the home screen are not part of Safari and thus have their own counter of days of use… We do not expect the first-party in such a web application to have its website data deleted."** — [WebKit blog, March 2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/) (older than the 2021 window, still the governing statement; reaffirmed by [Synthetixis, 2026](https://synthetixis.com/writing/pwa-ios-2026))
- The "50 MB cache limit" is outdated folklore. — [Synthetixis, 2026-08-31](https://synthetixis.com/writing/pwa-ios-2026)

### Inferences
- **Onboarding must be install-first.** IndexedDB is not shared between Safari and the Home Screen app. A user who sets up habits in a Safari tab and then installs the app starts empty. Detect `display-mode: standalone` and, in a Safari tab, show only an install guide or a read-only demo, not data entry. Or offer to sync via Apps Script before install.
- On first standalone launch, call `navigator.storage.persist()`. Show the result and `estimate()` in Ajustes ("Storage protected ✓"). Keep periodic export to Apps Script and to a file through Web Share or download as the real backup, since the public file system API is unavailable.
- **Wake Lock** (iOS 18.4+ installed) should be on by default during Físico workouts, Estudio focus sessions and Comida step-by-step.
- **Web Share Level 2** can send a rendered PNG of the weekly or annual recap card, which supports the Wrapped-style ritual.
- The **"+" quick-add cannot be a Home Screen long-press shortcut** on iOS because manifest `shortcuts` are unsupported. Use deep-link query params (for example `/?add=habit`) that an iOS Shortcut or a push `navigate` URL can open.
- **Haptics:** make habit check-offs and toggles real, styled `<input type="checkbox" switch>` elements the user taps directly. That keeps native haptics even after the 26.5 change. Safari 27 improved the switch's appearance styling. Treat any programmatic haptics as a progressive enhancement only.
- Scroll anchoring in Safari 27 is on by default. Check that lists in Hoy or Hábitos that insert items above the viewport (for example after a sync) behave correctly.

### Gaps
- caniuse pages were not fetched. Version data relies on firt.dev's continuously maintained private tests and WebKit posts.
- I did not verify whether View Transitions (same-document vs cross-document) behave differently in standalone mode on iOS 18 and 26.
- I found no official Apple statement on whether iPadOS Stage Manager or multi-window affects Home Screen web apps.

---

## 5. Accessibility, internationalisation, offline-first and performance budgets

### Takeaway
The minimum bar is WCAG 2.2 AA (Oct 2023). New criteria that matter for a mobile dashboard: 24×24 CSS px minimum targets, a non-drag alternative for every drag interaction, and focus that is not hidden by sticky bars or sheets. Use Apple's dark mode contrast guidance (≥4.5:1, aim for 7:1 on small text). Performance targets are Core Web Vitals at p75: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. Offline-first on iOS means persistent IndexedDB, explicit sync, and no background sync.

### Cited Findings
- WCAG 2.2 became a W3C Recommendation on **5 October 2023**. New criteria: 2.4.11 Focus Not Obscured (Minimum, AA); 2.5.7 Dragging Movements (AA), "for any action that involves dragging, provide a simple pointer alternative"; **2.5.8 Target Size (Minimum, AA), at least 24 by 24 CSS pixels** (or enough spacing); 3.2.6 Consistent Help (A); 3.3.7 Redundant Entry (A); 3.3.8 Accessible Authentication (AA). — [W3C WAI, What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- Apple dark mode contrast: at least 4.5:1, aim for 7:1 for custom colours and small text. Test with Increase Contrast and Reduce Transparency. — [Apple HIG, Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- Linear derives automatic high-contrast themes from a single "contrast" variable in an LCH-based generator. — [Linear, 2024-03-28](https://linear.app/now/how-we-redesigned-the-linear-ui)
- ADA 2026 Inclusivity winner Guitar Wiz supports VoiceOver, Dynamic Type, Increased Contrast and Differentiate Without Color. Apple treats these as the baseline for "inclusive". — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- Core Web Vitals "good" thresholds: **LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1**, measured at the **75th percentile** of page loads. — [web.dev, Web Vitals](https://web.dev/articles/vitals)
- Offline and storage facts relevant to offline-first: no Background Sync on iOS; persistent mode is available and favours Home Screen apps; quota is up to 60% of disk per origin; handle `QuotaExceededError`. — [firt.dev](https://firt.dev/notes/pwa-ios/); [WebKit blog, 2023-08-10](https://webkit.org/blog/14403/updates-to-storage-policy/)
- Safari 27.0 fixed IndexedDB bugs, including a version-0 database after an aborted `onupgradeneeded` and long-blocked transactions when another page's transaction was suspended in the background. — [WebKit blog, Safari 27.0](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/)

### Inferences
- **Bottom tab bar and bottom sheets:** check 2.4.11. Focused fields or toasts must not be hidden behind the tab bar, sheet or iOS keyboard. Undo toasts need a target of at least 24 px (44 px is better on touch) and must stay up long enough to reach.
- **Reordering** habits or areas by drag needs a non-drag alternative such as up/down buttons or a "Move" menu (2.5.7).
- **Colour:** per-section tones must never be the only carrier of meaning (on track vs at risk). Pair them with icons or labels, following Differentiate Without Color.
- **Motion:** gate view transitions and gradual tone transitions behind `prefers-reduced-motion`. This is standard practice; I did not fetch a 2025 source.
- **Sync design:** since there is no Background Sync, sync to Apps Script on `visibilitychange` (hidden) and on app open, with a visible "last synced" timestamp and conflict-safe merges. Write to IndexedDB first and sync afterwards (optimistic UI, which fits undo toasts).
- **Performance budget:** target INP ≤200 ms for every check-off tap, so do the IndexedDB write asynchronously and update the UI optimistically. Keep LCP ≤2.5 s on cold start of the installed app, for example by precaching the shell and lazy-loading Coach and Finanzas charts.
- **i18n:** the app is Spanish-first. Use `Intl.DateTimeFormat`, `Intl.NumberFormat` (currency in Finanzas) and `Intl.RelativeTimeFormat` with the device locale, and avoid hard-coded date and number strings. This is an inference; no source was fetched.

### Gaps
- I did not fetch a sourced JS bundle-size budget (for example a "170 KB" rule of thumb) or Apple's 44 pt touch-target guidance in this pass.
- I did not fetch guidance on Dynamic Type support in web content (`font: -apple-system-body`) for iOS 26.
- I found no data on how much accessibility work affects retention.

---

## 6. Why users abandon personal dashboards, and how top apps keep complexity in check

### Takeaway
People quit health apps mainly because logging takes effort (about 44%), they lose interest (about 40%), and the app is confusing (more than a third). These figures come from a 2015 study, still the most-cited one. Top apps respond by cutting tabs (Oura 5→3, Gentler Streak 4→3), putting one primary score or action per screen, using smart defaults and postponing setup, and staying minimal ("nothing extraneous").

### Cited Findings
- Of 934 health-app downloaders, 45.7% had stopped using at least one app, "primarily due to high data entry burden, loss of interest, and hidden costs." — [JMIR mHealth uHealth, 2015;3(4):e101](https://mhealth.jmir.org/2015/4/e101/) (2015, outside the 2021 window but the standard reference)
- Breakdown of the same survey: 44% said entering data took too long, 40% lost interest, 36% cited hidden costs, more than a third found the apps confusing, and 30% disliked data sharing with friends. — [MedCity News, Nov 2015](https://medcitynews.com/2015/11/health-app-developers-this-is-whats-turning-your-users-off/)
- A qualitative study of 12 former users found the most common negative experiences before quitting were "frustration, pressure, and the time-consuming aspect." — [Radboud University thesis](https://theses.ubn.ru.nl/items/bc4d0e40-da4a-4702-b4cc-d54a57f88bc7) (snippet; student thesis, low weight)
- Oura cut 5 tabs to 3 explicitly to be "informed without being overwhelmed" and to keep Today focused on "the most important aspects of your health". — [Oura blog, 2024-10-03](https://ouraring.com/blog/new-oura-app-experience/)
- Gentler Streak cut 4 tabs to 3. — [BGR](https://bgr.com/tech/gentler-streak-gets-a-major-redesign-focused-on-your-wellbeing/) (snippet)
- Linear: "reduce visual noise… increase the hierarchy". — [Linear, 2024-03-28](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Apple rewards minimalism: grug has "no login, no cloud syncing, nothing extraneous", Primary has "a properly minimal UI", and Structured has a "simple layout" praised by neurodivergent users. — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)
- HIG: "Postpone nonessential setup flows or customization steps. Provide reasonable default settings"; if you teach too much, "people can feel overwhelmed". — [Apple HIG, Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)
- Structured uses on-device models to "suggest and pre-fill tasks" to make organisation "less challenging", which reduces logging burden. — [Apple Developer, ADA 2026](https://developer.apple.com/design/awards/)

### Inferences
- **Producti-me's biggest abandonment risk is breadth:** eight areas (Físico, Comida, Cuerpo, Estudio, Finanzas, Vida, Revisión, Ajustes) plus Hábitos and Coach. Mitigations:
  - Let the user **turn areas on or off**. Hidden areas disappear from Hoy and from navigation. Start with 2–3 areas based on a one-question onboarding ("what do you want to improve first?").
  - **One primary action per screen.** Hoy has the One Big Thing and check-offs. Each area has one main "log" action plus a progressive-disclosure detail.
  - **Reduce logging effort:** one-tap presets (last meal, usual workout, recurring expense), carrying over yesterday's values, and the Coach (AI) pre-filling entries from natural language, following Structured.
  - **Evening "close the day" ritual** in under 30 seconds, and a weekly Revisión in under 5 minutes, both with a fixed and finite length.
  - **No guilt mechanics:** keep streaks forgiving (see §2). Show empty states as invitations, not deficits.
- Keep the bottom bar at five items (Hoy · Hábitos · + · Coach · Áreas). This already follows the "few tabs" pattern. Resist promoting individual areas to top-level tabs.

### Gaps
- I found no 2021–2026 large-sample study of abandonment reasons for personal dashboards or life-OS apps specifically. The best data is the 2015 health-app survey.
- I found no quantitative before/after retention data for the Oura or Gentler Streak tab reductions.
- Superhuman's and Things 3's complexity-control practices (keyboard-first design, "one thing at a time" flows) were not sourced in this pass.
