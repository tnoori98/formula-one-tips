import { EntitySchema } from 'typeorm';
import { TipOption } from './tip-options-entity';
import { Event } from './event-entity';
import { UserTip } from './user-tip-entity';

export interface Tip {
  id: number;
  question: string;
  event: Event;
  tip_options: TipOption[];
  user_tips: UserTip[];
  correct_tip_option: TipOption | null;
  points: number;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const TipEntity = new EntitySchema<Tip>({
  name: 'Tip',
  tableName: 'tips',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    question: {
      type: String,
    },
    points: {
      type: Number,
      default: 10,
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
    event: {
      type: 'many-to-one',
      target: 'Event',
      inverseSide: 'tips',
      joinColumn: true,
    },
    tip_options: {
      type: 'one-to-many',
      target: 'TipOption',
      inverseSide: 'tip',
    },
    user_tips: {
      type: 'one-to-many',
      target: 'UserTip',
      inverseSide: 'tip',
    },
    correct_tip_option: {
      type: 'many-to-one',
      target: 'TipOption',
      joinColumn: { name: 'correct_tip_option_id' },
      nullable: true,
    },
  },
});