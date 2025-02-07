import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionLog } from './transaction-log.entity';

// TODO(@pk3roots): add index
@Entity('transaction_status')
export class TransactionStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_type', type: 'varchar', length: 50 })
  paymentType: string;

  @Column()
  amount: number;

  @Column({ type: 'varchar', length: 5 })
  currency: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  source?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  userRefId: string;

  @Column({ type: 'varchar', length: 10 })
  provider: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  providerRefId?: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  productId: string;

  @Column({ type: 'varchar', length: 10 })
  status: string;

  @Column('jsonb', { default: {} })
  metadata: object;

  @OneToMany(() => TransactionLog, (transactionLog) => transactionLog.transactionStatus, { cascade: true })
  transactionLogs: TransactionLog[];

  @Column({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt?: Date;
}
