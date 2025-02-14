import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectId } from "mongodb";

@Entity("subscriptions")
export class Subscriptions {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ type: "uuid" })
  user_id!: string;

  @Column()
  plan_id!: string;

  @Column({
    type: "enum",
    enum: ["ACTIVE", "CANCELED", "EXPIRED", "SUSPENDED", "PENDING"],
    default: "PENDING",
  })
  status!: string;

  @Column({ type: "timestamp", nullable: true })
  start_time!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  next_billing_time!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  last_payment_date!: Date | null;

  @Column({
    type: "enum",
    enum: ["SUCCESS", "FAILED"],
    nullable: true,
  })
  last_payment_status!: string | null;

  @Column({ nullable: true })
  failure_reason!: string | null;

  @Column({ type: "timestamp", nullable: true })
  cancellation_date!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
