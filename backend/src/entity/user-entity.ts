import { EntitySchema } from 'typeorm';
import { UserTip } from './user-tip-entity';

export interface User {
  id: number;
  username: string;
  salt: string | null;
  password: string;
  role: string;
  points: number;
  tips: UserTip[];
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export const UserEntity = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    username: {
      type: String,
      length: 255,
    },
    salt: {
      type: String,
      length: 255,
      nullable: true,
    },
    password: {
      type: String,
      length: 255,
    },
    role: {
      type: String,
      length: 50,
      default: 'user',
    },
    points: {
      type: Number,
      default: 0,
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
      target: 'UserTip',
      inverseSide: 'user',
    }
  }
});
