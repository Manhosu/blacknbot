#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Executando verificações pré-deploy...\n');

// Verificar se arquivos essenciais existem
const essentialFiles = [
  'frontend/package.json',
  'frontend/next.config.js',
  'frontend/.env.local',
  'backend/main.py',
  'backend/requirements.txt'
];

let hasErrors = false;

console.log('📋 Verificando arquivos essenciais:');
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - ARQUIVO FALTANDO`);
    if (file.includes('.env.local')) {
      console.log(`   💡 Dica: Copie .env.example para .env.local`);
    }
    hasErrors = true;
  }
});

// Verificar package.json do frontend
console.log('\n📦 Verificando dependências do frontend:');
try {
  const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'next',
    'react',
    'react-dom',
    'tailwindcss'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - DEPENDÊNCIA FALTANDO`);
      hasErrors = true;
    }
  });

  // Verificar scripts
  const requiredScripts = ['dev', 'build', 'start'];
  console.log('\n🔧 Verificando scripts:');
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script} - SCRIPT FALTANDO`);
      hasErrors = true;
    }
  });

} catch (error) {
  console.log('❌ Erro ao ler package.json');
  hasErrors = true;
}

// Verificar requirements.txt do backend
console.log('\n🐍 Verificando dependências do backend:');
try {
  const requirements = fs.readFileSync('backend/requirements.txt', 'utf8');
  
  const requiredPythonDeps = [
    'fastapi',
    'uvicorn',
    'supabase'
  ];

  requiredPythonDeps.forEach(dep => {
    if (requirements.includes(dep)) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - DEPENDÊNCIA FALTANDO`);
      hasErrors = true;
    }
  });

} catch (error) {
  console.log('❌ Erro ao ler requirements.txt');
  hasErrors = true;
}

// Verificar variáveis de ambiente
console.log('\n🔐 Verificando variáveis de ambiente:');
try {
  const envExample = fs.readFileSync('frontend/.env.example', 'utf8');
  const envVars = envExample.match(/^[A-Z_]+=.*/gm) || [];
  
  console.log(`📋 Variáveis necessárias (${envVars.length}):`);
  envVars.forEach(envVar => {
    const varName = envVar.split('=')[0];
    console.log(`   • ${varName}`);
  });

  if (fs.existsSync('frontend/.env.local')) {
    console.log('✅ Arquivo .env.local encontrado');
  } else {
    console.log('⚠️  Arquivo .env.local não encontrado (necessário para desenvolvimento)');
  }

} catch (error) {
  console.log('⚠️  Arquivo .env.example não encontrado');
}

// Verificar build do frontend
console.log('\n🏗️  Testando build do frontend:');
const { execSync } = require('child_process');

try {
  console.log('   Executando npm run build...');
  execSync('cd frontend && npm run build', { stdio: 'pipe' });
  console.log('✅ Build executado com sucesso');
} catch (error) {
  console.log('❌ Erro no build do frontend');
  console.log(error.stdout?.toString() || error.message);
  hasErrors = true;
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ DEPLOY NÃO RECOMENDADO');
  console.log('   Corrija os erros acima antes de fazer deploy');
  process.exit(1);
} else {
  console.log('✅ PRONTO PARA DEPLOY');
  console.log('   Todos os checks passaram com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "feat: prepare for deployment"');
  console.log('   3. git push origin main');
  console.log('   4. Deploy no Vercel/Railway');
} 