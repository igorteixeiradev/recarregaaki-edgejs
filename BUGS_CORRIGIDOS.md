# Bugs encontrados no projeto original e corrigidos

## Autorização e segurança
1. Faltavam verificações de admin em `create`/`edit`/`show` (ex.: qualquer pessoa autenticada via `PostsController.show` lia posts, mesmo rascunhos) e em "Kwanza hoje". Agora cada ação começa com `bouncer.with(...).authorize(...)`.
2. O registo público aceitava `isEmailVerified`, `isBlocked`, `phoneNumber`, etc. (mass assignment). Agora só aceita nome, email e palavra-passe.
3. O token de **verificação de email** servia para **redefinir a palavra-passe** (mesma tabela, sem tipo). Agora os tokens têm tipo, hash, expiração e uso único.
4. `exists` no "esqueci a palavra-passe" revelava que emails estavam registados.
5. Redefinir com token inválido mostrava "sucesso".
6. `logout` sem `await`.
7. Utilizadores bloqueados com sessão aberta continuavam a entrar.
8. Sem limite de tentativas de login.
9. Pacotes editáveis/apagáveis através de qualquer `refillId` na URL; `refillId` do corpo do pedido era confiado.
10. Em produção qualquer 404 dava **500** (as páginas de erro dependiam de `auth`, que não existe num 404).
11. SVG enviado por admin servido na mesma origem (risco de XSS).

## Perda de dados
12. Apagar um pacote ou consumidor apagava os pagamentos em cascata.

## Bugs funcionais
13. Criar um post sem imagem dava 500 (`NULL` numa coluna `NOT NULL`).
14. Pesquisa da loja com texto + categoria ignorava a categoria (precedência do `OR`).
15. A loja mostrava pacotes inativos e o blog mostrava rascunhos.
16. `/loja/abc` e `?categoria=abc` davam 500 (UUID inválido).
17. Atualizar pacote redirecionava para `/dashboard/undefined/pacotes`.
18. Atualizar utilizador exigia sempre palavra-passe e não deixava mudar o email (`exists` em vez de `unique` ignorando o próprio). Nomes de categoria/`otherName` também falhavam ao guardar sem alterar.
19. `page`/`limit` arbitrários (texto, negativos, 100000) na query string.
20. O preço do pacote vinha da query string (`?price=1`) em vez da BD.
21. Dashboard carregava tabelas inteiras só para contar/somar.
22. Cotações Kz sem timeout nem tratamento de erro.
23. `APP_NAME` usado mas não declarado; `SMTP_PORT` devia ser número.

## HTML (alterações mínimas)
- `usr/edit.edge`: o campo era `isBlock` (o validador esperava `isBlocked`), por isso bloquear nunca funcionou.
- `usr/edit.edge`: o texto "Número não definido" era gravado como número de telefone real; passou a `placeholder`.
- `payments/index.edge` e `index.edge`: `payment.user.name` → `payment.user.fullName`.
- `index.edge` (dashboard): `refills.length`/`packages.length`/`users.length` → `totals.*`.
- Nova view `pages/errors/forbidden.edge` (403).
