import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── Packages ────────────────────────────────────────────
// Every open source package in the graph
export const packages = sqliteTable('packages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  registry: text('registry').notNull().default('npm'), // npm, pypi, crates, go
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  versionLatest: text('version_latest'),
  description: text('description'),

  // Creator info
  creatorName: text('creator_name'),
  creatorLocation: text('creator_location'),
  creatorGithub: text('creator_github'),
  repoUrl: text('repo_url'),
  npmUrl: text('npm_url'),
  homepageUrl: text('homepage_url'),

  // Wiki / backstory
  backstoryMd: text('backstory_md'),
  backstoryGeneratedBy: text('backstory_generated_by'), // 'human', 'claude-sonnet', etc.
  backstoryVerified: integer('backstory_verified', { mode: 'boolean' }).default(false),

  // Stats
  weeklyDownloads: integer('weekly_downloads').default(0),
  dependentCount: integer('dependent_count').default(0),
  userCount: integer('user_count').default(0), // how many shouldof.dev users depend on this
  donationTotal: real('donation_total').default(0),
  donationCount: integer('donation_count').default(0),
  thankYouCount: integer('thank_you_count').default(0),

  // Claim
  claimed: integer('claimed', { mode: 'boolean' }).default(false),
  claimedBy: text('claimed_by'),
  payoutDestination: text('payout_destination'), // 'personal', 'charity:name', 'opencollective:url'

  // Opt-out (respect anonymity)
  optedOut: integer('opted_out', { mode: 'boolean' }).default(false),

  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ─── Projects ────────────────────────────────────────────
// User's connected GitHub repositories
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerGithubId: text('owner_github_id').notNull(),
  repoUrl: text('repo_url').notNull(),
  repoFullName: text('repo_full_name').notNull(), // e.g. "user/repo"
  name: text('name').notNull(),
  description: text('description'),
  tag: text('tag').notNull().default('other'), // edutech, fintech, healthtech, etc.
  packageCount: integer('package_count').default(0),

  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ─── Project Dependencies ────────────────────────────────
// Edges: project → package (with depth)
export const projectDependencies = sqliteTable('project_dependencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  packageId: integer('package_id').notNull().references(() => packages.id),
  depth: integer('depth').notNull().default(1), // 1 = direct, 2+ = transitive
  depType: text('dep_type').notNull().default('dependency'), // dependency, devDependency, peerDependency
});

// ─── Users ───────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  githubId: text('github_id').notNull().unique(),
  githubUsername: text('github_username').notNull(),
  name: text('name'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  projectCount: integer('project_count').default(0),

  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ─── Thank You Messages ──────────────────────────────────
// Free text messages — no payment required. Words first.
export const thankYouMessages = sqliteTable('thank_you_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  packageId: integer('package_id').notNull().references(() => packages.id),
  authorName: text('author_name').notNull(), // can be anonymous
  message: text('message').notNull(),

  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ─── Donations (Future — Phase 3) ───────────────────────
export const donations = sqliteTable('donations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  packageId: integer('package_id').notNull().references(() => packages.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  message: text('message'),
  status: text('status').notNull().default('held'), // held, claimed, disbursed
  stripePaymentId: text('stripe_payment_id'),

  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ─── Package Connections ─────────────────────────────────
// Package ↔ package relationships (depends_on, peer, dev)
export const packageConnections = sqliteTable('package_connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  packageAId: integer('package_a_id').notNull().references(() => packages.id),
  packageBId: integer('package_b_id').notNull().references(() => packages.id),
  relationship: text('relationship').notNull().default('depends_on'), // depends_on, peer, dev
});

// ─── Relations ───────────────────────────────────────────

export const packagesRelations = relations(packages, ({ many }) => ({
  projectDependencies: many(projectDependencies),
  thankYouMessages: many(thankYouMessages),
  donations: many(donations),
  connectionsA: many(packageConnections, { relationName: 'packageA' }),
  connectionsB: many(packageConnections, { relationName: 'packageB' }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  dependencies: many(projectDependencies),
}));

export const projectDependenciesRelations = relations(projectDependencies, ({ one }) => ({
  project: one(projects, { fields: [projectDependencies.projectId], references: [projects.id] }),
  package: one(packages, { fields: [projectDependencies.packageId], references: [packages.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  thankYouMessages: many(thankYouMessages),
  donations: many(donations),
}));

export const thankYouMessagesRelations = relations(thankYouMessages, ({ one }) => ({
  user: one(users, { fields: [thankYouMessages.userId], references: [users.id] }),
  package: one(packages, { fields: [thankYouMessages.packageId], references: [packages.id] }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, { fields: [donations.userId], references: [users.id] }),
  package: one(packages, { fields: [donations.packageId], references: [packages.id] }),
}));

export const packageConnectionsRelations = relations(packageConnections, ({ one }) => ({
  packageA: one(packages, { fields: [packageConnections.packageAId], references: [packages.id], relationName: 'packageA' }),
  packageB: one(packages, { fields: [packageConnections.packageBId], references: [packages.id], relationName: 'packageB' }),
}));
