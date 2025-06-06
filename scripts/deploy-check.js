#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICAÇÃO FINAL PARA DEPLOY\n');

// Verificar estrutura do projeto
const checks = [
    {
        name: 'Frontend package.json',
        path: 'frontend/package.json',
        check: (content) => {
            const pkg = JSON.parse(content);
            return pkg.scripts && pkg.scripts.build && pkg.scripts.start;
        }
    },
    {
        name: 'Backend main.py',
        path: 'backend/main.py',
        check: (content) => content.includes('PORT') && content.includes('uvicorn')
    },
    {
        name: 'Backend Procfile',
        path: 'backend/Procfile',
        check: (content) => content.includes('uvicorn') && content.includes('PORT')
    },
    {
        name: 'Backend requirements.txt',
        path: 'backend/requirements.txt',
        check: (content) => content.includes('fastapi') && content.includes('uvicorn')
    },
    {
        name: 'Frontend .env.example',
        path: 'frontend/.env.example',
        check: (content) => content.includes('NEXT_PUBLIC_SUPABASE_URL') && content.includes('JWT_SECRET')
    },
    {
        name: 'Backend .env.example',
        path: 'backend/.env.example',
        check: (content) => content.includes('SUPABASE_URL') && content.includes('JWT_SECRET')
    },
    {
        name: 'Vercel.json',
        path: 'vercel.json',
        check: (content) => {
            try {
                const config = JSON.parse(content);
                return config.buildCommand && config.buildCommand.includes('frontend') && config.framework === 'nextjs';
            } catch {
                return false;
            }
        }
    }
];

let allPassed = true;

checks.forEach(check => {
    try {
        if (fs.existsSync(check.path)) {
            const content = fs.readFileSync(check.path, 'utf8');
            if (check.check(content)) {
                console.log(`✅ ${check.name}`);
            } else {
                console.log(`❌ ${check.name} - Conteúdo incorreto`);
                allPassed = false;
            }
        } else {
            console.log(`❌ ${check.name} - Arquivo não encontrado`);
            allPassed = false;
        }
    } catch (error) {
        console.log(`❌ ${check.name} - Erro: ${error.message}`);
        allPassed = false;
    }
});

console.log('\n📋 RESUMO:');
if (allPassed) {
    console.log('🎉 TODOS OS CHECKS PASSARAM! Projeto pronto para deploy.');
} else {
    console.log('⚠️  Alguns checks falharam. Verifique os itens marcados com ❌');
}

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('1. Vercel: git push origin main');
console.log('2. Railway: Conectar repositório GitHub');
console.log('3. Configurar variáveis de ambiente em ambas as plataformas'); 