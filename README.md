# cluster-front

Frontend (React + Vite + Leaflet) dos clusters de portos, rodando em Docker (nginx) num EC2.
Consome a API do `cluster-lambda`.

```
navegador ──> EC2 :80 ──> container nginx ──┬── /         arquivos estáticos (build do Vite)
                                            └── /api/*    proxy ──> Lambda Function URL ──> DynamoDB
```

O nginx repassa `/api` para a Lambda, então o navegador fala com uma origem só e não há CORS.

## Estrutura

```
Dockerfile                    build do Vite (node) + imagem final nginx
docker/default.conf.template  config do nginx; ${LAMBDA_HOST} é preenchido ao subir o container
docker-compose.yml            build da imagem e start do container na porta HTTP_PORT (padrão 80)
```

## Desenvolvimento local

```bash
npm install
npm run dev              # http://localhost:5173
```

Por padrão o Vite repassa `/api` para `http://localhost:3001`. Para isso, rode `npm run local` (ou
`npm run local:mock`) no `cluster-lambda`. Para usar a Lambda real, defina `API_PROXY_TARGET` no `.env`.

Para testar o container na sua máquina:

```bash
cp .env.example .env     # defina LAMBDA_HOST (e HTTP_PORT=8080, se a 80 estiver ocupada)
docker compose up --build
```

## Deploy no EC2

**Pré-requisitos:** a Lambda já publicada (você precisa do host da Function URL) e um EC2 com
Amazon Linux 2023 ou Ubuntu 24.04. No Security Group, libere a porta 80 (e 443, se for usar HTTPS)
para todos e a 22 para o seu IP. Uma `t3.micro`/`t4g.micro` dá conta.

1. **Instale Docker e o plugin Compose no EC2.** O build usa o Buildx, então o plugin buildx também
   precisa estar instalado.

2. **Coloque o projeto no EC2** (git clone, scp, etc.). Não precisa de `node_modules` nem `dist`.

3. **Crie o `.env` no EC2, dentro da pasta do projeto:**
   ```bash
   cp .env.example .env
   # LAMBDA_HOST=<id>.lambda-url.us-east-1.on.aws   (sem https:// e sem barra)
   ```

4. **Build e start (repita a cada nova versão):**
   ```bash
   docker compose up -d --build
   ```
   O build da imagem acontece no próprio EC2, então funciona tanto em instâncias x86 quanto ARM (Graviton).
   Numa instância micro (1 GB de RAM), crie um swap se o `npm ci` ou o build do Vite ficar sem memória.

Use `ec2-user` no Amazon Linux e `ubuntu` no Ubuntu. O EC2 não precisa de credenciais AWS nem de IAM
role: ele só serve arquivos e faz proxy HTTP.

### Comandos úteis no EC2

```bash
cd ~/cluster-front
docker compose ps            # status
docker compose logs -f       # logs do nginx
docker compose restart       # reinicia (ex.: depois de trocar o LAMBDA_HOST no .env)
```

O container sobe sozinho se o EC2 reiniciar (`restart: unless-stopped`).

## Chamar a Lambda direto (sem proxy)

Defina `VITE_API_URL=https://<id>.lambda-url...` no `.env` antes do deploy. Ele é usado como build arg
da imagem. Configure também `ALLOWED_ORIGIN` na Lambda com o endereço do front.
