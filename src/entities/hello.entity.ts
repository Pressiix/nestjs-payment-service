import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnDatetimeTransformer } from './transformer/column-datetime.transformer';

@Entity('foo')
export class Hello {
  @PrimaryColumn({ name: 'id', type: 'integer', nullable: false })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: false, transformer: new ColumnDatetimeTransformer() })
  createAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: true,
    default: null,
    transformer: new ColumnDatetimeTransformer(),
  })
  updateAt?: Date;
}
