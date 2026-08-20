/**
 * Copy public app data (and auth.users if present) from SOURCE_DATABASE_URL to DATABASE_URL.
 * Run: SOURCE_DATABASE_URL=... DATABASE_URL=... pnpm --filter api exec tsx prisma/copy-to-neon.ts
 */
import { PrismaClient } from '@prisma/client';

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const destUrl = process.env.DATABASE_URL;

if (!sourceUrl || !destUrl) {
  console.error('SOURCE_DATABASE_URL and DATABASE_URL are required');
  process.exit(1);
}

const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
const dest = new PrismaClient({ datasources: { db: { url: destUrl } } });

async function copyTable<T extends Record<string, unknown>>(
  name: string,
  rows: T[],
  create: (row: T) => Promise<unknown>
) {
  console.log(`${name}: ${rows.length}`);
  for (const row of rows) {
    await create(row);
  }
}

async function main() {
  const authUsers = await source.$queryRaw<
    Array<{
      id: string;
      email: string;
      encrypted_password: string | null;
      email_confirmed_at: Date | null;
      created_at: Date | null;
      updated_at: Date | null;
      role: string | null;
    }>
  >`
    SELECT id::text, email, encrypted_password, email_confirmed_at, created_at, updated_at,
           COALESCE(raw_app_meta_data->>'role', 'user') AS role
    FROM auth.users
  `.catch(
    () =>
      [] as Array<{
        id: string;
        email: string;
        encrypted_password: string | null;
        email_confirmed_at: Date | null;
        created_at: Date | null;
        updated_at: Date | null;
        role: string | null;
      }>
  );

  if (authUsers.length) {
    console.log(`auth.users -> users: ${authUsers.length}`);
    for (const user of authUsers) {
      if (!user.email || !user.encrypted_password) continue;
      await dest.users.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email.toLowerCase(),
          password_hash: user.encrypted_password,
          email_verified_at: user.email_confirmed_at,
          role: user.role || 'user',
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    }
  }

  await copyTable('link_platforms', await source.link_platforms.findMany(), (row) =>
    dest.link_platforms.create({ data: row })
  );
  await copyTable('profiles', await source.profiles.findMany(), (row) => dest.profiles.create({ data: row }));
  await copyTable('profile_links', await source.profile_links.findMany(), (row) =>
    dest.profile_links.create({ data: row })
  );
  await copyTable('blocks', await source.blocks.findMany(), (row) => dest.blocks.create({ data: row }));
  await copyTable('block_awards', await source.block_awards.findMany(), (row) =>
    dest.block_awards.create({ data: row })
  );
  await copyTable('block_certifications', await source.block_certifications.findMany(), (row) =>
    dest.block_certifications.create({ data: row })
  );
  await copyTable('block_educations', await source.block_educations.findMany(), (row) =>
    dest.block_educations.create({ data: row })
  );
  await copyTable('block_languages', await source.block_languages.findMany(), (row) =>
    dest.block_languages.create({ data: row })
  );
  await copyTable('block_projects', await source.block_projects.findMany(), (row) =>
    dest.block_projects.create({ data: row })
  );
  await copyTable('block_skills', await source.block_skills.findMany(), (row) =>
    dest.block_skills.create({ data: row })
  );
  await copyTable('block_volunteers', await source.block_volunteers.findMany(), (row) =>
    dest.block_volunteers.create({ data: row })
  );
  await copyTable('block_work_experiences', await source.block_work_experiences.findMany(), (row) =>
    dest.block_work_experiences.create({ data: row })
  );
  await copyTable('versions', await source.versions.findMany(), (row) => dest.versions.create({ data: row }));
  await copyTable('version_blocks', await source.version_blocks.findMany(), (row) =>
    dest.version_blocks.create({ data: row })
  );

  console.log('Copy complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await source.$disconnect();
    await dest.$disconnect();
  });
