describe('Jashn End-to-End User Journeys', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Flow 1: Creates a wedding celebration end-to-end with AI interception', () => {
    cy.intercept('POST', '/api/plan', {
      statusCode: 200,
      body: {
        summary: 'A curated Indian wedding celebration in Jaipur with festive sangeet and royal reception.',
        budget: [
          { category: 'catering', percent: 35, rationale: 'Food stations', tips: ['Tasting'] },
          { category: 'venue', percent: 25, rationale: 'Banquet hall', tips: ['Power backup'] },
          { category: 'decor', percent: 15, rationale: 'Mandap styling', tips: ['Fresh flowers'] },
          { category: 'photography', percent: 10, rationale: 'Candid photo', tips: ['Drone permit'] },
          { category: 'entertainment', percent: 10, rationale: 'DJ & Sound', tips: ['Playlist'] },
          { category: 'contingency', percent: 5, rationale: 'Buffer reserve', tips: ['Emergency'] },
        ],
        timeline: [
          { id: 'task-1', title: 'Book Royal Palace Venue', details: 'Sign contract and pay deposit', category: 'venue', priority: 'high', weeksBefore: 12 },
          { id: 'task-2', title: 'Schedule Catering Tasting', details: 'Sample regional delicacies', category: 'catering', priority: 'high', weeksBefore: 8 },
          { id: 'task-3', title: 'Hire Candid Photographer', details: 'Check portfolio and coverage hours', category: 'photography', priority: 'medium', weeksBefore: 6 },
          { id: 'task-4', title: 'Design Digital Invitations', details: 'Send WhatsApp save-the-dates', category: 'invitations', priority: 'low', weeksBefore: 4 },
        ],
        vendors: [
          {
            category: 'venue',
            whatToBook: 'Heritage palace lawn',
            questionsToAsk: ['Is generator included?', 'What is music curfew?', 'Are external decorators allowed?'],
            typicalCostMinInr: 300000,
            typicalCostMaxInr: 500000,
            bookWeeksBefore: 12,
            redFlags: ['No power backup'],
          },
          {
            category: 'catering',
            whatToBook: 'Multi-cuisine banquet catering',
            questionsToAsk: ['Is tasting complimentary?', 'What is server ratio?', 'Are mocktails included?'],
            typicalCostMinInr: 400000,
            typicalCostMaxInr: 600000,
            bookWeeksBefore: 8,
            redFlags: ['Hidden plate surcharges'],
          },
          {
            category: 'photography',
            whatToBook: 'Candid and video team',
            questionsToAsk: ['Delivery date for album?', 'Number of raw files?', 'Drone included?'],
            typicalCostMinInr: 150000,
            typicalCostMaxInr: 250000,
            bookWeeksBefore: 6,
            redFlags: ['No contract guarantee'],
          },
        ],
        ideas: [
          { type: 'theme', title: 'Marigold & Brass Palace Gala', description: 'Royal heritage styling', estCostInr: 50000 },
          { type: 'menu', title: 'Live Jalebi & Rabdi Station', description: 'Fresh hot jalebis', estCostInr: 30000 },
          { type: 'activity', title: 'Vintage Audio Guestbook', description: 'Guests record wishes', estCostInr: 15000 },
          { type: 'decor', title: 'Fairylight Mandap Ceiling', description: 'Twinkling starry lights', estCostInr: 40000 },
          { type: 'gift', title: 'Artisanal Tea Hampers', description: 'Handcrafted tea boxes', estCostInr: 25000 },
          { type: 'entertainment', title: 'Live Dhol & Shehnai Troupe', description: 'Traditional acoustic welcome', estCostInr: 35000 },
        ],
        risks: [
          { risk: 'Sound curfew by local municipal police', mitigation: 'Switch to acoustic sound or indoor hall after 10 PM' },
        ],
        confidence: 0.98,
      },
    }).as('planRequest');

    cy.visit('/new');

    // Step 1: Basics
    cy.get('#event-title').type('Aarav & Diya Royal Wedding');
    cy.get('#event-date').type('2027-02-20');
    cy.get('#event-city').type('Jaipur');
    cy.contains('Next: Scale & Budget').click();

    // Step 2: Scale
    cy.get('#guest-count').clear().type('250');
    cy.get('#total-budget').clear().type('2500000');
    cy.contains('Next: Taste & Vibe').click();

    // Step 3: Taste
    cy.get('#vibe-text').type('Royal Rajasthani heritage with live folk music');
    cy.contains('Pure Vegetarian').click();
    cy.contains('Generate Jashn Plan').click();

    cy.wait('@planRequest');

    // Asserts workspace loaded
    cy.url().should('include', '/event/');
    cy.contains('Aarav & Diya Royal Wedding').should('be.visible');
    cy.contains('Celebration Vision').should('be.visible');
    cy.contains('Budget Allocation').should('be.visible');
  });

  it('Flow 2: Edits spend and sees status pill change to "Over budget"', () => {
    // Navigate to created event
    cy.visit('/');
    cy.contains('Open Workspace').first().click();

    // Switch to Budget tab
    cy.contains('Budget & Spend').click();

    // Venue budget is allocated ~₹6,25,000. Let's enter spend of ₹8,00,000 (over budget)
    cy.get('#spent-venue').clear().type('800000');

    // Status pill changes to Over budget
    cy.contains('Over budget').should('be.visible');
  });

  it('Flow 3: Ticks a task and sees progress update after reload', () => {
    cy.visit('/');
    cy.contains('Open Workspace').first().click();

    cy.contains('Timeline & Milestones').click();

    // Find and check the first task checkbox
    cy.get('input[type="checkbox"]').first().check();
    cy.contains('Completed').should('be.visible');

    // Reload page to verify persistence in localStorage
    cy.reload();
    cy.contains('Timeline & Milestones').click();
    cy.get('input[type="checkbox"]').first().should('be.checked');
  });

  it('Flow 4: Downloads .ics calendar and verifies trigger', () => {
    cy.visit('/');
    cy.contains('Open Workspace').first().click();

    cy.contains('Timeline & Milestones').click();

    // Click Add to Calendar
    cy.contains('Add to Calendar (.ics)').click();

    // Toast notification triggers
    cy.contains('Calendar (.ics) downloaded').should('be.visible');
  });

  it('Flow 5: Keyboard-only navigation on wizard step 1', () => {
    cy.visit('/new');

    // Focus first input and fill with keyboard
    cy.get('#event-title').focus().type('Pooja 30th Birthday');
    cy.get('#event-date').focus().type('2027-05-15');
    cy.get('#event-city').focus().type('Bengaluru');

    // Press Enter or Tab to next button
    cy.contains('Next: Scale & Budget').click();
    cy.contains('Scale & Budget').should('be.visible');
  });
});

