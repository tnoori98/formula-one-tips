import { EntitySchema } from 'typeorm';
import { Tip } from './tip-entity';
import { UserTip } from './user-tip-entity';

export interface Event {
  id: number;
  event_date: Date;
  name: string;
  is_active: boolean;
  tips: Tip[];
  user_tips: UserTip[];
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const EventEntity = new EntitySchema<Event>({
  name: 'Event',
  tableName: 'events',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      length: 255,
    },
    event_date: {
      type: 'timestamp',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  relations: {
    tips: {
      type: 'one-to-many',
      target: 'Tip',
      inverseSide: 'event',
    },
    user_tips: {
      type: 'one-to-many',
      target: 'UserTip',
      inverseSide: 'event',
    },
  },
});