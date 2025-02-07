import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionStatus } from './transaction-status.entity';

// TODO(@pk3roots): add index
@Entity('transaction_log')
export class TransactionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  status: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  channel?: string; // 'api' OR 'webhook'

  @Column({ name: 'event_key', type: 'varchar', length: 20, nullable: true })
  eventKey?: string; // 'charge.create', 'charge.complete', ...

  @ManyToOne(() => TransactionStatus, (transactionStatus) => transactionStatus.transactionLogs, { nullable: true })
  transactionStatus: TransactionStatus;

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
