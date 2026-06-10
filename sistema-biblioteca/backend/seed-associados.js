const API = process.env.API_URL || 'http://localhost:3000';

const associados = [
  { nomAssoc: 'Ana Clara Oliveira',    email: 'ana.oliveira@gmail.com',      telefone: '(11) 98765-4321', indSexoAssoc: 'F', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '01001-000', dscNomeLogradouroEnder: 'Praça da Sé',           numNumeroEnder: 100, dscComplementoEnder: 'Sala 12',   dscBairroEnder: 'Sé',            dscCidadeEnder: 'São Paulo',      dscUFEnder: 'SP' } },
  { nomAssoc: 'Lucas Gabriel Santos',  email: 'lucas.santos@outlook.com',    telefone: '(21) 97654-3210', indSexoAssoc: 'M', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '20040-020', dscNomeLogradouroEnder: 'Av. Rio Branco',         numNumeroEnder: 251, dscComplementoEnder: 'Andar 8',   dscBairroEnder: 'Centro',        dscCidadeEnder: 'Rio de Janeiro', dscUFEnder: 'RJ' } },
  { nomAssoc: 'Maria Eduarda Lima',    email: 'maria.lima@yahoo.com.br',     telefone: '(31) 99876-5432', indSexoAssoc: 'F', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '30130-000', dscNomeLogradouroEnder: 'Av. Afonso Pena',        numNumeroEnder: 1500, dscComplementoEnder: '',          dscBairroEnder: 'Centro',        dscCidadeEnder: 'Belo Horizonte', dscUFEnder: 'MG' } },
  { nomAssoc: 'Pedro Henrique Costa',  email: 'pedro.costa@hotmail.com',     telefone: '(41) 98543-2109', indSexoAssoc: 'M', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '80060-000', dscNomeLogradouroEnder: 'Rua XV de Novembro',     numNumeroEnder: 700, dscComplementoEnder: 'Loja 3',    dscBairroEnder: 'Centro',        dscCidadeEnder: 'Curitiba',       dscUFEnder: 'PR' } },
  { nomAssoc: 'Juliana Ferreira',      email: 'juliana.ferreira@gmail.com',  telefone: '(51) 99432-1098', indSexoAssoc: 'F', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '90010-150', dscNomeLogradouroEnder: 'Rua dos Andradas',       numNumeroEnder: 1234, dscComplementoEnder: 'Apto 501',  dscBairroEnder: 'Centro Histórico', dscCidadeEnder: 'Porto Alegre',  dscUFEnder: 'RS' } },
  { nomAssoc: 'Rafael Almeida',        email: 'rafael.almeida@gmail.com',    telefone: '(61) 98321-0987', indSexoAssoc: 'M', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '70040-010', dscNomeLogradouroEnder: 'SBS Quadra 2 Bloco E',   numNumeroEnder: 30,  dscComplementoEnder: 'Sala 1401', dscBairroEnder: 'Asa Sul',       dscCidadeEnder: 'Brasília',       dscUFEnder: 'DF' } },
  { nomAssoc: 'Camila Rodrigues',      email: 'camila.rodrigues@outlook.com',telefone: '(71) 97210-9876', indSexoAssoc: 'F', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '40020-000', dscNomeLogradouroEnder: 'Rua Chile',              numNumeroEnder: 55,  dscComplementoEnder: '',          dscBairroEnder: 'Comércio',      dscCidadeEnder: 'Salvador',       dscUFEnder: 'BA' } },
  { nomAssoc: 'Bruno Martins',         email: 'bruno.martins@hotmail.com',   telefone: '(81) 96109-8765', indSexoAssoc: 'M', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '50030-230', dscNomeLogradouroEnder: 'Av. Guararapes',         numNumeroEnder: 250, dscComplementoEnder: 'Sala 302',  dscBairroEnder: 'Santo Antônio', dscCidadeEnder: 'Recife',         dscUFEnder: 'PE' } },
  { nomAssoc: 'Fernanda Souza',        email: 'fernanda.souza@gmail.com',    telefone: '(85) 95098-7654', indSexoAssoc: 'F', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '60060-370', dscNomeLogradouroEnder: 'Rua Barão do Rio Branco', numNumeroEnder: 1820, dscComplementoEnder: '',          dscBairroEnder: 'Centro',        dscCidadeEnder: 'Fortaleza',      dscUFEnder: 'CE' } },
  { nomAssoc: 'Thiago Pereira',        email: 'thiago.pereira@yahoo.com',    telefone: '(91) 94987-6543', indSexoAssoc: 'M', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '66010-020', dscNomeLogradouroEnder: 'Av. Presidente Vargas',  numNumeroEnder: 480, dscComplementoEnder: 'Bloco B',   dscBairroEnder: 'Campina',       dscCidadeEnder: 'Belém',          dscUFEnder: 'PA' } },
  { nomAssoc: 'Isabela Nascimento',    email: 'isabela.nasc@gmail.com',      telefone: '(27) 93876-5432', indSexoAssoc: 'F', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '29010-002', dscNomeLogradouroEnder: 'Av. Jerônimo Monteiro',  numNumeroEnder: 1000, dscComplementoEnder: 'Apto 204',  dscBairroEnder: 'Centro',        dscCidadeEnder: 'Vitória',        dscUFEnder: 'ES' } },
  { nomAssoc: 'Gustavo Barbosa',       email: 'gustavo.barbosa@outlook.com', telefone: '(62) 92765-4321', indSexoAssoc: 'M', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '74003-010', dscNomeLogradouroEnder: 'Av. Goiás',              numNumeroEnder: 636, dscComplementoEnder: '',          dscBairroEnder: 'Centro',        dscCidadeEnder: 'Goiânia',        dscUFEnder: 'GO' } },
  { nomAssoc: 'Larissa Mendes',        email: 'larissa.mendes@gmail.com',    telefone: '(67) 91654-3210', indSexoAssoc: 'F', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '79002-130', dscNomeLogradouroEnder: 'Rua 14 de Julho',        numNumeroEnder: 3120, dscComplementoEnder: 'Sala 5',    dscBairroEnder: 'Centro',        dscCidadeEnder: 'Campo Grande',   dscUFEnder: 'MS' } },
  { nomAssoc: 'Diego Carvalho',        email: 'diego.carvalho@hotmail.com',  telefone: '(65) 90543-2109', indSexoAssoc: 'M', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '78005-300', dscNomeLogradouroEnder: 'Av. Historiador Rubens de Mendonça', numNumeroEnder: 1755, dscComplementoEnder: '', dscBairroEnder: 'Bosque da Saúde', dscCidadeEnder: 'Cuiabá',    dscUFEnder: 'MT' } },
  { nomAssoc: 'Beatriz Araújo',        email: 'beatriz.araujo@yahoo.com.br', telefone: '(84) 99432-1098', indSexoAssoc: 'F', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '59012-300', dscNomeLogradouroEnder: 'Av. Deodoro da Fonseca', numNumeroEnder: 743, dscComplementoEnder: 'Apto 802',  dscBairroEnder: 'Cidade Alta',   dscCidadeEnder: 'Natal',          dscUFEnder: 'RN' } },
  { nomAssoc: 'Felipe Ribeiro',        email: 'felipe.ribeiro@gmail.com',    telefone: '(48) 98321-0987', indSexoAssoc: 'M', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '88010-001', dscNomeLogradouroEnder: 'Rua Felipe Schmidt',     numNumeroEnder: 315, dscComplementoEnder: '',          dscBairroEnder: 'Centro',        dscCidadeEnder: 'Florianópolis',  dscUFEnder: 'SC' } },
  { nomAssoc: 'Carolina Vieira',       email: 'carolina.vieira@outlook.com', telefone: '(98) 97210-9876', indSexoAssoc: 'F', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '65010-440', dscNomeLogradouroEnder: 'Rua Grande',             numNumeroEnder: 470, dscComplementoEnder: 'Loja 7',    dscBairroEnder: 'Centro',        dscCidadeEnder: 'São Luís',       dscUFEnder: 'MA' } },
  { nomAssoc: 'Matheus Gomes',         email: 'matheus.gomes@gmail.com',     telefone: '(86) 96109-8765', indSexoAssoc: 'M', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '64000-060', dscNomeLogradouroEnder: 'Av. Frei Serafim',       numNumeroEnder: 1950, dscComplementoEnder: '',          dscBairroEnder: 'Centro',        dscCidadeEnder: 'Teresina',       dscUFEnder: 'PI' } },
  { nomAssoc: 'Amanda Teixeira',       email: 'amanda.teixeira@hotmail.com', telefone: '(79) 95098-7654', indSexoAssoc: 'F', dscTipoAssoc: 'comum', endereco: { numCEPEnder: '49010-100', dscNomeLogradouroEnder: 'Rua Laranjeiras',         numNumeroEnder: 259, dscComplementoEnder: 'Apto 103',  dscBairroEnder: 'Centro',        dscCidadeEnder: 'Aracaju',        dscUFEnder: 'SE' } },
  { nomAssoc: 'Vinícius Cardoso',      email: 'vinicius.cardoso@gmail.com',  telefone: '(82) 94987-6543', indSexoAssoc: 'M', dscTipoAssoc: 'vip',   endereco: { numCEPEnder: '57020-050', dscNomeLogradouroEnder: 'Rua do Comércio',        numNumeroEnder: 384, dscComplementoEnder: '',          dscBairroEnder: 'Centro',        dscCidadeEnder: 'Maceió',         dscUFEnder: 'AL' } },
];

async function seed() {
  console.log('Inserindo 20 associados...\n');
  let ok = 0, fail = 0;

  for (const a of associados) {
    try {
      const res = await fetch(`${API}/associados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomAssoc: a.nomAssoc,
          email: a.email,
          telefone: a.telefone,
          indSexoAssoc: a.indSexoAssoc,
          dscTipoAssoc: a.dscTipoAssoc,
          endereco: a.endereco,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      console.log(`  OK: ${a.nomAssoc} (${a.dscTipoAssoc.toUpperCase()})`);
      ok++;
    } catch (err) {
      console.log(`  ERRO: ${a.nomAssoc}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nConcluido: ${ok} inseridos, ${fail} erros.`);
}

seed();
