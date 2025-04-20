import { EntitySchema } from 'typeorm';
import { Driver } from './driver-entity';

export interface Team {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  drivers: Driver[];
}

export const TeamEntity = new EntitySchema<Team>({
  name: 'Team',
  tableName: 'teams',
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
    drivers: {
      type: 'one-to-many',
      target: 'Driver',
      inverseSide: 'team',
    },
  },
});
