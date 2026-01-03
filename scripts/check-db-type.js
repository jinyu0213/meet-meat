#!/usr/bin/env node
// DATABASE_URL을 확인해서 provider를 자동으로 결정하는 스크립트

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

// DATABASE_URL 확인 (환경 변수 또는 .env 파일)
const databaseUrl = process.env.DATABASE_URL || '';

let provider = 'sqlite'; // 기본값

if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  provider = 'postgresql';
} else if (databaseUrl.startsWith('file:')) {
  provider = 'sqlite';
}

// 스키마 파일 업데이트
const updatedSchema = schema.replace(
  /provider\s*=\s*["'](sqlite|postgresql)["']/,
  `provider = "${provider}"`
);

if (schema !== updatedSchema) {
  fs.writeFileSync(schemaPath, updatedSchema, 'utf-8');
  console.log(`✅ Prisma provider가 ${provider}로 설정되었습니다.`);
} else {
  console.log(`ℹ️  Prisma provider는 이미 ${provider}입니다.`);
}

