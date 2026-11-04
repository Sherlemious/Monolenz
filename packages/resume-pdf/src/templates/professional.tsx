import { Link, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ResumeHeader, VersionBlockDetail } from '@monolenz/types/entities';
import {
  asString,
  asStringArray,
  dataOf,
  displayUrl,
  formatDateRange,
  formatMonthYear,
  groupBlocksByType,
  languageLine,
  skillLines,
} from '../format';

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 20, color: '#1a365d', letterSpacing: 0.2 },
  contact: { marginTop: 6, fontSize: 9.5, color: '#333', lineHeight: 1.4 },
  contactSep: { color: '#888' },
  section: { marginTop: 14 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#1a365d',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderBottomWidth: 1.2,
    borderBottomColor: '#1a365d',
    paddingBottom: 3,
    marginBottom: 8,
  },
  entry: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 11, flexGrow: 1, flexShrink: 1 },
  org: { fontSize: 10.5, marginTop: 2, color: '#222' },
  dates: { fontSize: 9.5, color: '#444', flexShrink: 0 },
  meta: { fontSize: 9.5, color: '#444', marginTop: 2 },
  body: { fontSize: 10, marginTop: 3, lineHeight: 1.4, color: '#222' },
  bullet: { flexDirection: 'row', gap: 6, marginTop: 2, paddingLeft: 2 },
  bulletMark: { fontSize: 10, width: 8, color: '#1a365d' },
  bulletText: { fontSize: 10, flex: 1, lineHeight: 1.35 },
  skillLine: { fontSize: 10, marginBottom: 3, lineHeight: 1.4 },
  link: { color: '#1a365d', textDecoration: 'none' },
});

function ContactLine({ header }: { header: ResumeHeader }) {
  const parts: { key: string; text: string; href?: string }[] = [];
  if (header.location) parts.push({ key: 'location', text: header.location });
  if (header.email) parts.push({ key: 'email', text: header.email, href: `mailto:${header.email}` });
  if (header.phone) parts.push({ key: 'phone', text: header.phone });
  for (const link of header.links) {
    parts.push({ key: link.url, text: displayUrl(link.url), href: link.url });
  }

  return (
    <Text style={styles.contact}>
      {parts.map((part, index) => (
        <Text key={part.key}>
          {index > 0 ? <Text style={styles.contactSep}> · </Text> : null}
          {part.href ? (
            <Link src={part.href} style={styles.link}>
              {part.text}
            </Link>
          ) : (
            part.text
          )}
        </Text>
      ))}
    </Text>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View>
      {items.map((item, index) => (
        <View key={`${index}-${item.slice(0, 24)}`} style={styles.bullet} wrap={false}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function WorkEntry({ block }: { block: VersionBlockDetail }) {
  const data = dataOf(block);
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.row}>
        <Text style={styles.title}>{asString(data.position_title)}</Text>
        <Text style={styles.dates}>{formatDateRange(data.start_date, data.end_date, data.is_current)}</Text>
      </View>
      <Text style={styles.org}>
        {[asString(data.company_name), asString(data.location)].filter(Boolean).join('  ·  ')}
      </Text>
      {asString(data.description) ? <Text style={styles.body}>{asString(data.description)}</Text> : null}
      <Bullets items={asStringArray(data.achievements)} />
    </View>
  );
}

function EducationEntry({ block }: { block: VersionBlockDetail }) {
  const data = dataOf(block);
  const degree = [asString(data.degree_name), asString(data.field_of_study)].filter(Boolean).join(', ');
  const gpa =
    data.gpa != null && asString(data.gpa)
      ? `GPA ${asString(data.gpa)}${data.gpa_scale ? ` / ${asString(data.gpa_scale)}` : ''}`
      : '';
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.row}>
        <Text style={styles.title}>{asString(data.institution_name)}</Text>
        <Text style={styles.dates}>{formatDateRange(data.start_date, data.end_date, data.is_current)}</Text>
      </View>
      <Text style={styles.org}>{[degree, asString(data.location), gpa].filter(Boolean).join('  ·  ')}</Text>
    </View>
  );
}

function ProjectEntry({ block }: { block: VersionBlockDetail }) {
  const data = dataOf(block);
  const tech = asStringArray(data.technologies);
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.row}>
        <Text style={styles.title}>{asString(data.name)}</Text>
        <Text style={styles.dates}>{formatDateRange(data.start_date, data.end_date, data.is_ongoing)}</Text>
      </View>
      {asString(data.description) ? <Text style={styles.body}>{asString(data.description)}</Text> : null}
      {tech.length > 0 ? <Text style={styles.meta}>{tech.join(' · ')}</Text> : null}
      <Bullets items={asStringArray(data.highlights)} />
    </View>
  );
}

function CertificationEntry({ block }: { block: VersionBlockDetail }) {
  const data = dataOf(block);
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.row}>
        <Text style={styles.title}>{asString(data.name)}</Text>
        <Text style={styles.dates}>{formatMonthYear(data.issue_date)}</Text>
      </View>
      <Text style={styles.org}>{asString(data.issuing_organization)}</Text>
    </View>
  );
}

function VolunteerEntry({ block }: { block: VersionBlockDetail }) {
  const data = dataOf(block);
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.row}>
        <Text style={styles.title}>{asString(data.role)}</Text>
        <Text style={styles.dates}>{formatDateRange(data.start_date, data.end_date, data.is_current)}</Text>
      </View>
      <Text style={styles.org}>
        {[asString(data.organization_name), asString(data.cause)].filter(Boolean).join('  ·  ')}
      </Text>
      {asString(data.description) ? <Text style={styles.body}>{asString(data.description)}</Text> : null}
      <Bullets items={asStringArray(data.highlights)} />
    </View>
  );
}

function AwardEntry({ block }: { block: VersionBlockDetail }) {
  const data = dataOf(block);
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.row}>
        <Text style={styles.title}>{asString(data.title)}</Text>
        <Text style={styles.dates}>{formatMonthYear(data.date_received)}</Text>
      </View>
      {asString(data.issuer) ? <Text style={styles.org}>{asString(data.issuer)}</Text> : null}
      {asString(data.description) ? <Text style={styles.body}>{asString(data.description)}</Text> : null}
    </View>
  );
}

function SectionBody({ type, blocks }: { type: string; blocks: VersionBlockDetail[] }) {
  if (type === 'skill') {
    return (
      <View>
        {skillLines(blocks).map((line) => (
          <Text key={line} style={styles.skillLine}>
            {line}
          </Text>
        ))}
      </View>
    );
  }
  if (type === 'language') {
    const line = languageLine(blocks);
    return line ? <Text style={styles.body}>{line}</Text> : null;
  }

  return (
    <View>
      {blocks.map((block) => {
        switch (type) {
          case 'work_experience':
            return <WorkEntry key={block.id} block={block} />;
          case 'education':
            return <EducationEntry key={block.id} block={block} />;
          case 'project':
            return <ProjectEntry key={block.id} block={block} />;
          case 'certification':
            return <CertificationEntry key={block.id} block={block} />;
          case 'volunteer':
            return <VolunteerEntry key={block.id} block={block} />;
          case 'award':
            return <AwardEntry key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </View>
  );
}

export function ProfessionalResumeBody({ header, blocks }: { header: ResumeHeader; blocks: VersionBlockDetail[] }) {
  const sections = groupBlocksByType(blocks);
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.name}>{header.display_name}</Text>
        <ContactLine header={header} />
      </View>
      {sections.map((section) => (
        <View key={section.type} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.label}</Text>
          <SectionBody type={section.type} blocks={section.blocks} />
        </View>
      ))}
    </View>
  );
}
