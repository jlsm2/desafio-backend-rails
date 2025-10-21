import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  ChildEntity,
  OneToMany,
} from 'typeorm';
import { AutorTipo } from '../enums/autor-tipo.enum';
import { Material } from '../../material/entities/material.entity';

// --- CLASSE MÃE (BASE) ---
@Entity('autor')
@TableInheritance({
  column: { type: 'varchar', name: 'tipo_autor' },
})
export abstract class Autor {
  @PrimaryGeneratedColumn()
  id_autor: number;

  @Column({
    type: 'varchar',
    length: 120,
    nullable: false,
  })
  nome: string;

  @OneToMany(() => Material, (material) => material.autor)
  materiais: Material[];

  @Column({
    type: 'enum',
    enum: AutorTipo,
  })
  tipo_autor: AutorTipo;
}

// --- CLASSE FILHA: PESSOA ---
@ChildEntity(AutorTipo.PESSOA)
export class AutorPessoa extends Autor {
  @Column({ type: 'date', nullable: true })
  data_nascimento: Date;
}

// --- CLASSE FILHA: INSTITUIÇÃO ---
@ChildEntity(AutorTipo.INSTITUICAO)
export class AutorInstituicao extends Autor {
  @Column({ type: 'varchar', length: 80, nullable: true })
  cidade: string;
}