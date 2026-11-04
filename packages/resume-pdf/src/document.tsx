import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import type { ResumePdfInput } from './types';
import { JakeResumeBody } from './templates/jake';
import { ProfessionalResumeBody } from './templates/professional';

const styles = StyleSheet.create({
  pageJake: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 40,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#111',
  },
  pageProfessional: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111',
  },
});

export function ResumeDocument({ templateId, header, blocks }: ResumePdfInput) {
  const isJake = templateId === 'jake';
  return (
    <Document title={`${header.display_name} Resume`} author={header.display_name} subject='Resume' creator='Monolenz'>
      <Page size='LETTER' style={isJake ? styles.pageJake : styles.pageProfessional}>
        {isJake ? (
          <JakeResumeBody header={header} blocks={blocks} />
        ) : (
          <ProfessionalResumeBody header={header} blocks={blocks} />
        )}
      </Page>
    </Document>
  );
}
