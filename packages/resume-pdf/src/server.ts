import { createElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResumeDocument } from './document';
import type { ResumePdfInput } from './types';

export type { ResumePdfInput } from './types';

export async function renderResumePdf(input: ResumePdfInput): Promise<Uint8Array> {
  const element = createElement(ResumeDocument, input);
  const rendered = await renderToBuffer(element as never);
  return rendered instanceof Uint8Array ? rendered : new Uint8Array(rendered);
}
