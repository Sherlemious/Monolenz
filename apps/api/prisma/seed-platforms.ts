/**
 * Seed script: link_platforms table
 * Run with: npx tsx prisma/seed-platforms.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLATFORMS = [
  // Professional
  {
    name: 'linkedin',
    display_name: 'LinkedIn',
    category: 'professional',
    icon: 'linkedin',
    base_url: 'https://linkedin.com',
  },
  { name: 'github', display_name: 'GitHub', category: 'professional', icon: 'github', base_url: 'https://github.com' },
  {
    name: 'stackoverflow',
    display_name: 'Stack Overflow',
    category: 'professional',
    icon: 'stackoverflow',
    base_url: 'https://stackoverflow.com',
  },
  { name: 'devto', display_name: 'Dev.to', category: 'professional', icon: 'devto', base_url: 'https://dev.to' },
  // Portfolio
  { name: 'website', display_name: 'Website', category: 'portfolio', icon: 'globe', base_url: null },
  {
    name: 'dribbble',
    display_name: 'Dribbble',
    category: 'portfolio',
    icon: 'dribbble',
    base_url: 'https://dribbble.com',
  },
  { name: 'behance', display_name: 'Behance', category: 'portfolio', icon: 'behance', base_url: 'https://behance.net' },
  { name: 'medium', display_name: 'Medium', category: 'portfolio', icon: 'medium', base_url: 'https://medium.com' },
  { name: 'youtube', display_name: 'YouTube', category: 'portfolio', icon: 'youtube', base_url: 'https://youtube.com' },
  // Social
  { name: 'twitter', display_name: 'Twitter / X', category: 'social', icon: 'twitter', base_url: 'https://x.com' },
  {
    name: 'instagram',
    display_name: 'Instagram',
    category: 'social',
    icon: 'instagram',
    base_url: 'https://instagram.com',
  },
  {
    name: 'facebook',
    display_name: 'Facebook',
    category: 'social',
    icon: 'facebook',
    base_url: 'https://facebook.com',
  },
  { name: 'tiktok', display_name: 'TikTok', category: 'social', icon: 'tiktok', base_url: 'https://tiktok.com' },
  { name: 'discord', display_name: 'Discord', category: 'social', icon: 'discord', base_url: 'https://discord.com' },
  { name: 'telegram', display_name: 'Telegram', category: 'social', icon: 'telegram', base_url: 'https://t.me' },
  // Contact
  { name: 'email', display_name: 'Email', category: 'contact', icon: 'mail', base_url: null },
];

async function main() {
  console.log('Seeding link_platforms...');

  for (const platform of PLATFORMS) {
    await prisma.link_platforms.upsert({
      where: { name: platform.name },
      update: {
        display_name: platform.display_name,
        category: platform.category,
        icon: platform.icon,
        base_url: platform.base_url,
        is_active: true,
      },
      create: {
        name: platform.name,
        display_name: platform.display_name,
        category: platform.category,
        icon: platform.icon,
        base_url: platform.base_url,
        is_active: true,
      },
    });
    console.log(`  ✓ ${platform.display_name}`);
  }

  console.log(`Done. Seeded ${PLATFORMS.length} platforms.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
