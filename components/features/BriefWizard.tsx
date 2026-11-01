'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  EventType,
  Constraint,
  WeddingFunction,
  CommunityKind,
  Brief,
  EventRecord,
} from '@/types';
import { BriefBaseSchema, validateEventDateBounds } from '@/schemas/brief';
import { generateUuid, saveEvent } from '@/lib/storage';
import { useAI } from '@/hooks/useAI';
import { formatInr } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { useToast } from '@/components/ui/Toast';
import {
  Heart,
  Cake,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
} from 'lucide-react';

const weddingFunctionOptions: { value: WeddingFunction; label: string }[] = [
  { value: 'engagement', label: 'Engagement / Roka' },
  { value: 'haldi', label: 'Haldi' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'sangeet', label: 'Sangeet' },
  { value: 'ceremony', label: 'Wedding Ceremony' },
  { value: 'reception', label: 'Grand Reception' },
];

const constraintOptions: { value: Constraint; label: string; desc: string }[] = [
  { value: 'vegetarian_only', label: 'Pure Vegetarian', desc: 'No meat or seafood' },
  { value: 'jain_friendly', label: 'Jain Friendly', desc: 'No root vegetables/onion/garlic' },
  { value: 'alcohol_free', label: 'Alcohol Free', desc: 'Signature mocktails only' },
  { value: 'kid_friendly', label: 'Kid Friendly', desc: 'Safe spaces & child entertainment' },
  { value: 'accessible', label: 'Senior & Wheelchair Friendly', desc: 'Elevators & ramps' },
  { value: 'low_waste', label: 'Eco & Low Waste', desc: 'Biodegradable decor & cutlery' },
  { value: 'outdoor', label: 'Outdoor Setting', desc: 'Open lawns or courtyards' },
  { value: 'indoor', label: 'Indoor Hall', desc: 'Air-conditioned banquet' },
];

const communityOptions: { value: CommunityKind; label: string }[] = [
  { value: 'festival', label: 'Festive Celebration (Diwali, Eid, etc.)' },
  { value: 'cultural', label: 'Cultural / Heritage Meet' },
  { value: 'society_meet', label: 'Residential Society Gathering' },
  { value: 'sports', label: 'Community Sports Tournament' },
  { value: 'fundraiser', label: 'Charity & Fundraiser' },
  { value: 'other', label: 'Other Civic Program' },
];

const vibeSuggestions = [
  'Royal heritage with traditional marigolds, live shehnai & regional thali.',
  'Intimate fairy-lit evening with acoustic sufi music and artisanal live counters.',
  'High-energy celebration with vibrant DJ dance floor, neon lights & fusion chaat.',
];

const rotatingStatusMessages = [
  'Jashn is consulting experienced planning blueprints…',
  'Analyzing Indian regional rates and seasonal vendor norms…',
  'Crafting task timeline and critical milestone offsets…',
  'Balancing contingency reserve and budget percentages to exact 100%…',
  'Finalizing your customized celebration workspace…',
];

export function BriefWizard() {
  const router = useRouter();
  const { generatePlan, isPlanning } = useAI();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [statusIndex, setStatusIndex] = useState(0);

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [totalBudgetInr, setTotalBudgetInr] = useState<number>(1000000);
  const [weddingFunctions, setWeddingFunctions] = useState<WeddingFunction[]>([
    'sangeet',
    'ceremony',
    'reception',
  ]);
  const [honoreeAge, setHonoreeAge] = useState<number | null>(30);
  const [communityKind, setCommunityKind] = useState<CommunityKind>('cultural');
  const [vibe, setVibe] = useState('');
  const [constraints, setConstraints] = useState<Constraint[]>([]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cycle rotating messages during planning
  useEffect(() => {
    if (!isPlanning) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % rotatingStatusMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlanning]);

  // Derived: cost per guest
  const costPerGuest = Math.round(totalBudgetInr / Math.max(1, guestCount));

  // Today reference for date input
  const todayStr = new Date().toISOString().slice(0, 10);

  // Step 1 validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    } else if (title.trim().length > 80) {
      newErrors.title = 'Title cannot exceed 80 characters.';
    }

    if (!city.trim() || city.trim().length < 2) {
      newErrors.city = 'Please enter a valid city name.';
    }

    if (!eventDate) {
      newErrors.eventDate = 'Please select your celebration date.';
    } else {
      const dateCheck = validateEventDateBounds(eventDate, todayStr);
      if (!dateCheck.valid && dateCheck.error) {
        newErrors.eventDate = dateCheck.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 validation
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (guestCount < 2 || guestCount > 5000) {
      newErrors.guestCount = 'Guest count must be between 2 and 5,000.';
    }
    if (totalBudgetInr < 5000 || totalBudgetInr > 100_000_000) {
      newErrors.totalBudgetInr = 'Budget must be between ₹5,000 and ₹10,00,00,000.';
    }
    if (eventType === 'wedding' && weddingFunctions.length === 0) {
      newErrors.weddingFunctions = 'Select at least one wedding function to plan.';
    }
    if (eventType === 'birthday' && (honoreeAge === null || honoreeAge < 0 || honoreeAge > 110)) {
      newErrors.honoreeAge = 'Enter a valid age between 0 and 110.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleWeddingFunction = (fn: WeddingFunction) => {
    setWeddingFunctions((prev) =>
      prev.includes(fn) ? prev.filter((item) => item !== fn) : [...prev, fn]
    );
  };

  const toggleConstraint = (c: Constraint) => {
    setConstraints((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    const rawBrief = {
      eventType,
      title: title.trim(),
      eventDate,
      city: city.trim(),
      guestCount,
      totalBudgetInr,
      vibe: vibe.trim(),
      constraints,
      weddingFunctions: eventType === 'wedding' ? weddingFunctions : [],
      honoreeAge: eventType === 'birthday' ? honoreeAge : null,
      communityKind: eventType === 'community' ? communityKind : null,
    };

    const parsedBrief = BriefBaseSchema.safeParse(rawBrief);
    if (!parsedBrief.success) {
      showToast('Please fix the errors in your event brief', 'error');
      return;
    }

    const { plan, source } = await generatePlan(parsedBrief.data);

    const newRecord: EventRecord = {
      id: generateUuid(),
      createdAt: new Date().toISOString(),
      source,
      brief: parsedBrief.data,
      plan,
      state: {
        spentByCategory: {},
        completedTaskIds: [],
        vendorStatus: {},
      },
    };

    const saveRes = saveEvent(newRecord);
    if (!saveRes.success) {
      showToast(saveRes.error || 'Failed to save event', 'error');
      return;
    }

    showToast(
      source === 'fallback'
        ? 'Created plan from standard Indian celebration blueprint.'
        : 'Celebration plan drafted successfully!',
      'success'
    );

    router.push(`/event/${newRecord.id}`);
  };

  if (isPlanning) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className="flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto my-12"
      >
        <div className="w-20 h-20 rounded-full bg-accent-soft flex items-center justify-center text-accent mb-6 animate-pulse">
          <Sparkles className="w-10 h-10 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="text-2xl md:text-3xl font-heading font-black text-ink mb-3">
          Jashn is planning your celebration…
        </h2>
        <p className="text-primary font-medium text-base md:text-lg mb-4 min-h-[3rem] transition-all duration-300">
          {rotatingStatusMessages[statusIndex]}
        </p>
        <p className="text-ink-muted text-xs max-w-sm">
          Generating structured milestones, allocating budget lines, and establishing vendor checklists.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {/* Wizard Step Progress */}
      <div className="mb-8" aria-label="Wizard Steps">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
          <span className={step >= 1 ? 'text-primary font-bold' : ''}>1. Basics</span>
          <span className={step >= 2 ? 'text-primary font-bold' : ''}>2. Scale & Budget</span>
          <span className={step >= 3 ? 'text-primary font-bold' : ''}>3. Taste & Vibe</span>
        </div>
        <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-ink mb-1">
              What are we celebrating?
            </h1>
            <p className="text-ink-muted text-sm">
              Select your celebration format to tune custom timelines and budget norms.
            </p>
          </div>

          {/* Event Type Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: 'wedding' as EventType, label: 'Wedding', icon: Heart, desc: 'Multi-day rituals & grand reception' },
              { type: 'birthday' as EventType, label: 'Birthday', icon: Cake, desc: 'Kids, milestone, or family gala' },
              { type: 'community' as EventType, label: 'Community', icon: Users, desc: 'Festivals, society meets & sports' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = eventType === item.type;
              return (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setEventType(item.type)}
                  className={`p-4 rounded-xl border text-left transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-surface hover:bg-surface-2'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-ink-muted'}`}
                    aria-hidden="true"
                  />
                  <div className="font-bold text-ink text-base">{item.label}</div>
                  <div className="text-xs text-ink-muted mt-1 leading-snug">{item.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-semibold text-ink mb-1.5">
              Celebration Title <span className="text-danger">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                eventType === 'wedding'
                  ? 'e.g., Aarav & Diya Wedding'
                  : eventType === 'birthday'
                  ? "e.g., Kabir's 7th Superhero Birthday"
                  : 'e.g., Diwali Society Mela 2026'
              }
              aria-describedby={errors.title ? 'error-title' : undefined}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
            />
            {errors.title && (
              <p id="error-title" role="alert" className="text-danger text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Date & City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-date" className="block text-sm font-semibold text-ink mb-1.5">
                Event Date <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  id="event-date"
                  type="date"
                  required
                  min={todayStr}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  aria-describedby={errors.eventDate ? 'error-date' : undefined}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
                />
              </div>
              {errors.eventDate && (
                <p id="error-date" role="alert" className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.eventDate}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="event-city" className="block text-sm font-semibold text-ink mb-1.5">
                Host City / Region <span className="text-danger">*</span>
              </label>
              <input
                id="event-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Jaipur, Bengaluru, Mumbai"
                aria-describedby={errors.city ? 'error-city' : undefined}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              />
              {errors.city && (
                <p id="error-city" role="alert" className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.city}</span>
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button" variant="primary" size="md" onClick={handleNext}>
              <span>Next: Scale & Budget</span>
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: SCALE & BUDGET */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-ink mb-1">
              Scale & Budget
            </h1>
            <p className="text-ink-muted text-sm">
              Deterministic engines will allocate these amounts exactly to the rupee.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest-count" className="block text-sm font-semibold text-ink mb-1.5">
                Expected Guests <span className="text-danger">*</span>
              </label>
              <input
                id="guest-count"
                type="number"
                min={2}
                max={5000}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                aria-describedby={errors.guestCount ? 'error-guests' : undefined}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              />
              {errors.guestCount && (
                <p id="error-guests" role="alert" className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.guestCount}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="total-budget" className="block text-sm font-semibold text-ink mb-1.5">
                Total Budget (INR) <span className="text-danger">*</span>
              </label>
              <input
                id="total-budget"
                type="number"
                min={5000}
                max={100000000}
                step={5000}
                required
                value={totalBudgetInr}
                onChange={(e) => setTotalBudgetInr(Number(e.target.value))}
                aria-describedby="budget-helper"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              />
              <div id="budget-helper" className="text-xs text-ink-muted mt-1.5 font-medium">
                {formatInr(totalBudgetInr)} • ≈ <span className="text-primary font-semibold">{formatInr(costPerGuest)}</span> per guest
              </div>
              {errors.totalBudgetInr && (
                <p role="alert" className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.totalBudgetInr}</span>
                </p>
              )}
            </div>
          </div>

          {/* Type-specific inputs */}
          {eventType === 'wedding' && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Wedding Functions to Include <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {weddingFunctionOptions.map((fn) => {
                  const isChecked = weddingFunctions.includes(fn.value);
                  return (
                    <button
                      type="button"
                      key={fn.value}
                      onClick={() => toggleWeddingFunction(fn.value)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all min-h-[44px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isChecked
                          ? 'border-primary bg-primary-ink text-primary shadow-sm ring-1 ring-primary'
                          : 'border-border bg-surface text-ink-muted hover:bg-surface-2'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-border bg-surface'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span>{fn.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.weddingFunctions && (
                <p role="alert" className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.weddingFunctions}</span>
                </p>
              )}
            </div>
          )}

          {eventType === 'birthday' && (
            <div>
              <label htmlFor="honoree-age" className="block text-sm font-semibold text-ink mb-1.5">
                Honoree Age
              </label>
              <input
                id="honoree-age"
                type="number"
                min={0}
                max={110}
                value={honoreeAge ?? ''}
                onChange={(e) => setHonoreeAge(e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g., 1st, 18th, 30th, 60th"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              />
              {errors.honoreeAge && (
                <p role="alert" className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{errors.honoreeAge}</span>
                </p>
              )}
            </div>
          )}

          {eventType === 'community' && (
            <div>
              <label htmlFor="community-kind" className="block text-sm font-semibold text-ink mb-1.5">
                Community Event Kind
              </label>
              <select
                id="community-kind"
                value={communityKind ?? 'cultural'}
                onChange={(e) => setCommunityKind(e.target.value as CommunityKind)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
              >
                {communityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button type="button" variant="outline" size="md" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>Back</span>
            </Button>
            <Button type="button" variant="primary" size="md" onClick={handleNext}>
              <span>Next: Taste & Vibe</span>
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: TASTE & VIBE */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-ink mb-1">
              Taste, Vibe & Dietary Needs
            </h1>
            <p className="text-ink-muted text-sm">
              Tell Jashn your aesthetic preferences and strict dietary/accessibility boundaries.
            </p>
          </div>

          {/* Vibe Free Text */}
          <div>
            <label htmlFor="vibe-text" className="block text-sm font-semibold text-ink mb-1.5">
              Celebration Vibe & Personal Notes
            </label>
            <textarea
              id="vibe-text"
              rows={3}
              maxLength={500}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g., Deep marigold colors, minimalist eco-friendly decor, acoustic live music, focus on regional desserts…"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-ink text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <div className="flex justify-between items-center text-xs text-ink-muted mt-1">
              <span>Click a prompt to inspire:</span>
              <span>{vibe.length}/500</span>
            </div>

            {/* Clickable prompt suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {vibeSuggestions.map((prompt, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setVibe(prompt)}
                  className="text-xs px-2.5 py-1 rounded-md bg-surface-2 text-ink-muted hover:text-ink hover:bg-border transition-colors text-left"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Constraints Chips */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Special Guidelines & Constraints
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {constraintOptions.map((c) => {
                const isSelected = constraints.includes(c.value);
                return (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => toggleConstraint(c.value)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? 'border-accent bg-accent-soft/30 ring-1 ring-accent'
                        : 'border-border bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-accent border-accent text-white' : 'border-border bg-surface'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{c.label}</div>
                      <div className="text-xs text-ink-muted leading-tight">{c.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button type="button" variant="outline" size="md" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>Back</span>
            </Button>
            <Button type="submit" variant="primary" size="lg">
              <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
              <span>Generate Jashn Plan</span>
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
