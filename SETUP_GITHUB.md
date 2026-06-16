# Como Publicar no GitHub

## 1. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `velho-sul`
3. Descrição: "Runner em 3 faixas com tema sul-brasileiro, feito com p5.js"
4. Visibilidade: **Public** (para professor acessar)
5. Inicializar sem README (já temos aqui)
6. Criar repositório

## 2. Inicializar Git Localmente

```bash
cd "C:\Users\joaop\OneDrive\Área de Trabalho\Pastas do Claude\velho-sul"
git init
git add .
git commit -m "Initial commit: Velho Sul game structure"
```

## 3. Conectar ao GitHub

```bash
# Substitute YOUR_USERNAME com seu usuário GitHub
git remote add origin https://github.com/YOUR_USERNAME/velho-sul.git
git branch -M main
git push -u origin main
```

## 4. Configurar GitHub Pages (Opcional)

Permite jogar direto em: `https://seu-usuario.github.io/velho-sul`

1. Vá para Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / folder: `/ (root)`
4. Save

O site ficará online em 1-2 minutos.

## 5. Compartilhar com Professor

Envie o link:
- Repositório: https://github.com/YOUR_USERNAME/velho-sul
- GitHub Pages (se configurado): https://seu-usuario.github.io/velho-sul
- Instruções locais: veja README.md

## Arquivo .git Ignored

Este repositório está pronto para Git, mas ainda não foi inicializado. A pasta `.git` será criada no passo 1.

```
✓ .gitignore        — Já configurado
✓ LICENSE           — MIT
✓ README.md         — Documentação do jogo
✓ Código limpo      — Pronto para publicar
```

---

**Próximas ações:**
1. Crie repositório vazio no GitHub
2. Execute os comandos git acima
3. Envie link para professor com README e INSTRUÇÕES_PROFESSOR.md
