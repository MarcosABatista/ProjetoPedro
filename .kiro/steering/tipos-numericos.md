---
inclusion: fileMatch
fileMatchPattern: ['server/**', 'shared/**', 'app/**']
description: Valores numéricos (IDs, contadores, portas) devem ser number/int, nunca string. Ativar ao definir tipos/schemas.
---

# Tipos Numéricos — Número é Número

## Regra

Sempre que um valor for semanticamente numérico (IDs, contadores, quantidades, portas, etc.), ele **deve** ser tipado e trafegado como `number` (ou `int`) em toda a cadeia — do banco de dados ao frontend.

## O que é proibido

- Tipar IDs numéricos como `string` em interfaces, schemas Zod ou refs do Vue
- Usar `z.string().regex(/^\d+$/)` para validar o que é, na verdade, um número inteiro
- Converter número para string apenas para satisfazer uma tipagem incorreta (ex: `String(id)`)
- Receber número do banco e re-tipar como string no TypeScript

## O que é correto

- `z.number().int().positive()` para IDs positivos
- `ref<number | null>(null)` no Vue para valores numéricos que podem estar vazios
- Manter o tipo `number` desde a query SQL até o payload do frontend
- Se o banco retorna `INTEGER`, o TypeScript deve refletir `number`

## Exceções aceitas

- Quando o valor **precisa** ser string por natureza (ex: UUID, hash MD5 hexadecimal, código alfanumérico como `CPF-123`)
- **IDs do banco de origem** (`id_conta`, `id_cliente`) — são hashes MD5 de 32 chars, não inteiros. Ver `ids-banco-origem.md`
- Quando uma API externa exige string (documentar o motivo)
- Portas de rede em arquivos de configuração `.env` (são lidas como string do ambiente)
- **`z.coerce.number()` em schemas Zod de endpoints** — o `USelect` do Nuxt UI converte values para string (limitação do `<select>` HTML nativo). Usar `z.coerce.number().int().positive()` não viola esta regra porque o valor é convertido para `number` na entrada e permanece `number` em toda a lógica downstream. Ver detalhes em `nuxt-server-api.md` e `nuxt-ui.md`.

## Exemplo

```typescript
// ✅ Correto — schema de endpoint que recebe quantidade de USelect
const schema = z.object({
  id_migracao: z.coerce.number().int().positive(),
})
const idMigracao = ref<number | null>(null)

// ✅ Correto — schema de endpoint que recebe ID gerado programaticamente
const schema = z.object({
  id_grupo: z.number().int().positive(),
})

// ❌ Errado — tipar inteiro como string
const schema = z.object({
  id_migracao: z.string().regex(/^\d+$/),
})
const idMigracao = ref('')
```

## IDs hexadecimais — não são números

Os IDs de conta e cliente neste projeto (`gg_conta.id`, `gg_cliente.id`) são **hashes MD5 de 32 caracteres** (`character varying(38)`). Esses **não** se enquadram nesta regra — são strings por natureza. Ver `ids-banco-origem.md` para validação e tipagem correta.

```typescript
// ✅ Correto — IDs hex do banco de origem são string
const idConta = ref<string | null>(null)
const schema = z.object({
  id_conta: z.string().regex(/^[A-Fa-f0-9]{32,38}$/),
})
```

## Contagens e agregações do PostgreSQL (count/bigint)

O driver `pg` retorna `count(*)` e colunas `bigint` como **string** — proposital, para não perder precisão de 64 bits em JS (`Number` só é seguro até 2^53-1). Quando esses valores são semanticamente numéricos (contadores, totais), coaja para `number` na **borda do servidor** com `Number(...)`, e mantenha `number` daí em diante (schema Zod, tipo, payload, UI).

Exemplo real deste projeto: a Introspeccao_Schemas conta tabelas-base por schema (`SELECT count(*) ... AS total_tabelas`); o util coage no `map`:

```ts
const { rows } = await client.query(SQL_LISTAR_SCHEMAS)
return rows.map(linha => ({
  nome: String(linha.nspname),
  totalTabelas: Number(linha.total_tabelas), // count() vem como string do pg → number
}))
```

O schema Zod correspondente valida como inteiro não-negativo:

```ts
totalTabelas: z.number().int().min(0)
```

Cuidado: se `count()` puder exceder `Number.MAX_SAFE_INTEGER` (2^53-1) — improvável para contagem de tabelas, mas possível para contagens massivas de linhas — mantenha como string/`BigInt` e trate explicitamente. Para contadores normais, `Number()` é o correto.

## Motivação

Tratar números como strings gera:
1. Conversões redundantes em cada camada (`Number()`, `String()`, `parseInt()`)
2. Bugs sutis (ex: comparação `"5" !== 5`, serialização JSON inconsistente)
3. Validações duplicadas (regex no Zod + `Number.isFinite` depois)
4. Código mais verboso sem benefício real
