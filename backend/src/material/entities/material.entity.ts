import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  ChildEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MaterialStatus } from '../enums/material-status.enum';
import { MaterialTipo } from '../enums/material-tipo.enum';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Autor } from '../../autor/entities/autor.entity';

// --- CLASSE MÃE (BASE) ---
@Entity('material')
@TableInheritance({
  column: { type: 'varchar', name: 'tipo_material' },
})
export abstract class Material {
  @PrimaryGeneratedColumn()
  id_material: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: MaterialStatus,
    default: MaterialStatus.RASCUNHO,
  })
  status: MaterialStatus;

  @ManyToOne(() => Usuario, (usuario) => usuario.materiais_criados)
  @JoinColumn({ name: 'id_usuario_criador' })
  usuario_criador: Usuario;

  @ManyToOne(() => Autor, (autor) => autor.materiais)
  @JoinColumn({ name: 'id_autor' })
  autor: Autor;

  @Column({
    type: 'enum',
    enum: MaterialTipo,
  })
  tipo_material: MaterialTipo;
}

// --- CLASSE FILHA: LIVRO ---
@ChildEntity(MaterialTipo.LIVRO)
export class Livro extends Material {
  @Column({
    type: 'varchar',
    length: 13,
    unique: true,
    nullable: true,
  })
  isbn: string;

  @Column({ type: 'int', nullable: true })
  numero_paginas: number;
}

// --- CLASSE FILHA: ARTIGO ---
@ChildEntity(MaterialTipo.ARTIGO)
export class Artigo extends Material {
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  doi: string;
}

// --- CLASSE FILHA: VIDEO ---
@ChildEntity(MaterialTipo.VIDEO)
export class Video extends Material {
  @Column({ type: 'int', nullable: true })
  duracao_minutos: number;
}