import { z } from 'zod';
import {
  EventType,
  Constraint,
  WeddingFunction,
  Category,
  CommunityKind,
  BriefBaseSchema,
  BriefSchema,
} from '@/schemas/brief';
import {
  BudgetLineSchema,
  TaskSchema,
  VendorSchema,
  IdeaType,
  IdeaSchema,
  RiskSchema,
  PlanResponseSchema,
  IdeasResponseSchema,
  AssistResponseSchema,
} from '@/schemas/plan';
import {
  VendorStatus,
  EventStateSchema,
  EventRecordSchema,
  StoreSchema,
} from '@/schemas/storage';
import {
  PlanRequestSchema,
  IdeasRequestSchema,
  AssistRequestSchema,
} from '@/schemas/api';

export type EventType = z.infer<typeof EventType>;
export type Constraint = z.infer<typeof Constraint>;
export type WeddingFunction = z.infer<typeof WeddingFunction>;
export type Category = z.infer<typeof Category>;
export type CommunityKind = z.infer<typeof CommunityKind>;
export type Brief = z.infer<typeof BriefSchema>;
export type BriefBase = z.infer<typeof BriefBaseSchema>;

export type BudgetLine = z.infer<typeof BudgetLineSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Vendor = z.infer<typeof VendorSchema>;
export type IdeaType = z.infer<typeof IdeaType>;
export type Idea = z.infer<typeof IdeaSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type PlanResponse = z.infer<typeof PlanResponseSchema>;
export type IdeasResponse = z.infer<typeof IdeasResponseSchema>;
export type AssistResponse = z.infer<typeof AssistResponseSchema>;

export type VendorStatus = z.infer<typeof VendorStatus>;
export type EventState = z.infer<typeof EventStateSchema>;
export type EventRecord = z.infer<typeof EventRecordSchema>;
export type Store = z.infer<typeof StoreSchema>;

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type IdeasRequest = z.infer<typeof IdeasRequestSchema>;
export type AssistRequest = z.infer<typeof AssistRequestSchema>;

