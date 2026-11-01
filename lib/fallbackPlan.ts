import { Brief, PlanResponse, IdeasResponse, AssistResponse, Idea } from '@/types';

/**
 * Builds a high-quality deterministic fallback plan when AI is unavailable or offline.
 * Meets all Indian market budgeting norms, event-specific nuances, and PlanResponseSchema criteria.
 */
export function buildFallbackPlan(brief: Brief): PlanResponse {
  switch (brief.eventType) {
    case 'wedding':
      return buildWeddingFallback(brief);
    case 'birthday':
      return buildBirthdayFallback(brief);
    case 'community':
      return buildCommunityFallback(brief);
    default:
      return buildWeddingFallback(brief);
  }
}

function buildWeddingFallback(brief: Brief): PlanResponse {
  const functionsList = brief.weddingFunctions.length > 0
    ? brief.weddingFunctions.join(', ')
    : 'ceremony and reception';

  return {
    summary: `Structured Indian wedding plan for ${brief.guestCount} guests in ${brief.city} covering ${functionsList}. Focuses on hospitality, memorable cuisine, photographic keepsakes, and smooth multi-day coordination.`,
    budget: [
      {
        category: 'catering',
        percent: 32.0,
        rationale: 'Multi-course regional & live interactive food stations for guest hospitality',
        tips: ['Schedule formal food tasting', 'Include welcome mocktails & seasonal desserts'],
      },
      {
        category: 'venue',
        percent: 22.0,
        rationale: 'Banquet hall or lawn space with rooms for immediate family & rituals',
        tips: ['Confirm generator backup power', 'Verify timing curfew for music and sound'],
      },
      {
        category: 'decor',
        percent: 13.0,
        rationale: 'Mandap, floral entryway, stage styling, and ambient lighting',
        tips: ['Opt for locally sourced marigolds and jasmine', 'Reuse floral arrangements across rituals'],
      },
      {
        category: 'photography',
        percent: 10.0,
        rationale: 'Candid photography, cinematic video, drone coverage, and family portraits',
        tips: ['Review complete uncut wedding galleries', 'Confirm delivery timelines for teaser album'],
      },
      {
        category: 'attire',
        percent: 8.0,
        rationale: 'Bridal lehengas, sherwanis, safa styling, and jewelry allocation',
        tips: ['Plan fittings 3 weeks before date', 'Keep comfortable footwear for ritual hours'],
      },
      {
        category: 'entertainment',
        percent: 5.0,
        rationale: 'DJ sound setup, dhol players for baraat, and sangeet choreography',
        tips: ['Provide curated playlist with "do-not-play" list', 'Check local sound decibel permit'],
      },
      {
        category: 'invitations',
        percent: 2.5,
        rationale: 'Digital video invites, wedding website, and boxed traditional cards for elders',
        tips: ['Send "Save the Date" 3 months ahead', 'Use WhatsApp RSVP tracking'],
      },
      {
        category: 'gifts',
        percent: 2.5,
        rationale: 'Mithai boxes, return gifts, and welcome hampers for outstation guests',
        tips: ['Pack artisanal teas or local snacks', 'Order 10% spare boxes'],
      },
      {
        category: 'contingency',
        percent: 5.0,
        rationale: 'Safety reserve for unplanned rituals, overtime vendor charges, and last-minute travel',
        tips: ['Keep untouched until 10 days before event', 'Designate one family member as cash coordinator'],
      },
    ],
    timeline: [
      { id: 'wed-1', title: 'Lock Venue & Accommodation', details: 'Sign contract and secure banquet hall with guest rooms in ' + brief.city, category: 'venue', priority: 'high', weeksBefore: 24 },
      { id: 'wed-2', title: 'Book Primary Caterer', details: 'Finalize menu items and live station counts with food tasting', category: 'catering', priority: 'high', weeksBefore: 20 },
      { id: 'wed-3', title: 'Book Photographer & Cinematographer', details: 'Check candid team portfolio and verify dates for all rituals', category: 'photography', priority: 'high', weeksBefore: 18 },
      { id: 'wed-4', title: 'Hire Decorator & Florist', details: 'Share mood boards for mandap, sangeet stage, and haldi backdrop', category: 'decor', priority: 'high', weeksBefore: 14 },
      { id: 'wed-5', title: 'Finalize Wedding Attire & Jewelry', details: 'Complete bridal wear, groom sherwani, and matching accessories', category: 'attire', priority: 'medium', weeksBefore: 12 },
      { id: 'wed-6', title: 'Send Invitations & Collect RSVPs', details: 'Dispatch digital invites and traditional family cards', category: 'invitations', priority: 'medium', weeksBefore: 8 },
      { id: 'wed-7', title: 'Book DJ, Dhol & Sangeet Choreographer', details: 'Confirm sound equipment and finalize track lists', category: 'entertainment', priority: 'medium', weeksBefore: 6 },
      { id: 'wed-8', title: 'Order Favors & Return Gifts', details: 'Assemble welcome hampers and sweets for guests', category: 'gifts', priority: 'low', weeksBefore: 4 },
      { id: 'wed-9', title: 'Final Outfit Fittings & Trials', details: 'Complete makeup trial and garment alteration checks', category: 'attire', priority: 'medium', weeksBefore: 2 },
      { id: 'wed-10', title: 'Rehearsal & Master Run of Show', details: 'Walkthrough with immediate family, pandit, and coordinator', category: 'logistics', priority: 'high', weeksBefore: 1 },
    ],
    vendors: [
      {
        category: 'venue',
        whatToBook: 'Wedding lawn or banquet hall with rooms',
        questionsToAsk: [
          'What is the cutoff time for outdoor music and lighting?',
          'Are external caterers and decorators allowed without royalty fees?',
          'Is full generator backup included in the rental cost?',
          'How many guest rooms and changing suites are included?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.18),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.28),
        bookWeeksBefore: 24,
        redFlags: ['No backup generator during power outage', 'Hidden corkage or royalty fees in fine print', 'Lack of dedicated valet parking'],
      },
      {
        category: 'catering',
        whatToBook: 'Full catering service with live chaat and regional counters',
        questionsToAsk: [
          'Can you organize a formal food tasting for 4 family members?',
          'What is your staff-to-guest ratio during peak dining hours?',
          'Do you supply water dispensers, chafing dishes, and crockery?',
          'How do you manage dietary preferences (Jain, vegan, allergies)?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.25),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.38),
        bookWeeksBefore: 20,
        redFlags: ['Refusal to host a prior food tasting', 'Unclear per-plate replenishment policies', 'No trained banquet captain on site'],
      },
      {
        category: 'photography',
        whatToBook: 'Candid and traditional photography team with drone coverage',
        questionsToAsk: [
          'How many shooters will be physically present for each ritual?',
          'What is the guaranteed delivery date for teaser photos and raw files?',
          'Do you retain copyright and how are high-res images provided?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.08),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.15),
        bookWeeksBefore: 18,
        redFlags: ['Subcontracting event to unverified junior photographers', 'Delivery timelines exceeding 90 days', 'Absence of written contract'],
      },
      {
        category: 'decor',
        whatToBook: 'Stage, mandap, entrance arch, and table centerpiece decorator',
        questionsToAsk: [
          'Will you use fresh natural flowers or artificial blooms for the mandap?',
          'How many hours prior to event start will setup be 100% complete?',
          'Are ambient uplights and fairy lights included in the package?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.10),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.18),
        bookWeeksBefore: 14,
        redFlags: ['Using worn or faded fabric draping', 'Last-minute flower substitutions', 'Inadequate electrical safety cabling'],
      },
    ],
    ideas: [
      { type: 'theme', title: 'Royal Heritage Marigold & Brass', description: 'Deep plum and marigold palette accented with traditional brass urlis and floating diya candles.', estCostInr: Math.round(brief.totalBudgetInr * 0.04) },
      { type: 'menu', title: 'Live Regional Chaat & Mithai Bar', description: 'Fresh Lucknowi chaat, live jalebi-rabdi counter, and customized artisanal mocktails.', estCostInr: Math.round(brief.totalBudgetInr * 0.06) },
      { type: 'activity', title: 'Audio Guestbook & Polaroid Wall', description: 'Guests record vintage telephone voice wishes and pin instant polaroids to a floral keepsake board.', estCostInr: Math.round(brief.totalBudgetInr * 0.015) },
      { type: 'decor', title: 'Fairylight Canopy Mandap', description: 'Overhead starlit canopy draping with fragrant tuberose (rajnigandha) and hanging brass bells.', estCostInr: Math.round(brief.totalBudgetInr * 0.05) },
      { type: 'gift', title: 'Eco-Friendly Plant & Spice Hampers', description: 'Terracotta potted succulent with single-origin Indian spices and handwritten gratitude note.', estCostInr: Math.round(brief.totalBudgetInr * 0.02) },
      { type: 'entertainment', title: 'Live Fusion Dhol & Saxophone', description: 'Energetic acoustic dhol players paired with saxophone melodies during the grand welcome.', estCostInr: Math.round(brief.totalBudgetInr * 0.025) },
    ],
    risks: [
      { risk: 'Unpredictable seasonal rain or excessive humidity in ' + brief.city, mitigation: 'Ensure venue offers waterproof weatherproof canopy or indoor backup hall.' },
      { risk: 'Baraat delay causing dining hall overtime charges', mitigation: 'Buffer schedule by 45 minutes and assign a family timeline marshal.' },
      { risk: 'Guest count overage straining buffet lines', mitigation: 'Agree on a +10% floating plate guarantee with caterer 48 hours prior.' },
    ],
    confidence: 0.95,
  };
}

function buildBirthdayFallback(brief: Brief): PlanResponse {
  const isKid = (brief.honoreeAge ?? 30) < 13;
  const isSenior = (brief.honoreeAge ?? 30) >= 60;

  const themeTitle = isKid ? 'Magical Adventure Wonderland' : isSenior ? 'Golden Memories Nostalgia Gala' : 'Chic Evening Celebration';

  return {
    summary: `Tailored celebration plan for ${brief.title} (${brief.guestCount} guests in ${brief.city}) honoring age ${brief.honoreeAge ?? 30}. Features age-appropriate activities, customized dining, vibrant decor, and keepsake photography.`,
    budget: [
      {
        category: 'catering',
        percent: 36.0,
        rationale: 'Party buffet, live snacks counter, themed celebration cake, and refreshments',
        tips: ['Select crowd-pleasing finger foods', 'Order customized multi-tiered cake from specialist'],
      },
      {
        category: 'venue',
        percent: 24.0,
        rationale: 'Party hall, rooftop terrace, or clubhouse with private dining space',
        tips: ['Verify setup access 2 hours before guests arrive', 'Check on-site air conditioning capacity'],
      },
      {
        category: 'decor',
        percent: 15.0,
        rationale: 'Photo backdrop, organic balloon garland, LED neon signage, and table decor',
        tips: ['Use biodegradable balloons or fabric tassels', 'Spotlight the cake table'],
      },
      {
        category: 'entertainment',
        percent: 10.0,
        rationale: isKid ? 'Magician, games emcee, and bubble show' : 'Live acoustic musician or DJ with karaoke setup',
        tips: ['Brief performer on age-appropriate humor', 'Prepare fun spot prizes for games'],
      },
      {
        category: 'photography',
        percent: 7.0,
        rationale: 'Dedicated photographer for cake cutting, group family portraits, and candid moments',
        tips: ['Request 24-hour sneak peek photos for social sharing'],
      },
      {
        category: 'gifts',
        percent: 3.0,
        rationale: 'Customized return gifts and goodie bags for departing guests',
        tips: ['Match return gift packaging with party theme'],
      },
      {
        category: 'contingency',
        percent: 5.0,
        rationale: 'Buffer for cake damage, unexpected extra children/guests, and overtime music',
        tips: ['Keep spare candles and backup sound cable'],
      },
    ],
    timeline: [
      { id: 'bday-1', title: 'Confirm Venue & Party Date', details: 'Book clubhouse or restaurant hall in ' + brief.city, category: 'venue', priority: 'high', weeksBefore: 8 },
      { id: 'bday-2', title: 'Book Entertainment & Host', details: 'Hire emcee, magician, or DJ depending on party format', category: 'entertainment', priority: 'high', weeksBefore: 6 },
      { id: 'bday-3', title: 'Order Custom Cake & Food Menu', details: 'Finalize themed cake flavors, savory items, and drinks', category: 'catering', priority: 'high', weeksBefore: 4 },
      { id: 'bday-4', title: 'Finalize Balloon & Backdrop Decor', details: 'Approve neon age sign, color scheme, and photo corner', category: 'decor', priority: 'medium', weeksBefore: 3 },
      { id: 'bday-5', title: 'Send Digital Invitations', details: 'Distribute animated RSVP invites via messaging apps', category: 'invitations', priority: 'medium', weeksBefore: 2 },
      { id: 'bday-6', title: 'Purchase Favors & Goodie Bags', details: 'Assemble customized gifts and game winner prizes', category: 'gifts', priority: 'low', weeksBefore: 2 },
      { id: 'bday-7', title: 'Confirm Photographer & Playlists', details: 'Align on must-have family shots and music cues', category: 'photography', priority: 'medium', weeksBefore: 1 },
      { id: 'bday-8', title: 'Final Headcount & Venue Walkthrough', details: 'Share final numbers with caterer and check music system', category: 'logistics', priority: 'high', weeksBefore: 0 },
    ],
    vendors: [
      {
        category: 'venue',
        whatToBook: 'Private party hall or lawn with audio system',
        questionsToAsk: [
          'Can we bring external decorators and celebration cake?',
          'What is the policy for music volume after 10 PM?',
          'How early can the decorator access the space?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.20),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.30),
        bookWeeksBefore: 8,
        redFlags: ['Poor air-conditioning during afternoon heat', 'Lack of clean washrooms', 'Unfriendly staff behavior'],
      },
      {
        category: 'catering',
        whatToBook: 'Appetizers, buffet spread, and custom birthday cake baker',
        questionsToAsk: [
          'Can you create custom sugar-free or eggless options?',
          'Do you supply service staff and cutlery?',
          'How do you transport multi-tiered cakes safely?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.30),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.42),
        bookWeeksBefore: 4,
        redFlags: ['No temperature-controlled cake delivery', 'Cold snacks served late', 'Hidden service tax'],
      },
      {
        category: 'entertainment',
        whatToBook: 'Party emcee, interactive game host, or DJ',
        questionsToAsk: [
          'What interactive games will you run for this specific age group?',
          'Do you provide your own microphones and wireless sound box?',
          'How do you handle shy or reluctant participants?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.08),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.15),
        bookWeeksBefore: 6,
        redFlags: ['Using inappropriate jokes or humor', 'Late arrival on event day', 'Crackling microphone setup'],
      },
    ],
    ideas: [
      { type: 'theme', title: themeTitle, description: 'Coordinated colors, personalized photo entrance arch, and warm spotlighting.', estCostInr: Math.round(brief.totalBudgetInr * 0.05) },
      { type: 'activity', title: isKid ? 'Giant Bubble & Slime Station' : 'Nostalgia Memory Trivia Quiz', description: 'Interactive entertainment segment engaging all guests with lighthearted competition.', estCostInr: Math.round(brief.totalBudgetInr * 0.03) },
      { type: 'menu', title: 'Interactive Dessert & Milkshake Bar', description: 'Waffle cones, sundae toppings, and customized miniature dessert jars.', estCostInr: Math.round(brief.totalBudgetInr * 0.04) },
      { type: 'decor', title: 'Illuminated Milestone Number Marquee', description: 'Large light-up marquee number letters standing 4-feet tall for photo ops.', estCostInr: Math.round(brief.totalBudgetInr * 0.035) },
      { type: 'gift', title: 'Personalized Travel Tumbler or Storybook', description: 'Useful custom keepsake gift packaged with handwritten thank-you card.', estCostInr: Math.round(brief.totalBudgetInr * 0.03) },
      { type: 'entertainment', title: 'Surprise Video Message Montage', description: 'Curated 5-minute reel of overseas friends and family wishing the honoree.', estCostInr: 0 },
    ],
    risks: [
      { risk: 'Party cake melting or collapsing in warm weather', mitigation: 'Confirm refrigerated storage at venue until 15 minutes before cutting.' },
      { risk: 'Kids losing interest during extended speeches', mitigation: 'Keep formal ceremony under 15 minutes followed immediately by snacks.' },
    ],
    confidence: 0.95,
  };
}

function buildCommunityFallback(brief: Brief): PlanResponse {
  const kind = brief.communityKind ?? 'cultural';

  return {
    summary: `Comprehensive community ${kind} plan for ${brief.guestCount} attendees in ${brief.city}. Prioritizes civic safety, permits, clear crowd flow, stage logistics, and community engagement.`,
    budget: [
      {
        category: 'venue',
        percent: 25.0,
        rationale: 'Community ground, society clubhouse, or auditorium rental with basic amenities',
        tips: ['Ensure adequate parking and accessible ramp access', 'Verify sanitization standards'],
      },
      {
        category: 'catering',
        percent: 25.0,
        rationale: 'Hygienic community meal, drinking water stations, and snack counters',
        tips: ['Set up distinct water refill points to reduce plastic waste', 'Opt for eco-friendly areca leaf plates'],
      },
      {
        category: 'logistics',
        percent: 15.0,
        rationale: 'Seating chairs, stage barricades, dustbins, and electrical generator backup',
        tips: ['Ensure extra chairs for senior community members', 'Label green and blue waste bins clearly'],
      },
      {
        category: 'entertainment',
        percent: 12.0,
        rationale: 'PA sound system, microphones, stage lighting, and local performance coordination',
        tips: ['Test sound at the furthest boundary point', 'Have backup wired microphone on stand'],
      },
      {
        category: 'permissions',
        percent: 5.0,
        rationale: 'Municipal corporation, police noise clearance, society NOC, and fire safety compliance',
        tips: ['Submit police permission at least 21 days prior', 'Keep fire extinguishers near power generators'],
      },
      {
        category: 'decor',
        percent: 8.0,
        rationale: 'Welcome banners, direction signage, stage draping, and community display boards',
        tips: ['Use reusable cloth banners instead of single-use flex plastic'],
      },
      {
        category: 'photography',
        percent: 5.0,
        rationale: 'Event documentation for community newsletters, sponsors, and social archives',
        tips: ['Capture group shots of volunteers and organizing committee'],
      },
      {
        category: 'contingency',
        percent: 5.0,
        rationale: 'Reserve for unexpected crowd surge, weather shelters, and emergency medical kits',
        tips: ['Designate a first-aid booth staffed by volunteer nurses'],
      },
    ],
    timeline: [
      { id: 'comm-1', title: 'File Civic & Police Permissions', details: 'Obtain sound license, society NOC, and local authority clearance in ' + brief.city, category: 'permissions', priority: 'high', weeksBefore: 6 },
      { id: 'comm-2', title: 'Secure Venue Ground & Power', details: 'Book ground and ensure dedicated silent generator backup', category: 'venue', priority: 'high', weeksBefore: 5 },
      { id: 'comm-3', title: 'Hire Sound PA & Stage Setup', details: 'Contract sound engineer, stage riser, and safety barricading', category: 'entertainment', priority: 'high', weeksBefore: 4 },
      { id: 'comm-4', title: 'Engage Volunteer Committees', details: 'Assign roles for traffic, hospitality, stage management, and safety', category: 'logistics', priority: 'high', weeksBefore: 3 },
      { id: 'comm-5', title: 'Confirm Food & Clean Water Supply', details: 'Coordinate caterer, compostable dinnerware, and refill stations', category: 'catering', priority: 'medium', weeksBefore: 2 },
      { id: 'comm-6', title: 'Signage & Community Announcements', details: 'Put up notices in local resident groups and hang directional signs', category: 'decor', priority: 'medium', weeksBefore: 2 },
      { id: 'comm-7', title: 'First Aid & Security Briefing', details: 'Stock first-aid kits and brief volunteer marshals on crowd flow', category: 'logistics', priority: 'high', weeksBefore: 1 },
      { id: 'comm-8', title: 'Final Sound & Stage Tech Check', details: 'Inspect generator wiring, mic frequencies, and emergency exits', category: 'logistics', priority: 'high', weeksBefore: 0 },
    ],
    vendors: [
      {
        category: 'venue',
        whatToBook: 'Civic ground, auditorium, or society central park',
        questionsToAsk: [
          'What are the mandatory closing hours for public amplification?',
          'Is water connection available for washing and drinking stations?',
          'Are there accessible entry ramps for wheelchairs and seniors?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.20),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.30),
        bookWeeksBefore: 6,
        redFlags: ['Disputed municipal land permissions', 'No emergency vehicle access gate', 'Unsanitary public toilets'],
      },
      {
        category: 'entertainment',
        whatToBook: 'Commercial grade PA sound system with stage lighting',
        questionsToAsk: [
          'Does your equipment comply with local municipal decibel standards?',
          'Do you supply heavy-duty rubber cable protectors for pedestrian paths?',
          'Will a dedicated sound technician remain present throughout the program?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.10),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.16),
        bookWeeksBefore: 4,
        redFlags: ['Exposed loose wires in pedestrian walkways', 'Untested wireless microphones that cut out', 'Absence of power surge protection'],
      },
      {
        category: 'catering',
        whatToBook: 'Hygienic community meal service with eco-friendly plates',
        questionsToAsk: [
          'Can you handle bulk serving smoothly without creating congestion?',
          'Do you provide waste disposal bins for food leftovers?',
          'How is clean drinking water stored and dispensed?',
        ],
        typicalCostMinInr: Math.round(brief.totalBudgetInr * 0.20),
        typicalCostMaxInr: Math.round(brief.totalBudgetInr * 0.32),
        bookWeeksBefore: 3,
        redFlags: ['Uncovered food trays prone to flies and dust', 'Inadequate hand-washing facilities', 'Single-use non-recyclable plastic disposables'],
      },
    ],
    ideas: [
      { type: 'theme', title: 'Green Celebration & Zero Waste', description: 'Eco-conscious gathering with organic decorations and segregated composting.', estCostInr: Math.round(brief.totalBudgetInr * 0.03) },
      { type: 'activity', title: 'Community Talent Showcase & Felicitation', description: 'Showcase performances by local residents with certificates for volunteers.', estCostInr: Math.round(brief.totalBudgetInr * 0.02) },
      { type: 'menu', title: 'Traditional Festive Thali', description: 'Seasonal local delicacies served fresh on biodegradable areca nut plates.', estCostInr: Math.round(brief.totalBudgetInr * 0.05) },
      { type: 'decor', title: 'Handcrafted Rangoli & Paper Lanterns', description: 'Colorful entryway artwork crafted by resident volunteer artists.', estCostInr: Math.round(brief.totalBudgetInr * 0.015) },
      { type: 'entertainment', title: 'Local Cultural Troupe & Group Chorus', description: 'Live folk music and dance performances celebrating community heritage.', estCostInr: Math.round(brief.totalBudgetInr * 0.04) },
      { type: 'gift', title: 'Heritage Seed Packs & Souvenir Bookmark', description: 'Native flowering seed packets promoting urban gardening for each household.', estCostInr: Math.round(brief.totalBudgetInr * 0.01) },
    ],
    risks: [
      { risk: 'Noise complaint leading to premature police shutdown', mitigation: 'Adhere strictly to 10 PM sound curfew and keep decibel meter on sound desk.' },
      { risk: 'Crowd bottlenecks around food counters', mitigation: 'Create separate one-way entry and exit lanes for meal distribution.' },
      { risk: 'Tripping hazard from temporary outdoor power cables', mitigation: 'Cover all ground wires with heavy-duty rubber cable ramps.' },
    ],
    confidence: 0.95,
  };
}

/**
 * Builds deterministic creative ideas when AI call is rate-limited or unavailable.
 */
export function buildFallbackIdeas(brief: Brief, tweak: string): IdeasResponse {
  const tweakLower = (tweak || '').toLowerCase();
  const isEco = tweakLower.includes('eco') || tweakLower.includes('green') || tweakLower.includes('waste');
  const isBudget = tweakLower.includes('budget') || tweakLower.includes('cheap') || tweakLower.includes('low') || tweakLower.includes('save');
  const isTraditional = tweakLower.includes('tradition') || tweakLower.includes('heritage') || tweakLower.includes('cultural') || tweakLower.includes('classic');

  const budgetUnit = Math.round(brief.totalBudgetInr / 100);

  let ideas: Idea[] = [];

  if (isEco) {
    ideas = [
      {
        type: 'decor',
        title: 'Potted Herb & Brass Urli Centerpieces',
        description: 'Living centerpieces featuring holy basil, mint, and local jasmine in reusable terracotta and brass vessels, gifted to guests at closing.',
        estCostInr: budgetUnit * 2,
      },
      {
        type: 'menu',
        title: 'Zero-Waste Seasonal Live Counters',
        description: 'Farm-to-table regional dishes served on compostable pressed areca nut leaves, with on-site segregated organic composting bins.',
        estCostInr: budgetUnit * 5,
      },
      {
        type: 'gift',
        title: 'Plantable Seed-Paper Keepsakes',
        description: 'Artisanal gift tags and sweets boxes embedded with marigold and wildflower seeds that guests can plant at home.',
        estCostInr: budgetUnit * 1,
      },
      {
        type: 'activity',
        title: 'Community Tree Blessing & Memory Wall',
        description: 'Guests tie cotton blessing threads around an auspicious venue tree and sign digital memory tablets instead of paper guestbooks.',
        estCostInr: budgetUnit * 1,
      },
      {
        type: 'theme',
        title: 'Nature-Inspired Minimalist Elegance',
        description: 'Earthy neutral tones, handloom khadi table runners, and warm fairy lights replacing single-use plastic installations.',
        estCostInr: budgetUnit * 3,
      },
      {
        type: 'entertainment',
        title: 'Acoustic Folk & Classical Sitar Duo',
        description: 'Low-amplification live classical music creating intimate ambiance while respecting sound conservation.',
        estCostInr: budgetUnit * 2,
      },
    ];
  } else if (isBudget) {
    ideas = [
      {
        type: 'decor',
        title: 'Fairy Light Canopy & Local Marigold Drapes',
        description: 'High-impact, budget-friendly lighting using warm string bulbs and bulk local genda phool to create grand celebration photos.',
        estCostInr: Math.round(budgetUnit * 1.5),
      },
      {
        type: 'menu',
        title: 'Curated 3-Course Regional Specialties',
        description: 'Streamline menu to 4 blockbuster starters and authentic regional mains, cutting catering waste and reducing per-plate cost.',
        estCostInr: budgetUnit * 4,
      },
      {
        type: 'activity',
        title: 'DIY Polaroid & QR Code Photo Corner',
        description: 'A cozy decorated photo frame station with props where guests snap polaroids and upload directly to a shared family drive.',
        estCostInr: Math.round(budgetUnit * 0.8),
      },
      {
        type: 'entertainment',
        title: 'Crowd-Sourced Celebration Playlist & Emcee Friend',
        description: 'Curate a crowd-favorite high-energy playlist with a charismatic friend or family cousin acting as the evening host.',
        estCostInr: 0,
      },
      {
        type: 'gift',
        title: 'Handmade Mithai or Artisanal Spice Jars',
        description: 'Small branded glass jars of regional chai masala or freshly prepared pinni/laddoo wrapped in jute twine.',
        estCostInr: Math.round(budgetUnit * 0.7),
      },
      {
        type: 'theme',
        title: 'Celebration of Lights & Colors',
        description: 'Focus on color blocking with family dupattas, brass diyas, and candle clusters that feel luxurious without designer fees.',
        estCostInr: budgetUnit * 1,
      },
    ];
  } else if (isTraditional) {
    ideas = [
      {
        type: 'theme',
        title: 'Royal Heritage & Traditional Motifs',
        description: 'Temple architecture arches, mogra garlands, and deep crimson and turmeric yellow fabrics evoking timeless Indian splendor.',
        estCostInr: budgetUnit * 3,
      },
      {
        type: 'menu',
        title: 'Traditional Royal Thali Experience',
        description: 'Authentic heritage banquet served with regional delicacies, live ghee rotis, and traditional warm jalebi rabdi counter.',
        estCostInr: budgetUnit * 6,
      },
      {
        type: 'entertainment',
        title: 'Traditional Shehnai & Dhol Welcome',
        description: 'Auspicious live shehnai notes at the entrance to welcome guests followed by spirited folk dhol performance.',
        estCostInr: budgetUnit * 2,
      },
      {
        type: 'decor',
        title: 'Brass Diya Wall & Fresh Floral Mandap',
        description: 'Grand backdrop composed of hundreds of flickering brass oil lamps and cascading fresh tuberose (rajnigandha).',
        estCostInr: budgetUnit * 4,
      },
      {
        type: 'activity',
        title: 'Bangles & Mehendi Artisan Corner',
        description: 'Dedicated live bangle-fitting stall and rapid mehendi artists offering personalized henna motifs to guests.',
        estCostInr: budgetUnit * 1,
      },
      {
        type: 'gift',
        title: 'Silver Coin or Brass Keepsake in Brocade Pouch',
        description: 'Auspicious souvenir enclosed in handcrafted Banarasi brocade potli with custom printed thank-you card.',
        estCostInr: Math.round(budgetUnit * 1.5),
      },
    ];
  } else {
    ideas = [
      {
        type: 'theme',
        title: 'Vibrant Celebration & Modern Indian Elegance',
        description: 'Festive palette combining rich jewel tones with clean contemporary styling tailored to ' + brief.city + ' climate.',
        estCostInr: budgetUnit * 3,
      },
      {
        type: 'menu',
        title: 'Interactive Live Food Stations & Street Chaat Bar',
        description: 'Popular artisanal live counters with fresh chaat, artisanal mocktails, and decadent hot dessert spreads.',
        estCostInr: budgetUnit * 5,
      },
      {
        type: 'decor',
        title: 'Statement Floral Arch & Ambient Illumination',
        description: 'Signature photo entryway with seasonal blooms and warm uplighting that transforms the space from day to dusk.',
        estCostInr: budgetUnit * 3,
      },
      {
        type: 'entertainment',
        title: 'High-Energy DJ & Live Percussionist Jam',
        description: 'DJ set synchronized with live percussionist/darbuka player to get all generations dancing together.',
        estCostInr: budgetUnit * 2,
      },
      {
        type: 'activity',
        title: 'Interactive Guest Wish Canvas & Video Booth',
        description: 'A dedicated station where guests record 15-second heartfelt video wishes and sign an artistic canvas frame.',
        estCostInr: budgetUnit * 1,
      },
      {
        type: 'gift',
        title: 'Artisanal Gourmet Hampers & Local Specialty',
        description: 'Custom packaged boxes of premium dry fruits and regional sweets reflecting the culinary pride of ' + brief.city + '.',
        estCostInr: budgetUnit * 2,
      },
    ];
  }

  return {
    ideas,
    note: tweak
      ? `Tailored 6 personalized ideas reflecting your adjustment: "${tweak.slice(0, 80)}" for ${brief.guestCount} guests in ${brief.city}.`
      : `Tailored celebration ideas matching your ${brief.eventType} budget and vibe.`,
  };
}

/**
 * Builds deterministic practical event planning answers when AI is rate-limited or offline.
 */
export function buildFallbackAssist(
  question: string,
  brief: Brief,
  planSummary: string,
  spentTotalInr: number
): AssistResponse {
  const q = question.toLowerCase();
  const remainingInr = Math.max(0, brief.totalBudgetInr - spentTotalInr);

  if (q.includes('priority') || q.includes('lock down') || q.includes('first') || q.includes('start') || q.includes('week')) {
    return {
      answer: `**Top Priorities for this Stage:**\n\n1. **Lock Venue & Dates:** In ${brief.city}, top venues book out months in advance. Secure the contract and ensure guest capacity (${brief.guestCount} guests) is comfortable.\n2. **Book Core Vendors:** Caterer and primary photographer should be locked immediately after the venue, as quality teams take only 1-2 events per date.\n3. **Budget Milestone:** You have ₹${remainingInr.toLocaleString('en-IN')} remaining of your ₹${brief.totalBudgetInr.toLocaleString('en-IN')} budget. Keep 10% uncommitted as your buffer reserve.\n4. **Family Alignment:** Confirm ritual timings with elders or officiants before locking vendor schedules.`,
      followUps: [
        `How do we negotiate vendor payment milestones safely?`,
        `What questions should we ask the venue before paying deposit?`,
        `How can we trim catering costs without cutting food quality?`,
      ],
      caveat: `Always review venue contracts for hidden electricity, generator backup, and vendor corkage charges before signing.`,
    };
  }

  if (q.includes('decor') || q.includes('catering') || q.includes('save') || q.includes('budget') || q.includes('cost') || q.includes('optimize') || q.includes('charm')) {
    return {
      answer: `**Practical Budget Optimization Tips:**\n\n- **Catering Efficiency:** Limit appetizers to 4 high-demand live items instead of 8. Guests remember taste and temperature, not menu page count.\n- **Seasonal Floral Decor:** Replace imported exotic flowers with abundant local marigold, tuberose (rajnigandha), and mogra. They look grander and cost 60% less.\n- **Lighting Over Props:** Strategic amber fairy lights, warm uplights, and brass diyas create luxury atmosphere at a fraction of fabrication costs.\n- **Shared Setup:** If having multi-day functions, reuse stage backdrop framing with slight fabric and floral tweaks.`,
      followUps: [
        `What is the best way to track small cash expenses on event days?`,
        `How many waiters per guest should we demand from the caterer?`,
        `Can we bring our own sweets or desserts to save on package rate?`,
      ],
      caveat: `Confirm with your venue if outside catering or decorators incur royalty or mandatory vendor commission fees.`,
    };
  }

  if (q.includes('permission') || q.includes('police') || q.includes('noise') || q.includes('sound') || q.includes('rule') || q.includes('noc')) {
    return {
      answer: `**Civic & Legal Permissions in ${brief.city}:**\n\n1. **Sound Curfew:** Outdoor amplified music strictly stops at 10:00 PM per Supreme Court regulations. Plan for silent disco or indoor banquet transition afterwards.\n2. **Police & Traffic NOC:** If holding a baraat procession, street rally, or over 300 guests on public access roads, obtain local police station clearance 15 days ahead.\n3. **Fire & Electrical Clearance:** Required for temporary pandals or lawn tents exceeding 500 sq meters. Ensure fire extinguishers are visible near kitchens.\n4. **PPL / IPRS Music Licenses:** Required if hiring a commercial DJ playing copyrighted music in commercial premises.`,
      followUps: [
        `Does the banquet hall handle sound permits or do we?`,
        `What are the penalties for exceeding 10 PM sound curfew?`,
        `How do we manage guest parking to avoid local traffic police towing?`,
      ],
      caveat: `Verify exact municipal corporation and police station guidelines in ${brief.city} as local enforcement varies.`,
    };
  }

  if (q.includes('photograph') || q.includes('video') || q.includes('shoot')) {
    return {
      answer: `**Photographer Selection & Contract Rules:**\n\n- **Team Composition:** Ensure you get at least 2 candid photographers + 1 traditional stage photographer + 1 drone operator for key outdoor moments.\n- **Deliverables Timeline:** Put delivery dates in the contract (e.g. 10 preview teaser photos in 48 hours, trailer in 20 days, full raw video & edited album within 60 days).\n- **Food & Crew Care:** Include the photographer and crew in your catering headcount so they stay energized during long ritual hours.\n- **Shot List:** Give a designated family member the role of guiding the photographer to key elders and must-have group shots.`,
      followUps: [
        `What payment schedule is standard for Indian wedding photographers?`,
        `Do we need raw unedited video footage in hard drive?`,
        `How do we get great photos during rapid ritual moments?`,
      ],
      caveat: `Always ask to view full uncut galleries of an entire real wedding, not just curated Instagram highlights.`,
    };
  }

  // General planning answer
  return {
    answer: `**Jashn Planning Guidance for "${brief.title}":**\n\n- **Focus on Experience:** For ${brief.guestCount} guests in ${brief.city}, prioritize comfortable seating, prompt food service, and clear directional signs.\n- **Financial Health:** Total budget is ₹${brief.totalBudgetInr.toLocaleString('en-IN')}, with ₹${spentTotalInr.toLocaleString('en-IN')} allocated. Ensure remaining ₹${remainingInr.toLocaleString('en-IN')} covers remaining high-impact categories.\n- **Next Concrete Action:** Review your timeline checklist, assign each upcoming milestone to one dedicated family coordinator, and re-confirm vendor arrival times.\n- **Contingency Ready:** Keep emergency contacts, safety pins, extra cash, and medical first-aid kit readily accessible in the coordinator's kit.`,
    followUps: [
      `What should be our top priority to lock down this week?`,
      `How can we optimize decor & catering without losing celebration charm?`,
      `What civic or noise permissions should we be mindful of in this city?`,
    ],
    caveat: `Estimates and suggestions are for guidance. Always confirm details directly with your local vendors and municipal rules.`,
  };
}
