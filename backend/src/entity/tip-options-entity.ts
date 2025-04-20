import { EntitySchema } from 'typeorm';
import { Tip } from './tip-entity';

export interface TipOption {
  id: number;
  answer: string;
  tip: Tip;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const TipOptionEntity = new EntitySchema<TipOption>({
  name: 'TipOption',
  tableName: 'tip_options',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    answer: {
      type: String,
      length: 255,
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
    tip: {
      type: 'many-to-one',
      target: 'Tip',
      inverseSide: 'tip_options',
      joinColumn: true,
    },
  },
});