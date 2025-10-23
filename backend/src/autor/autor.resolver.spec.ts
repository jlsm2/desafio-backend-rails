import { Test, TestingModule } from '@nestjs/testing';
import { AutorResolver } from './autor.resolver';
import { AutorService } from './autor.service';
import { AutorInterface } from './graphql/autor.types'; 

// Mock do AutorService
const mockAutorService = {
  findAll: jest.fn().mockResolvedValue([{ id_autor: 1, nome: 'Autor GraphQL Teste' }]),
};

describe('AutorResolver', () => {
  let resolver: AutorResolver;
  let service: AutorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutorResolver,
        { provide: AutorService, useValue: mockAutorService }, 
      ],
    }).compile();

    resolver = module.get<AutorResolver>(AutorResolver);
    service = module.get<AutorService>(AutorService);
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('getAutores', () => {
    it('deve chamar autorService.findAll e retornar o resultado', async () => {
      const expectedResult = [{ id_autor: 1, nome: 'Autor GraphQL Teste' }];
      const result = await resolver.getAutores(); 
      expect(service.findAll).toHaveBeenCalled(); 
      expect(result).toEqual(expectedResult); 
    });
  });
});