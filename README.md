# Coinverting API

- Este repositório contém uma API para conversão de moedas,construída com
  - [Nest.js](https://nestjs.com/)
  - [PostgreSQL](https://www.postgresql.org/)

- A aplicação é containerizada usando
  - [Docker](https://www.docker.com/get-started)

## Índice
- [Coinverting API](#coinverting-api)
  - [Índice](#índice)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Uso](#uso)


## Pré-requisitos
- Antes de começar, você precisará ter o seguinte instalado em sua máquina:
    - [Docker](https://www.docker.com/get-started)
    - [Docker Compose](https://docs.docker.com/compose/install/)


## Instalação
 - Siga os passos abaixo para instalar e configurar a aplicação:

1. **Clone o repositório**:

   - `git clone https://github.com/seu-usuario/coinverting.git`
   - `cd coinverting`

2. **Crie um arquivo .env**:

- Crie um arquivo chamado .env na raiz do projeto e adicione as seguintes
variáveis de ambiente:

- `DB_HOST=db`
- `DB_PORT=5432`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=admin123`
- `DB_DATABASE=converter`
- `APP_PORT=3000`

*Nota: Você pode alterar as credenciais do banco de dados conforme necessário.*


1. **Inicie os containers**:
- Execute o seguinte comando para construir e iniciar os containers:
    - `docker-compose up --build`

- Isso irá:
    - Construir a imagem da aplicação.
    - Iniciar o container do PostgreSQL.
    - Iniciar o container da aplicação.
    - Verifique se tudo está funcionando:

*Após a inicialização, você deve ver mensagens indicando que a aplicação e o*
*banco de dados estão em execução.*
 *API estará disponível em http://localhost:3000 .*

## Uso
**A API oferece endpoints para conversão de moedas.**
**Você pode usar ferramentas como Postman ou cURL para interagir com a API**.

**Exemplos de Endpoints**
1. Converter Moeda:

    - Endpoint: POST /currency/convert
      - Corpo da Requisição:
       - json
        - {
        -   "amount": 100,
        -   "from": "USD",
        -   "to": "EUR"
        - }

    - Resposta:
      - json
        - {
        -   "from": "USD",
        -   "to": "EUR",
        -   "amount": 100,
        -   "convertedAmount": 85.00,
        -   "exchangeRate": 1.1765
        - }

2. Adicionar Moeda:

    - Endpoint: POST /currency/add
      - Corpo da Requisição:
        - json
          - {
          -   "currency": "JPY",
          -   "exchangeRateToUSD": 0.0091,
          -   "isFictional": false
          - }

    - Resposta:
      - json
        - {
        -   "message": "JPY added successfully"
        - }

3. Listar Todas as Moedas:

    - Endpoint: GET /currency
    - Resposta:
      - json
        - [
        -   {
        -     "code": "USD",
        -     "exchangeRateToUSD": 1,
        -     "isFictional": false
        -   },
        -   {
        -     "code": "EUR",
        -     "exchangeRateToUSD": 1.1765,
        -     "isFictional": false
        -   }
        - ]

4. Remover Moeda:

    - Endpoint: DELETE /currency/delete
      - Corpo da Requisição:
        - json
            - {
            -   "currency": "JPY"
            - }

    - Resposta:
      - json
        - {
        -   "message": "The currency JPY has been deleted"
        - }
