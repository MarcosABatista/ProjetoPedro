---
inclusion: auto
description: SecOps — supply chain attack (Docker/npm, isolamento de rede, pinagem), upload de arquivos e web shells. Ativar ao mexer em Docker, dependências ou upload.
---

# SecOps — Supply Chain e Upload de Arquivos

Complementa **secops.md** (§0, §1).

## 14. Prevenção de Supply Chain Attack

Ocorre quando um atacante compromete uma dependência upstream (npm, imagem Docker, plugin CI) e injeta código malicioso consumido silenciosamente. Entra pelo canal de confiança habitual.

### 14.1 Por que é relevante
- Imagens Docker de terceiros (MinIO, Redis, Nginx) podem ser comprometidas no registry
- Pacotes npm com postinstall podem exfiltrar variáveis de ambiente (credenciais, tokens)
- Container comprometido com rede irrestrita pivota para outros serviços internos (ex: banco)

### 14.2 Medidas preventivas obrigatórias

**Isolamento de rede** — cada serviço acessa **apenas** os serviços necessários. Nunca rede flat:
```yaml
# ✅ CORRETO — redes segmentadas
services:
  postgres: { networks: [backend] }
  s3:       { networks: [storage] }
  app:      { networks: [backend, storage] }
networks: { backend: {}, storage: {} }
# ❌ PROIBIDO — todos na rede default (s3 alcança postgres = blast radius máximo)
```
Se o MinIO for comprometido via supply chain, **não** deve ter rota para o PostgreSQL.

**Pinagem de versões/digests** — nunca tags mutáveis em produção:
```yaml
image: minio/minio:latest              # ❌ PROIBIDO em produção
image: minio/minio@sha256:abcdef...    # ✅ digest imutável
```
Dev: tags semânticas (`postgres:16-alpine`) OK; produção usa digests.

**Lockfile + auditoria:** `pnpm-lock.yaml` versionado (nunca no `.gitignore`); `pnpm audit` no CI; revisar dependências novas (mantenedores, releases, transitivas); preferir pacotes com poucas dependências transitivas.

**Limitar capabilities:** containers não rodam como root em produção:
```yaml
services:
  app:
    user: "1000:1000"
    security_opt: [no-new-privileges:true]
    cap_drop: [ALL]
```

**Scan de imagens:** Trivy/Grype/Snyk no CI; bloquear deploy com CVSS ≥ 9.0; reconstruir imagens periodicamente.

### 14.3 Antipadrões

| Antipadrão | Risco | Correção |
|---|---|---|
| `image: xxx:latest` em produção | Imagem muda sem aviso | Digest SHA256 |
| Todos containers na mesma rede | Container comprometido pivota p/ banco | Segmentar redes |
| `pnpm install` sem lockfile no CI | Versões divergem; dependency confusion | `--frozen-lockfile` |
| Ignorar postinstall scripts | Scripts maliciosos no install | `--ignore-scripts` + rodar o necessário |
| Nome similar a pacote interno (typosquatting) | `@empresa/utlis` (typo) | Verificar nome; scoped packages; registry privado |
| Container root com todas capabilities | Escape de container facilitado | `user: 1000:1000` + `cap_drop: ALL` |

### 14.4 Aplicação no docker-compose de dev
Isolamento de rede em dev serve como documentação viva da topologia de produção. Quando o compose de produção for criado, a segmentação já estará definida e testada.

---

## 15. Prevenção de Upload de Arquivos e Web Shells

Upload irrestrito permite enviar script executável (`.php`, `.phtml`, `.asp`, `.jsp`, `.js`, `.sh`). Se processado, o atacante ganha execução remota (Web Shell). Tratar todo arquivo carregado como dado hostil e estático.

### 15.1 Antipadrões

| Antipadrão | Por que não protege | O que fazer |
|---|---|---|
| Blacklist de extensão (barrar `.php`) | `.php5`, `.phtml`, dupla extensão, null byte | Whitelist estrita + validar assinatura real |
| Confiar no `Content-Type` do cliente | Header forjável via curl/interceptor | Validar magic numbers no backend |
| Preservar nome original | Path traversal (§6) + DoS via filesystem | Descartar nome; gerar UUIDv4 server-side |
| Salvar no mesmo disco da aplicação | Interpretador pode executar o script | Object storage externo ou remover exec do diretório |

### 15.2 Validação de assinatura real (magic numbers)
Extensão é só a 1ª barreira. Inspecionar os bytes iniciais para confirmar o formato:
```ts
import { v4 as uuidv4 } from 'uuid'
const EXTENSOES_PERMITIDAS = new Set(['jpg', 'jpeg', 'png', 'pdf'])
const MAGIC_NUMBERS: Record<string, string> = {
  jpg: 'ffd8ff', jpeg: 'ffd8ff', png: '89504e47', pdf: '25504446'
}

async function validarEPrepararUpload(arquivo: { nomeOriginal: string; buffer: Buffer }) {
  const extensao = arquivo.nomeOriginal.split('.').pop()?.toLowerCase()
  if (!extensao || !EXTENSOES_PERMITIDAS.has(extensao))
    throw createError({ status: 400, statusText: 'Tipo de arquivo não permitido' })

  const headerBytes = arquivo.buffer.subarray(0, 4).toString('hex')
  if (!headerBytes.startsWith(MAGIC_NUMBERS[extensao]))
    throw createError({ status: 400, statusText: 'Assinatura do arquivo inválida' })

  const novoNome = `${uuidv4()}.${extensao}` // descartar nome original
  return { novoNome, buffer: arquivo.buffer }
}
```

### 15.3 Isolamento de armazenamento e execução
- **Object storage dedicado:** uploads nunca no filesystem local do container; enviar a buckets isolados (S3/GCS) servindo só conteúdo estático
- **Re-encodificação:** processar imagens com biblioteca gráfica (ex: `sharp`) — redimensionar/re-encodar reconstrói o arquivo e destrói código malicioso em metadados (esteganografia)
- **No-exec:** se local for necessário, montar o volume com flag `noexec` e bloquear interpretadores na rota via servidor web (Nginx/Apache)
