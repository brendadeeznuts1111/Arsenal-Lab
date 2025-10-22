// backend/database/migrate.ts - Database Migration Script
import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';

async function runMigrations() {
  console.log('🚀 Running database migrations...');

  // Initialize database
  const db = new Database('build-arsenal.db', { create: true });

  try {
    // Read and execute schema
    const schemaSQL = readFileSync('./database/schema.sql', 'utf8');
    db.exec(schemaSQL);

    console.log('✅ Database schema applied successfully');

    // Optional: Seed some initial data
    await seedDatabase(db);

    console.log('✅ Database migrations completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

async function seedDatabase(db: Database) {
  console.log('🌱 Seeding initial data...');

  // Seed some preset configurations
  const presets = [
    {
      id: 'preset-react-spa',
      name: 'React SPA Starter',
      description: 'Production-ready React Single Page Application configuration',
      config_json: JSON.stringify({
        publicPath: '/',
        define: { 'process.env.NODE_ENV': '"production"' },
        loader: { '.svg': 'file', '.css': 'css' },
        format: 'esm',
        target: 'browser',
        splitting: true,
        external: ['react', 'react-dom'],
        sourcemap: 'linked',
        minify: { whitespace: true, syntax: true, identifiers: true }
      }),
      preset_type: 'react-spa',
      is_public: 1,
      is_template: 1,
    },
    {
      id: 'preset-node-api',
      name: 'Node.js API Server',
      description: 'Backend API server configuration for Node.js',
      config_json: JSON.stringify({
        publicPath: '/',
        define: { 'process.env.NODE_ENV': '"production"' },
        format: 'esm',
        target: 'node',
        sourcemap: 'linked',
        minify: { whitespace: true, syntax: true }
      }),
      preset_type: 'node-api',
      is_public: 1,
      is_template: 1,
    },
    {
      id: 'preset-development',
      name: 'Development Mode',
      description: 'Fast development build with hot reload support',
      config_json: JSON.stringify({
        publicPath: '/',
        define: { 'process.env.NODE_ENV': '"development"' },
        format: 'esm',
        target: 'browser',
        splitting: false,
        sourcemap: 'inline',
        minify: false
      }),
      preset_type: 'development',
      is_public: 1,
      is_template: 1,
    }
  ];

  const insertQuery = db.prepare(`
    INSERT OR REPLACE INTO build_configs
    (id, name, description, config_json, preset_type, is_public, is_template)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const preset of presets) {
    insertQuery.run(
      preset.id,
      preset.name,
      preset.description,
      preset.config_json,
      preset.preset_type,
      preset.is_public,
      preset.is_template
    );
  }

  console.log(`✅ Seeded ${presets.length} preset configurations`);
}

// Run migrations if called directly
if (import.meta.main) {
  runMigrations();
}

export { runMigrations };
