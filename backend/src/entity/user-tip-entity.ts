import { EntitySchema } from 'typeorm';
import { User } from './user-entity';
import { Tip } from './tip-entity';
import { Event } from './event-entity';
import { TipOption } from './tip-options-entity';

export interface UserTip {
  id: number;
  user: User;
  tip: Tip;
  selected_option: TipOption;
  is_correct: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const UserTipEntity = new EntitySchema<UserTip>({
  name: 'UserTip',
  tableName: 'user_tips',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    is_correct: {
      type: Boolean,
      default: false,
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
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'user_tips',
      joinColumn: true,
    },
    tip: {
      type: 'many-to-one',
      target: 'Tip',
      inverseSide: 'user_tips',
      joinColumn: true,
    },
    selected_option: {
      type: 'many-to-one',
      target: 'TipOption',
      joinColumn: { name: 'selected_option_id' },
    },
  },
});